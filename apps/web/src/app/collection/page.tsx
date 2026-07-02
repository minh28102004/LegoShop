"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronDown, Heart, Layers, Package, Search, ShoppingCart, X } from "lucide-react";
import type {
  Accessory,
  Collection as ApiCollection,
  FrameBackground,
  FrameOption,
  Product,
  ProductComponentPart,
} from "@lego-shop/shared";

import { ROUTES, UI_MODAL_IDS } from "@/constants";
import { useDebounce } from "@/hooks/useDebounce";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { publicApiClient } from "@/lib/api/public-client";
import { formatPrice } from "@/lib/formatters";
import { useCartStore, type CartItemPart, type CartItemPartType, type SimpleCartItem } from "@/stores/cartStore";
import { useUIStore } from "@/stores/uiStore";

type CatalogMode = "finished" | "retail";
type RetailType = "frame" | "background" | "accessory";

type RetailCatalogItem = {
  id: string;
  type: RetailType;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  source: FrameOption | FrameBackground | Accessory;
};

const ALL_COLLECTIONS = "all";
const PRICE_FILTERS = ["Tất cả", "Dưới 200K", "200K-300K", "Trên 300K"] as const;
const COMPLEXITY = ["Tất cả", "1 nhân vật", "2 nhân vật", "2+ nhân vật"] as const;

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDimension(value: number) {
  return Number.isInteger(value) ? String(value) : String(value).replace(/\.?0+$/, "");
}

function getFrameLabel(option: FrameOption) {
  if (typeof option.widthCm === "number" && typeof option.heightCm === "number") {
    return `${formatDimension(option.widthCm)}x${formatDimension(option.heightCm)}`;
  }

  return option.label || option.name;
}

function getProductImage(product: Product) {
  return resolveApiAssetUrl(product.images[0]) || null;
}

function isActiveStatus(status?: string) {
  return !status || status === "active";
}

function makeCartPart(input: {
  id?: string | null | undefined;
  type: CartItemPartType;
  name: string;
  quantity?: number | null | undefined;
  unitPrice?: number | null | undefined;
  imageUrl?: string | null | undefined;
}): CartItemPart | null {
  const name = input.name.trim();
  if (!name) return null;

  const quantity = Math.max(1, Math.round(input.quantity ?? 1));
  const unitPrice = Math.max(0, Math.round(input.unitPrice ?? 0));
  const part: CartItemPart = {
    type: input.type,
    name,
    quantity,
    unitPrice,
    totalPrice: unitPrice * quantity,
  };

  if (input.id) part.id = input.id;
  if (input.imageUrl !== undefined) part.imageUrl = input.imageUrl;

  return part;
}

function componentPartToCartPart(part: ProductComponentPart, fallbackType: CartItemPartType) {
  return makeCartPart({
    id: part.id,
    type: (part.type || fallbackType) as CartItemPartType,
    name: part.name,
    quantity: part.quantity,
    unitPrice: part.price,
    imageUrl: part.imageUrl,
  });
}

function getProductParts(product: Product): CartItemPart[] {
  const config = product.componentConfig;
  if (!config) {
    return [
      {
        type: "product",
        name: product.name,
        quantity: 1,
        unitPrice: product.basePrice,
        totalPrice: product.basePrice,
        imageUrl: getProductImage(product),
      },
    ];
  }

  const configuredParts = Array.isArray(config.parts)
    ? config.parts
        .map((part) => componentPartToCartPart(part, part.type as CartItemPartType))
        .filter((part): part is CartItemPart => Boolean(part))
    : [];

  if (configuredParts.length > 0) return configuredParts;

  const parts: CartItemPart[] = [];
  const frame = config.frame ? componentPartToCartPart(config.frame, "frame") : null;
  const background = config.background ? componentPartToCartPart(config.background, "background") : null;
  if (frame) parts.push(frame);
  if (background) parts.push(background);

  config.characters?.forEach((part) => {
    const cartPart = componentPartToCartPart(part, "character");
    if (cartPart) parts.push(cartPart);
  });
  config.accessories?.forEach((part) => {
    const cartPart = componentPartToCartPart(part, "accessory");
    if (cartPart) parts.push(cartPart);
  });

  if (parts.length > 0) return parts;

  return [
    {
      type: "product",
      name: product.name,
      quantity: 1,
      unitPrice: product.basePrice,
      totalPrice: product.basePrice,
      imageUrl: getProductImage(product),
    },
  ];
}

