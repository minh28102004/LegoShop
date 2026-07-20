"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Image from "next/image";
import {
  Check,
  ChevronDown,
  Eye,
  Grid3X3,
  Heart,
  Layers,
  Package,
  Plus,
  RotateCcw,
  Search,
  ShoppingCart,
  SlidersHorizontal,
  Sparkles,
  X,
} from "lucide-react";
import { useDebounce } from "@lego-shop/hooks";
import { formatCurrency as formatPrice } from "@lego-shop/shared";
import type {
  Accessory,
  CharacterPart,
  Collection as ApiCollection,
  FrameBackground,
  FrameOption,
  Product,
  ProductComponentPart,
} from "@lego-shop/shared";

import { UI_MODAL_IDS } from "@/config/routes";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { publicApiClient } from "@/lib/api/public-client";
import {
  useCartStore,
  type CartItemPart,
  type CartItemPartType,
  type SimpleCartItem,
} from "@/features/cart/store";
import { useUIStore } from "@/features/ui/store";
import { ALL_COLLECTIONS } from "@/modules/lego-frame/data/lego-frame.data";
import type {
  CatalogMode,
  RetailCatalogItem,
  RetailType,
} from "@/modules/lego-frame/types/lego-frame.types";
import { CharacterBuilderShop } from "@/modules/lego-frame/components/CharacterBuilderShop";

const PRICE_FILTERS = [
  "Tất cả",
  "Dưới 200K",
  "200K-300K",
  "Trên 300K",
] as const;
const COMPLEXITY = [
  "Tất cả",
  "1 nhân vật",
  "2 nhân vật",
  "2+ nhân vật",
] as const;

function normalizeSearchText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function formatDimension(value: number) {
  return Number.isInteger(value)
    ? String(value)
    : String(value).replace(/\.?0+$/, "");
}

function getFrameLabel(option: FrameOption) {
  if (
    typeof option.widthCm === "number" &&
    typeof option.heightCm === "number"
  ) {
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

function componentPartToCartPart(
  part: ProductComponentPart,
  fallbackType: CartItemPartType,
) {
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
        .map((part) =>
          componentPartToCartPart(part, part.type as CartItemPartType),
        )
        .filter((part): part is CartItemPart => Boolean(part))
    : [];

  if (configuredParts.length > 0) return configuredParts;

  const parts: CartItemPart[] = [];
  const frame = config.frame
    ? componentPartToCartPart(config.frame, "frame")
    : null;
  const background = config.background
    ? componentPartToCartPart(config.background, "background")
    : null;
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
  if (type === "character_part") return "Bộ phận nhân vật";
  return "Phụ kiện trang trí";
}

function getProductTypeLabel(product: Product) {
  if (product.productType === "premade_character") return "Nhân vật ráp sẵn";
  if (product.productType === "diy_kit") return "Bộ DIY";
  return "Thiết kế hoàn thiện";
}

function buildRetailItems(
  frameOptions: FrameOption[],
  backgrounds: FrameBackground[],
  accessories: Accessory[],
  characterParts: CharacterPart[],
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

  const characterPartItems = characterParts
    .filter((part) => isActiveStatus(part.status))
    .map((part): RetailCatalogItem => ({
      id: part.id,
      type: "character_part",
      name: part.name,
      description: `Part ${part.type} dùng để tự ráp nhân vật LEGO.`,
      price: Math.max(0, part.priceAdjustment),
      imageUrl: resolveApiAssetUrl(part.imageUrl),
      source: part,
    }));

  return [...frames, ...backgroundItems, ...accessoryItems, ...characterPartItems];
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
    cartItem.accessories = [
      { id: item.id, name: item.name, price: item.price, quantity: 1 },
    ];
  }

  useCartStore.getState().addItem(cartItem);
  openCartDrawer();
}

/* -------------------------------------------------------------------------- */
/* Shared image handling                                                      */
/* -------------------------------------------------------------------------- */

/**
 * Stable image frame used by every catalog card. Renders a soft fallback
 * (icon + label) whenever there is no source, or the image fails to load,
 * so cards never show a blank/broken image area.
 */
function CatalogImageBox({
  src,
  alt,
  fit = "contain",
  className = "",
  children,
}: {
  src: string | null;
  alt: string;
  fit?: "contain" | "cover";
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div
      className={`catalog-shine relative aspect-[4/3] min-h-[188px] overflow-hidden bg-gradient-to-br from-[#f3ecdf] via-white to-[#e8e0d1] ${className}`}
    >
      <CatalogImage key={src ?? "missing"} src={src} alt={alt} fit={fit} />
      {children}
    </div>
  );
}

function CatalogImage({
  src,
  alt,
  fit,
}: {
  src: string | null;
  alt: string;
  fit: "contain" | "cover";
}) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return (
      <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-slate-300">
        <Package className="h-9 w-9" strokeWidth={1.5} />
        <span className="text-[11px] font-semibold text-slate-400">
          Chưa có ảnh
        </span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
      onError={() => setErrored(true)}
      className={`transition-transform duration-700 ease-out group-hover:scale-[1.05] ${
        fit === "contain" ? "object-contain p-5" : "object-cover"
      }`}
    />
  );
}

/** Small square thumbnail used inside the "parts" hover strip, with its own fallback. */
function PartThumb({ src, alt }: { src: string | null; alt: string }) {
  const [errored, setErrored] = useState(false);
  const showFallback = !src || errored;

  return (
    <div
      className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200/70"
      title={alt}
    >
      {showFallback ? (
        <Layers className="h-4 w-4 text-slate-400" />
      ) : (
        <img
          src={src as string}
          alt={alt}
          className="h-full w-full object-cover"
          onError={() => setErrored(true)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Filter UI                                                                  */
/* -------------------------------------------------------------------------- */

function FilterOption({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2.5 text-left transition-all duration-300 ${
        active
          ? "bg-primary/10 text-primary"
          : "text-text-secondary hover:bg-primary/5 hover:text-text-primary"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-300 ${
          active
            ? "border-primary bg-primary text-white shadow-sm"
            : "border-slate-300 bg-white group-hover:border-primary/50"
        }`}
      >
        {active ? <Check className="h-3 w-3" /> : null}
      </span>
      <span className="text-xs font-semibold leading-tight">{label}</span>
    </button>
  );
}

function CollectionPill({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`catalog-pill shrink-0 rounded-full px-3.5 py-1.5 text-xs font-bold transition-all duration-300 sm:px-4 ${
        active
          ? "bg-primary text-white shadow-[0_10px_24px_-12px_rgba(0,82,204,0.45)]"
          : "bg-white/80 text-primary/90 ring-1 ring-primary/10 hover:-translate-y-0.5 hover:bg-white hover:ring-primary/25"
      }`}
    >
      {label}
    </button>
  );
}

function ModeSwitch({
  mode,
  setMode,
}: {
  mode: CatalogMode;
  setMode: (mode: CatalogMode) => void;
}) {
  return (
    <div className="grid w-full grid-cols-3 rounded-2xl border border-white/70 bg-white/75 p-1 shadow-[0_10px_24px_-16px_rgba(15,23,42,0.25)] backdrop-blur">
      <button
        type="button"
        onClick={() => setMode("finished")}
        className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-bold transition-all duration-300 ${
          mode === "finished"
            ? "bg-slate-950 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-950"
        }`}
      >
        <Grid3X3 className="h-4 w-4" />
        <span className="hidden sm:inline">Mẫu có sẵn</span>
        <span className="sm:hidden">Mẫu</span>
      </button>
      <button
        type="button"
        onClick={() => setMode("character")}
        className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-bold transition-all duration-300 ${
          mode === "character"
            ? "bg-slate-950 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-950"
        }`}
      >
        <Layers className="h-4 w-4" />
        <span className="hidden sm:inline">Ráp nhân vật</span>
        <span className="sm:hidden">Ráp LEGO</span>
      </button>
      <button
        type="button"
        onClick={() => setMode("retail")}
        className={`flex min-w-0 items-center justify-center gap-2 rounded-xl px-2 py-2.5 text-xs font-bold transition-all duration-300 ${
          mode === "retail"
            ? "bg-slate-950 text-white shadow-sm"
            : "text-slate-500 hover:text-slate-950"
        }`}
      >
        <Package className="h-4 w-4" />
        Linh kiện
      </button>
    </div>
  );
}

function FilterPanel({
  mode,
  activePriceFilter,
  setActivePriceFilter,
  activeComplexity,
  setActiveComplexity,
  onReset,
}: {
  mode: CatalogMode;
  activePriceFilter: (typeof PRICE_FILTERS)[number];
  setActivePriceFilter: (value: (typeof PRICE_FILTERS)[number]) => void;
  activeComplexity: (typeof COMPLEXITY)[number];
  setActiveComplexity: (value: (typeof COMPLEXITY)[number]) => void;
  onReset: () => void;
}) {
  return (
    <aside className="catalog-reveal sticky top-20 hidden h-fit w-[224px] shrink-0 rounded-[22px] border border-[#e9edf3] bg-white/80 p-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.14)] backdrop-blur xl:block">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-slate-800 text-white shadow-sm">
            <SlidersHorizontal className="h-3.5 w-3.5" />
          </span>
          <h2 className="text-base font-bold tracking-tight text-slate-950">
            Bộ lọc
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-semibold text-primary transition-colors hover:text-primary/75"
        >
          Xóa tất cả
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <div className="mb-2 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
              Khoảng giá
            </p>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="space-y-1">
            {PRICE_FILTERS.map((filter) => (
              <FilterOption
                key={filter}
                label={filter}
                active={activePriceFilter === filter}
                onClick={() => setActivePriceFilter(filter)}
              />
            ))}
          </div>
        </div>

        {mode === "finished" ? (
          <div>
            <div className="mb-2 flex items-center justify-between border-t border-slate-100 pt-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-slate-500">
                Độ phức tạp
              </p>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </div>
            <div className="space-y-1">
              {COMPLEXITY.map((filter) => (
                <FilterOption
                  key={filter}
                  label={filter}
                  active={activeComplexity === filter}
                  onClick={() => setActiveComplexity(filter)}
                />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function MobileFilterBar({
  mode,
  activePriceFilter,
  setActivePriceFilter,
  activeComplexity,
  setActiveComplexity,
  onReset,
}: {
  mode: CatalogMode;
  activePriceFilter: (typeof PRICE_FILTERS)[number];
  setActivePriceFilter: (value: (typeof PRICE_FILTERS)[number]) => void;
  activeComplexity: (typeof COMPLEXITY)[number];
  setActiveComplexity: (value: (typeof COMPLEXITY)[number]) => void;
  onReset: () => void;
}) {
  return (
    <div className="mb-6 rounded-[20px] border border-[#e9edf3] bg-white/85 p-4 shadow-[0_10px_30px_-18px_rgba(15,23,42,0.14)] backdrop-blur xl:hidden">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-bold text-slate-950">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Bộ lọc nhanh
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Đặt lại
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {PRICE_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActivePriceFilter(filter)}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
              activePriceFilter === filter
                ? "border-primary bg-primary text-white shadow-sm"
                : "border-slate-200 bg-white text-slate-600 hover:border-primary/50 hover:text-primary"
            }`}
          >
            {filter}
          </button>
        ))}
        {mode === "finished"
          ? COMPLEXITY.map((filter) => (
              <button
                key={filter}
                type="button"
                onClick={() => setActiveComplexity(filter)}
                className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-semibold transition-all duration-300 ${
                  activeComplexity === filter
                    ? "border-slate-950 bg-slate-950 text-white shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-slate-950/40 hover:text-slate-950"
                }`}
              >
                {filter}
              </button>
            ))
          : null}
      </div>
    </div>
  );
}

export function LegoFramePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [collections, setCollections] = useState<ApiCollection[]>([]);
  const [frameOptions, setFrameOptions] = useState<FrameOption[]>([]);
  const [backgrounds, setBackgrounds] = useState<FrameBackground[]>([]);
  const [accessories, setAccessories] = useState<Accessory[]>([]);
  const [characterParts, setCharacterParts] = useState<CharacterPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<CatalogMode>("finished");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeCollectionId, setActiveCollectionId] = useState(ALL_COLLECTIONS);
  const [activePriceFilter, setActivePriceFilter] =
    useState<(typeof PRICE_FILTERS)[number]>("Tất cả");
  const [activeComplexity, setActiveComplexity] =
    useState<(typeof COMPLEXITY)[number]>("Tất cả");
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearchQuery = useDebounce(searchQuery, 200);

  useEffect(() => {
    let cancelled = false;

    async function fetchData() {
      try {
        const [
          productsRes,
          collectionsRes,
          frameOptionsRes,
          backgroundsRes,
          accessoriesRes,
          characterPartsRes,
        ] = await Promise.all([
          publicApiClient.products.listProducts({ limit: 100 }),
          publicApiClient.products.listCollections(),
          publicApiClient.products.listFrameOptions({ type: "size" }),
          publicApiClient.products.listFrameBackgrounds(),
          publicApiClient.products.listAccessories(),
          publicApiClient.products.listCharacterParts(),
        ]);

        if (cancelled) return;
        setProducts(productsRes);
        setCollections(
          collectionsRes.filter((collection) =>
            isActiveStatus(collection.status),
          ),
        );
        setFrameOptions(frameOptionsRes);
        setBackgrounds(backgroundsRes);
        setAccessories(accessoriesRes);
        setCharacterParts(characterPartsRes);
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
    () =>
      products.filter(
        (product) =>
          isActiveStatus(product.status) && product.productType !== "retail",
      ),
    [products],
  );
  const retailItems = useMemo(
    () => buildRetailItems(frameOptions, backgrounds, accessories, characterParts),
    [accessories, backgrounds, characterParts, frameOptions],
  );

  const filteredProducts = useMemo(
    () =>
      finishedProducts.filter((product) => {
        const collectionName = product.collection?.name ?? "";
        const haystack = normalizeSearchText(
          `${product.name} ${product.description ?? ""} ${collectionName}`,
        );
        if (normalizedSearch && !haystack.includes(normalizedSearch))
          return false;
        if (
          activeCollectionId !== ALL_COLLECTIONS &&
          product.collectionId !== activeCollectionId
        )
          return false;
        if (!matchesPriceFilter(product.basePrice, activePriceFilter))
          return false;
        if (!matchesComplexity(product, activeComplexity)) return false;
        return true;
      }),
    [
      activeCollectionId,
      activeComplexity,
      activePriceFilter,
      finishedProducts,
      normalizedSearch,
    ],
  );

  const filteredRetailItems = useMemo(
    () =>
      retailItems.filter((item) => {
        const haystack = normalizeSearchText(
          `${item.name} ${item.description ?? ""} ${getRetailTypeLabel(item.type)}`,
        );
        if (normalizedSearch && !haystack.includes(normalizedSearch))
          return false;
        if (!matchesPriceFilter(item.price, activePriceFilter)) return false;
        return true;
      }),
    [activePriceFilter, normalizedSearch, retailItems],
  );

  const visibleCount =
    mode === "finished" ? filteredProducts.length : filteredRetailItems.length;
  const totalCount =
    mode === "finished" ? finishedProducts.length : retailItems.length;
  const modeName = mode === "finished" ? "sản phẩm hoàn thiện" : "món lẻ";

  const resetFilters = () => {
    setSearchQuery("");
    setActiveCollectionId(ALL_COLLECTIONS);
    setActivePriceFilter("Tất cả");
    setActiveComplexity("Tất cả");
  };

  return (
    <div className="min-h-screen overflow-hidden bg-[#f8f3e8] text-slate-950">
      <style>{`
        .catalog-reveal { animation: catalogFadeUp .55s cubic-bezier(.22,1,.36,1) both; }
        .catalog-card-reveal { animation: catalogFadeUp .55s cubic-bezier(.22,1,.36,1) both; }
        .catalog-pill { transform: translateZ(0); }
        .catalog-card-glow::before {
          content: "";
          position: absolute;
          inset: -1px;
          border-radius: 22px;
          background: linear-gradient(135deg, rgba(255,255,255,.9), rgba(0,82,204,.14), rgba(255,200,87,.18));
          opacity: 0;
          transition: opacity .35s ease;
          z-index: 0;
        }
        .catalog-card-glow:hover::before { opacity: .8; }
        .catalog-shine::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 0%, transparent 38%, rgba(255,255,255,.28) 48%, transparent 60%, transparent 100%);
          transform: translateX(-120%);
          transition: transform .75s cubic-bezier(.22,1,.36,1);
        }
        .group:hover .catalog-shine::after { transform: translateX(120%); }
        @keyframes catalogFadeUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (prefers-reduced-motion: reduce) {
          .catalog-reveal,
          .catalog-card-reveal { animation: none; }
          .catalog-shine::after { display: none; }
        }
      `}</style>

      <section className="relative border-b border-[#eee4d3]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(255,255,255,0.95),transparent_26%),radial-gradient(circle_at_85%_20%,rgba(0,82,204,0.13),transparent_24%),linear-gradient(180deg,rgba(255,255,255,0.62),rgba(248,243,232,0))]" />
        <div className="container relative mx-auto max-w-7xl px-4 py-8 sm:py-10 lg:py-12">
          <div className="catalog-reveal flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-3.5 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-primary shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Bộ sưu tập
              </div>
              <h1 className="max-w-3xl text-4xl font-extrabold leading-[1.02] tracking-tight text-[#1f1f1f] sm:text-5xl lg:text-6xl">
                Our Collection
              </h1>
              <p className="mt-4 max-w-xl text-sm font-medium leading-6 text-slate-600 sm:text-[15px] sm:leading-7">
                Bộ sưu tập tranh ghép LEGO tùy chỉnh, chất lượng cao. Chọn mẫu
                hoàn thiện hoặc mua lẻ cấu phần để tự phối theo phong cách
                riêng.
              </p>
            </div>

            <div className="w-full max-w-xl space-y-3 lg:max-w-sm">
              <ModeSwitch mode={mode} setMode={setMode} />
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    mode === "finished"
                      ? "Tìm mẫu hoàn thiện..."
                      : "Tìm khung, nền ảnh, phụ kiện..."
                  }
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-12 w-full appearance-none rounded-2xl border border-[#e4edf5] bg-white/90 pl-11 pr-11 text-sm font-semibold text-slate-900 shadow-[0_10px_28px_-16px_rgba(15,23,42,0.16)] outline-none ring-0 transition-all duration-300 placeholder:text-slate-400 placeholder:font-medium focus:border-primary/40 focus:outline-none focus:ring-4 focus:ring-primary/10"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 transition-all hover:bg-slate-100 hover:text-primary"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
          </div>

          {mode === "finished" ? (
            <div className="catalog-reveal mt-6 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
              <CollectionPill
                active={activeCollectionId === ALL_COLLECTIONS}
                label="Tất cả mẫu"
                onClick={() => setActiveCollectionId(ALL_COLLECTIONS)}
              />
              {collections.map((collection) => (
                <CollectionPill
                  key={collection.id}
                  active={activeCollectionId === collection.id}
                  label={collection.name}
                  onClick={() => setActiveCollectionId(collection.id)}
                />
              ))}
            </div>
          ) : null}
        </div>
      </section>

      <main className="container mx-auto max-w-7xl px-4 py-7 sm:py-8">
        {mode === "character" ? (
          <CharacterBuilderShop parts={characterParts} loading={loading} />
        ) : (
          <>
        <MobileFilterBar
          mode={mode}
          activePriceFilter={activePriceFilter}
          setActivePriceFilter={setActivePriceFilter}
          activeComplexity={activeComplexity}
          setActiveComplexity={setActiveComplexity}
          onReset={resetFilters}
        />

        <div className="flex items-start gap-6">
          <FilterPanel
            mode={mode}
            activePriceFilter={activePriceFilter}
            setActivePriceFilter={setActivePriceFilter}
            activeComplexity={activeComplexity}
            setActiveComplexity={setActiveComplexity}
            onReset={resetFilters}
          />

          <section className="min-w-0 flex-1">
            <div className="catalog-reveal mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex flex-wrap items-center gap-3">
                <p className="text-sm font-semibold text-slate-500">
                  Hiển thị{" "}
                  <span className="font-bold text-slate-950">
                    {visibleCount}
                  </span>
                  {totalCount ? <span> / {totalCount}</span> : null} {modeName}
                </p>
                {(activePriceFilter !== "Tất cả" ||
                  activeComplexity !== "Tất cả" ||
                  searchQuery) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-primary shadow-sm ring-1 ring-primary/10 transition-all hover:-translate-y-0.5 hover:ring-primary/25"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Xóa lọc
                  </button>
                )}
              </div>

              <button
                type="button"
                className="group flex h-10 w-full items-center justify-between gap-4 rounded-full border border-white/80 bg-white/90 px-4 text-xs font-semibold text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary sm:w-auto"
              >
                <span>Sắp xếp: Nổi bật</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>
            </div>

            {loading ? (
              <ProductSkeleton />
            ) : mode === "finished" ? (
              <FinishedProductsGrid
                products={filteredProducts}
                onAdd={addFinishedProductToCart}
                onView={setSelectedProduct}
              />
            ) : (
              <RetailItemsGrid
                items={filteredRetailItems}
                onAdd={addRetailItemToCart}
              />
            )}

            {!loading && visibleCount === 0 ? (
              <EmptyCatalogState onReset={resetFilters} />
            ) : null}
          </section>
        </div>
          </>
        )}
      </main>
      {selectedProduct ? (
        <ProductDetailModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          onAdd={(product) => {
            addFinishedProductToCart(product);
            setSelectedProduct(null);
          }}
        />
      ) : null}
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[22px] border border-[#eef1f5] bg-white shadow-sm"
        >
          <div className="aspect-[4/3] min-h-[188px] animate-pulse bg-gradient-to-br from-[#eee6d8] via-[#f8f4ec] to-[#e9dcc8]" />
          <div className="space-y-3 p-5">
            <div className="h-4 w-3/4 animate-pulse rounded-full bg-[#efe7da]" />
            <div className="h-3 w-1/2 animate-pulse rounded-full bg-[#efe7da]" />
            <div className="mt-4 h-10 w-full animate-pulse rounded-2xl bg-[#efe7da]" />
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyCatalogState({ onReset }: { onReset: () => void }) {
  return (
    <div className="catalog-reveal rounded-[24px] border border-[#e9edf3] bg-white/85 px-6 py-16 text-center shadow-[0_10px_30px_-18px_rgba(15,23,42,0.14)] backdrop-blur">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Search className="h-7 w-7" />
      </div>
      <p className="mb-2 text-lg font-bold text-slate-950">
        Không tìm thấy sản phẩm phù hợp
      </p>
      <p className="mx-auto mb-7 max-w-md text-sm font-medium leading-6 text-slate-500">
        Thử đổi từ khóa, chọn lại bộ sưu tập hoặc bỏ bớt bộ lọc để xem thêm sản
        phẩm.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-bold text-white shadow-[0_14px_28px_-12px_rgba(0,82,204,0.4)] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
      >
        <RotateCcw className="h-4 w-4" />
        Xóa bộ lọc
      </button>
    </div>
  );
}

function ProductDetailModal({
  product,
  onClose,
  onAdd,
}: {
  product: Product;
  onClose: () => void;
  onAdd: (product: Product) => void;
}) {
  const parts = getProductParts(product);
  const imageUrl = getProductImage(product);

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-slate-950/55 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      role="dialog"
      aria-modal="true"
      aria-label={`Chi tiết ${product.name}`}
      onMouseDown={(event) => {
        if (event.currentTarget === event.target) onClose();
      }}
    >
      <div className="max-h-[92vh] w-full max-w-5xl overflow-y-auto bg-white shadow-2xl sm:max-h-[88vh]">
        <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 bg-white/95 px-5 py-4 backdrop-blur">
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase text-primary">{getProductTypeLabel(product)}</p>
            <h2 className="truncate text-lg font-extrabold text-slate-950">{product.name}</h2>
          </div>
          <button type="button" onClick={onClose} className="flex h-10 w-10 shrink-0 items-center justify-center text-slate-500 transition hover:bg-slate-100 hover:text-slate-950" title="Đóng">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="grid lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[320px] bg-slate-100 lg:min-h-[560px]">
            {imageUrl ? <img src={imageUrl} alt={product.name} className="absolute inset-0 h-full w-full object-contain p-6" /> : <Package className="absolute left-1/2 top-1/2 h-20 w-20 -translate-x-1/2 -translate-y-1/2 text-slate-300" />}
          </div>
          <div className="p-5 sm:p-7">
            <p className="text-sm leading-6 text-slate-600">{product.description || "Thiết kế đã được admin hoàn thiện và sẵn sàng để đặt mua."}</p>
            <div className="my-6 flex items-end justify-between border-y border-slate-200 py-5">
              <div>
                <p className="text-xs font-bold uppercase text-slate-400">Giá bán</p>
                <p className="mt-1 text-2xl font-extrabold text-slate-950">{formatPrice(product.basePrice)}</p>
              </div>
              <span className="bg-emerald-50 px-3 py-1.5 text-xs font-bold text-emerald-700">Thiết kế sẵn</span>
            </div>
            <div>
              <div className="mb-3 flex items-center justify-between">
                <h3 className="text-sm font-extrabold text-slate-950">Thành phần sản phẩm</h3>
                <span className="text-xs font-semibold text-slate-400">{parts.length} loại</span>
              </div>
              <div className="max-h-[280px] space-y-2 overflow-y-auto pr-1">
                {parts.map((part, index) => {
                  const partImage = resolveApiAssetUrl(part.imageUrl);
                  return (
                    <div key={`${part.type}-${part.id ?? index}`} className="flex items-center gap-3 border border-slate-200 p-2.5">
                      <div className="relative h-12 w-12 shrink-0 overflow-hidden bg-slate-50">
                        {partImage ? <img src={partImage} alt="" className="h-full w-full object-contain" /> : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-xs font-bold text-slate-900">{part.name}</p>
                        <p className="mt-1 text-[11px] font-semibold text-slate-500">{part.quantity} × {formatPrice(part.unitPrice)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <button type="button" onClick={() => onAdd(product)} className="mt-7 flex h-12 w-full items-center justify-center gap-2 bg-primary px-5 text-sm font-bold text-white transition hover:bg-primary/90">
              <ShoppingCart className="h-4 w-4" />
              Mua thiết kế này
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function FinishedProductsGrid({
  products,
  onAdd,
  onView,
}: {
  products: Product[];
  onAdd: (product: Product) => void;
  onView: (product: Product) => void;
}) {
  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {products.map((product, index) => {
        const productImage = getProductImage(product);
        const parts = getProductParts(product);
        const collectionName = product.collection?.name ?? "Bộ sưu tập";

        return (
          <article
            key={product.id}
            className="catalog-card-reveal catalog-card-glow group relative rounded-[22px] transition-all duration-500 hover:-translate-y-1.5"
            style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
          >
            <div className="relative z-[1] overflow-hidden rounded-[21px] border border-[#eef1f5] bg-white shadow-[0_10px_30px_-16px_rgba(15,23,42,0.14)] transition-all duration-500 group-hover:shadow-[0_20px_45px_-18px_rgba(15,23,42,0.22)]">
              <CatalogImageBox
                src={productImage}
                alt={product.name}
                fit="contain"
              >
                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
                  <span className="rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold text-white shadow-sm">
                    Chọn mẫu
                  </span>
                  <button
                    type="button"
                    disabled
                    title="Wishlist sắp có"
                    className="flex h-8 w-8 cursor-not-allowed items-center justify-center rounded-full bg-white/90 text-slate-400 opacity-70 shadow-sm backdrop-blur transition-all duration-300"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-0 translate-y-4 bg-gradient-to-t from-black/50 via-black/10 to-transparent p-3 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2 rounded-xl bg-white/92 p-1.5 shadow-md backdrop-blur">
                    {parts.slice(0, 3).map((part, partIndex) => (
                      <PartThumb
                        key={`${part.type}-${part.id ?? partIndex}`}
                        src={resolveApiAssetUrl(part.imageUrl)}
                        alt={`${part.name} x${part.quantity}`}
                      />
                    ))}
                    <span className="min-w-0 flex-1 truncate text-[11px] font-semibold text-slate-700">
                      {parts.length} thành phần
                    </span>
                  </div>
                </div>
              </CatalogImageBox>

              <div className="p-5">
                <div className="mb-4 min-h-[68px]">
                  <h3 className="mb-1 line-clamp-1 text-base font-bold tracking-tight text-slate-950 transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>
                  <p className="line-clamp-1 text-xs font-semibold text-slate-500">
                    {collectionName}
                  </p>
                  <p className="mt-3 text-sm font-bold text-slate-950">
                    {formatPrice(product.basePrice)}
                  </p>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onView(product)}
                    className="group/link flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-bold text-slate-700 transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    Xem thiết kế
                    <Eye className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-[0_10px_22px_-10px_rgba(0,82,204,0.5)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-primary/90 active:scale-95"
                    aria-label={`Thêm ${product.name} vào giỏ`}
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>
            </div>
          </article>
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
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => (
        <article
          key={`${item.type}-${item.id}`}
          className="catalog-card-reveal catalog-card-glow group relative rounded-[22px] transition-all duration-500 hover:-translate-y-1.5"
          style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
        >
          <div className="relative z-[1] overflow-hidden rounded-[21px] border border-[#eef1f5] bg-white shadow-[0_10px_30px_-16px_rgba(15,23,42,0.14)] transition-all duration-500 group-hover:shadow-[0_20px_45px_-18px_rgba(15,23,42,0.22)]">
            <CatalogImageBox src={item.imageUrl} alt={item.name} fit="contain">
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3.5">
                <span className="rounded-full bg-slate-800/90 px-2.5 py-1 text-[10px] font-bold text-white shadow-sm backdrop-blur">
                  {getRetailTypeLabel(item.type)}
                </span>
                <button
                  type="button"
                  onClick={() => onAdd(item)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-primary shadow-sm backdrop-blur transition-all duration-300 hover:scale-105 hover:bg-primary hover:text-white"
                  aria-label={`Thêm ${item.name} vào giỏ`}
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              </div>
            </CatalogImageBox>

            <div className="p-5">
              <div className="mb-4 min-h-[86px]">
                <h3 className="mb-1 line-clamp-1 text-base font-bold tracking-tight text-slate-950 transition-colors group-hover:text-primary">
                  {item.name}
                </h3>
                {item.description ? (
                  <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                    {item.description}
                  </p>
                ) : (
                  <p className="line-clamp-2 text-xs font-semibold leading-5 text-slate-500">
                    Mua riêng để tự phối trong thiết kế của bạn.
                  </p>
                )}
                <p className="mt-3 text-sm font-bold text-slate-950">
                  {formatPrice(item.price)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onAdd(item)}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-bold text-white shadow-[0_10px_22px_-10px_rgba(0,82,204,0.4)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 active:scale-[0.98]"
              >
                <ShoppingCart className="h-4 w-4 transition-transform group-hover/btn:-rotate-6" />
                Thêm vào giỏ
              </button>
            </div>
          </div>
        </article>
      ))}
    </div>
  );
}