function serializeParts(parts: CartItemPart[]) {
  return parts.map((part) => ({
    ...(part.id ? { id: part.id } : {}),
    type: part.type,
    name: part.name,
    quantity: part.quantity,
    unitPrice: part.unitPrice,
    totalPrice: part.totalPrice,
    ...(part.imageUrl ? { imageUrl: part.imageUrl } : {}),
  }));
}

function getCharacterPartCount(product: Product) {
  return getProductParts(product)
    .filter((part) => part.type === "character")
    .reduce((sum, part) => sum + part.quantity, 0);
}

function matchesPriceFilter(price: number, filter: string) {
  if (filter === "Dưới 200K") return price < 200000;
  if (filter === "200K-300K") return price >= 200000 && price <= 300000;
  if (filter === "Trên 300K") return price > 300000;
  return true;
}

function matchesComplexity(product: Product, filter: string) {
  const count = getCharacterPartCount(product);
  if (filter === "1 nhân vật") return count === 1;
  if (filter === "2 nhân vật") return count === 2;
  if (filter === "2+ nhân vật") return count >= 2;
  return true;
}

function getRetailTypeLabel(type: RetailType) {
  if (type === "frame") return "Khung tranh";
  if (type === "background") return "Nền ảnh";
  return "Phụ kiện";
}

function buildRetailItems(
  frameOptions: FrameOption[],
  backgrounds: FrameBackground[],
  accessories: Accessory[],
): RetailCatalogItem[] {
  const frames = frameOptions
    .filter((option) => option.type === "size" && isActiveStatus(option.status))
    .map((option): RetailCatalogItem => ({
      id: option.id,
      type: "frame",
      name: `Khung ${getFrameLabel(option)}`,
      description: option.description,
      price: option.price,
      imageUrl: resolveApiAssetUrl(option.imageUrl),
      source: option,
    }));

  const backgroundItems = backgrounds
    .filter((background) => isActiveStatus(background.status))
    .map((background): RetailCatalogItem => ({
      id: background.id,
      type: "background",
      name: background.title,
      description: background.description,
      price: 0,
      imageUrl: resolveApiAssetUrl(background.imageUrl),
      source: background,
    }));

  const accessoryItems = accessories
    .filter((accessory) => isActiveStatus(accessory.status))
    .map((accessory): RetailCatalogItem => ({
      id: accessory.id,
      type: "accessory",
      name: accessory.name,
      description: null,
      price: accessory.price,
      imageUrl: resolveApiAssetUrl(accessory.imageUrl ?? accessory.iconUrl),
      source: accessory,
    }));

  return [...frames, ...backgroundItems, ...accessoryItems];
}

function openCartDrawer() {
  useCartStore.getState().openCart();
  useUIStore.getState().openModal(UI_MODAL_IDS.CART_DRAWER);
  window.dispatchEvent(new CustomEvent("legoshop:open-cart"));
}

function addFinishedProductToCart(product: Product) {
  const parts = getProductParts(product);
  const framePart = parts.find((part) => part.type === "frame");
  const backgroundPart = parts.find((part) => part.type === "background");
  const imageUrl = getProductImage(product);
  const accessories = parts
    .filter((part) => part.type === "accessory" && part.id)
    .map((part) => ({
      id: part.id as string,
      name: part.name,
      price: part.unitPrice,
      quantity: part.quantity,
    }));

  const item: Omit<SimpleCartItem, "id" | "addedAt" | "totalPrice"> = {
    productId: product.id,
    productName: product.name,
    quantity: 1,
    unitPrice: product.basePrice,
    frameSizeId: framePart?.id ?? `finished:${product.id}`,
    frameSizeLabel: framePart?.name ?? "Sản phẩm hoàn thiện",
    frameColorName: "",
    accessories,
    parts,
    templateId: backgroundPart?.id ?? null,
    designData: {
      type: "FINISHED_PRODUCT",
      source: "collection",
      productId: product.id,
      productName: product.name,
      collectionId: product.collectionId,
      collectionName: product.collection?.name ?? null,
      backgroundId: backgroundPart?.id ?? null,
      componentConfig: product.componentConfig,
      parts: serializeParts(parts),
    },
    previewUrl: imageUrl,
  };

  if (framePart?.id) item.frameOptionId = framePart.id;

  useCartStore.getState().addItem(item);
  openCartDrawer();
}

function addRetailItemToCart(item: RetailCatalogItem) {
  const part = makeCartPart({
    id: item.id,
    type: item.type,
    name: item.name,
    quantity: 1,
    unitPrice: item.price,
    imageUrl: item.imageUrl,
  });
  if (!part) return;

  const cartItem: Omit<SimpleCartItem, "id" | "addedAt" | "totalPrice"> = {
    productId: null,
    productName: item.name,
    quantity: 1,
    unitPrice: item.price,
    frameSizeId: `${item.type}:${item.id}`,
    frameSizeLabel: getRetailTypeLabel(item.type),
    frameColorName: "",
    parts: [part],
    designData: {
      type: "RETAIL_ITEM",
      retailType: item.type,
      sourceId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      price: item.price,
    },
    previewUrl: item.imageUrl,
  };

  if (item.type === "frame") {
    cartItem.frameOptionId = item.id;
    cartItem.frameSizeId = item.id;
    cartItem.frameSizeLabel = item.name;
  }

  if (item.type === "accessory") {
    cartItem.accessories = [{ id: item.id, name: item.name, price: item.price, quantity: 1 }];
  }

  useCartStore.getState().addItem(cartItem);
  openCartDrawer();
}

export default function CollectionPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [frameOptions, setFrameOptions] = useState<FrameOption[]>([]);
  const [backgrounds, setBackgrounds] = useState<FrameBackground[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<CatalogMode>("finished");
  const [activeCollectionId, setActiveCollectionId] = useState(ALL_COLLECTIONS);
  const [activePriceFilter, setActivePriceFilter] = useState<(typeof PRICE_FILTERS)[number]>("Tất cả");
  const [activeComplexity, setActiveComplexity] = useState<(typeof COMPLEXITY)[number]>("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [productsRes, collectionsRes, frameOptionsRes, backgroundsRes, accessoriesRes] = await Promise.all([
          publicApiClient.products.listProducts({ limit: 100 }),
          publicApiClient.products.listCollections(),
          publicApiClient.products.listFrameOptions({ type: "size" }),
          publicApiClient.products.listFrameBackgrounds(),
          publicApiClient.products.listAccessories(),
        ]);

        if (cancelled) return;
        setProducts(productsRes);
        setCollections(collectionsRes.filter((collection) => isActiveStatus(collection.status)));
        setFrameOptions(frameOptionsRes);
        setBackgrounds(backgroundsRes);
        setAccessories(accessoriesRes);
      } catch (error) {
        console.error(error);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchData();
    return () => {
      cancelled = true;
    };
  }, []);

  const normalizedSearch = normalizeSearchText(debouncedSearchQuery);
  const finishedProducts = useMemo(
    () => products.filter((product) => isActiveStatus(product.status) && product.productType !== "retail"),
    [products],
  );
  const retailItems = useMemo(
    () => buildRetailItems(frameOptions, backgrounds, accessories),
    [accessories, backgrounds, frameOptions],
  );

  const filteredProducts = useMemo(
    () =>
      finishedProducts.filter((product) => {
        const collectionName = product.collection?.name ?? "";
        const haystack = normalizeSearchText(`${product.name} ${product.description ?? ""} ${collectionName}`);
        if (normalizedSearch && !haystack.includes(normalizedSearch)) return false;
        if (activeCollectionId !== ALL_COLLECTIONS && product.collectionId !== activeCollectionId) return false;
        if (!matchesPriceFilter(product.basePrice, activePriceFilter)) return false;
        if (!matchesComplexity(product, activeComplexity)) return false;
        return true;
      }),
    [activeCollectionId, activeComplexity, activePriceFilter, finishedProducts, normalizedSearch],
  );

  const filteredRetailItems = useMemo(
    () =>
      retailItems.filter((item) => {
        const haystack = normalizeSearchText(`${item.name} ${item.description ?? ""} ${getRetailTypeLabel(item.type)}`);
        if (normalizedSearch && !haystack.includes(normalizedSearch)) return false;
        if (!matchesPriceFilter(item.price, activePriceFilter)) return false;
        return true;
      }),
    [activePriceFilter, normalizedSearch, retailItems],
  );

  const visibleCount = mode === "finished" ? filteredProducts.length : filteredRetailItems.length;

  return (
    <div className="min-h-screen bg-background">
      <div className="border-b border-border bg-white">
        <div className="container mx-auto max-w-7xl px-4 pb-0 pt-10">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-primary">Bộ sưu tập</p>
          <h1 className="mb-2 text-3xl font-bold tracking-tight text-text-primary md:text-4xl">
            Khung LEGO Luvin
          </h1>
          <p className="mb-6 max-w-2xl text-sm font-light text-text-secondary">
            Chọn sản phẩm hoàn thiện đã set đủ cấu phần, hoặc mua lẻ từng khung, nền ảnh và phụ kiện.
          </p>

          <div className="mb-5 flex w-full max-w-xl rounded-full border border-border bg-background p-1">
            <button
              type="button"
              onClick={() => setMode("finished")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition ${
                mode === "finished" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Sản phẩm hoàn thiện
            </button>
            <button
              type="button"
              onClick={() => setMode("retail")}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-bold transition ${
                mode === "retail" ? "bg-primary text-white shadow-sm" : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Mua đồ lẻ
            </button>
          </div>

          <div className="relative mb-0 max-w-sm">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
            <input
              type="text"
              placeholder={mode === "finished" ? "Tìm sản phẩm hoàn thiện..." : "Tìm khung, nền, phụ kiện..."}
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              className="w-full rounded-full border border-border bg-background py-2.5 pl-11 pr-4 text-sm font-medium transition-all placeholder:text-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-primary"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>

          {mode === "finished" ? (
            <div className="mt-6 flex items-center gap-0 overflow-x-auto scrollbar-hide">
              <button
                type="button"
                onClick={() => setActiveCollectionId(ALL_COLLECTIONS)}
                className={`-mb-px shrink-0 border-b-2 px-5 py-3 text-sm font-medium transition-all ${
                  activeCollectionId === ALL_COLLECTIONS
                    ? "border-primary text-primary"
                    : "border-transparent text-text-secondary hover:text-text-primary"
                }`}
              >
                Tất cả
              </button>
              {collections.map((collection) => (
                <button
                  key={collection.id}
                  type="button"
                  onClick={() => setActiveCollectionId(collection.id)}
                  className={`-mb-px shrink-0 border-b-2 px-5 py-3 text-sm font-medium transition-all ${
                    activeCollectionId === collection.id
                      ? "border-primary text-primary"
                      : "border-transparent text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {collection.name}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      <div className="border-b border-border bg-white">
        <div className="container mx-auto flex max-w-7xl items-center gap-2 overflow-x-auto px-4 py-3 scrollbar-hide">
          <span className="shrink-0 text-xs font-medium text-text-muted">Ngân sách:</span>
          {PRICE_FILTERS.map((filter) => (
            <button
              key={filter}
              type="button"
              onClick={() => setActivePriceFilter(filter)}
              className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                activePriceFilter === filter
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-white text-text-secondary hover:border-primary/50 hover:text-primary"
              }`}
            >
              {filter}
            </button>
          ))}
          {mode === "finished" ? (
            <>
              <span className="mx-1 h-4 w-px shrink-0 bg-border" />
              <span className="shrink-0 text-xs font-medium text-text-muted">Nhân vật:</span>
              {COMPLEXITY.map((filter) => (
                <button
                  key={filter}
                  type="button"
                  onClick={() => setActiveComplexity(filter)}
                  className={`shrink-0 rounded-full border px-3 py-1.5 text-xs font-medium transition-all ${
                    activeComplexity === filter
                      ? "border-primary bg-primary text-white"
                      : "border-border bg-white text-text-secondary hover:border-primary/50 hover:text-primary"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </>
          ) : null}
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-4 py-8">
        <div className="mb-6 flex items-center justify-between">
          <span className="text-sm text-text-muted">
            <span className="font-semibold text-text-primary">{visibleCount}</span>{" "}
            {mode === "finished" ? "sản phẩm hoàn thiện" : "món lẻ"}
          </span>
          <div className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-white px-4 py-2 text-xs font-medium text-text-secondary transition-all hover:border-primary/50">
            <span>Sắp xếp: Mặc định</span>
            <ChevronDown className="h-3.5 w-3.5" />
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-5 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="overflow-hidden rounded-2xl border border-border bg-white">
                <div className="aspect-square animate-pulse bg-[#F8F4F0]" />
                <div className="space-y-2 p-4">
                  <div className="h-4 w-3/4 rounded-full bg-[#F8F4F0]" />
                  <div className="h-3 w-1/2 rounded-full bg-[#F8F4F0]" />
                  <div className="mt-4 h-10 w-full rounded-xl bg-[#F8F4F0]" />
                </div>
              </div>
            ))}
          </div>
        ) : mode === "finished" ? (
          <FinishedProductsGrid products={filteredProducts} onAdd={addFinishedProductToCart} />
        ) : (
          <RetailItemsGrid items={filteredRetailItems} onAdd={addRetailItemToCart} />
        )}

        {!loading && visibleCount === 0 ? (
          <div className="py-20 text-center">
            <Search className="mx-auto mb-4 h-10 w-10 text-text-muted" />
            <p className="mb-2 font-semibold text-text-primary">Không tìm thấy sản phẩm phù hợp</p>
            <p className="mb-6 text-sm text-text-muted">Thử đổi từ khóa hoặc bỏ bớt bộ lọc.</p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setActiveCollectionId(ALL_COLLECTIONS);
                setActivePriceFilter("Tất cả");
                setActiveComplexity("Tất cả");
              }}
              className="text-sm font-medium text-primary hover:underline"
            >
              Xóa bộ lọc
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

function FinishedProductsGrid({
  products,
  onAdd,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {products.map((product) => {
        const productImage = getProductImage(product);
        const parts = getProductParts(product);
        const collectionName = product.collection?.name ?? "Chưa gắn bộ sưu tập";

        return (
          <div
            key={product.id}
            className="group overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-4px_rgb(0_0_0/0.10)]"
          >
            <div className="relative aspect-square overflow-hidden bg-[#F8F4F0]">
              {productImage ? (
                <Image
                  src={productImage}
                  alt={product.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-10 w-10 text-text-muted" />
                </div>
              )}

              <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-text-primary shadow-sm">
                {collectionName}
              </span>

              <button
                type="button"
                disabled
                title="Wishlist sắp có"
                className="absolute right-3 top-3 flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full bg-white/90 text-text-muted opacity-0 shadow-sm backdrop-blur-sm transition-opacity group-hover:opacity-100"
              >
                <Heart className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="p-4">
              <h3 className="mb-1 truncate text-sm font-semibold text-text-primary">{product.name}</h3>
              <p className="mb-3 text-base font-bold text-text-primary">{formatPrice(product.basePrice)}</p>

              <div className="mb-4 space-y-1.5">
                {parts.slice(0, 4).map((part, index) => {
                  const partImage = resolveApiAssetUrl(part.imageUrl);
                  return (
                    <div key={`${part.type}-${part.id ?? index}`} className="flex items-center gap-2 rounded-lg bg-background px-2 py-1.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-md bg-white">
                        {partImage ? (
                          <img src={partImage} alt={part.name} className="h-full w-full object-cover" />
                        ) : (
                          <Layers className="h-3.5 w-3.5 text-text-muted" />
                        )}
                      </div>
                      <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-text-secondary">
                        {part.name} x{part.quantity}
                      </span>
                      <span className="text-[11px] font-bold text-text-primary">{formatPrice(part.totalPrice)}</span>
                    </div>
                  );
                })}
                {parts.length > 4 ? (
                  <p className="px-2 text-[11px] font-semibold text-text-muted">+{parts.length - 4} thành phần khác</p>
                ) : null}
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link
                  href={`${ROUTES.creatorStudio}?productId=${encodeURIComponent(product.id)}`}
                  className="flex w-full items-center justify-center rounded-xl border border-border bg-surface py-2.5 text-xs font-semibold text-text-secondary transition-colors hover:bg-gray-50"
                >
                  Tùy chỉnh
                </Link>
                <button
                  type="button"
                  onClick={() => onAdd(product)}
                  className="flex w-full items-center justify-center gap-1.5 rounded-xl bg-[hsl(var(--color-cta))] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[hsl(var(--color-cta-hover))]"
                >
                  <ShoppingCart className="h-3.5 w-3.5" />
                  Mua ngay
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function RetailItemsGrid({
  items,
  onAdd,
}: {
  items: RetailCatalogItem[];
  onAdd: (item: RetailCatalogItem) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((item) => (
        <div
          key={`${item.type}-${item.id}`}
          className="group overflow-hidden rounded-2xl border border-border bg-white transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_8px_32px_-4px_rgb(0_0_0/0.10)]"
        >
          <div className="relative aspect-square overflow-hidden bg-[#F8F4F0]">
            {item.imageUrl ? (
              <Image
                src={item.imageUrl}
                alt={item.name}
                fill
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Package className="h-10 w-10 text-text-muted" />
              </div>
            )}
            <span className="absolute left-3 top-3 rounded-full bg-white/95 px-2.5 py-1 text-[10px] font-black text-text-primary shadow-sm">
              {getRetailTypeLabel(item.type)}
            </span>
          </div>

          <div className="p-4">
            <h3 className="mb-1 truncate text-sm font-semibold text-text-primary">{item.name}</h3>
            {item.description ? (
              <p className="mb-2 line-clamp-2 min-h-[34px] text-xs leading-5 text-text-muted">{item.description}</p>
            ) : (
              <p className="mb-2 min-h-[34px] text-xs leading-5 text-text-muted">Mua riêng để tự phối trong thiết kế.</p>
            )}
            <p className="mb-4 text-base font-bold text-text-primary">{formatPrice(item.price)}</p>

            <button
              type="button"
              onClick={() => onAdd(item)}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-[hsl(var(--color-cta))] py-2.5 text-xs font-semibold text-white transition-colors hover:bg-[hsl(var(--color-cta-hover))]"
            >
              <ShoppingCart className="h-3.5 w-3.5" />
              Thêm vào giỏ
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
