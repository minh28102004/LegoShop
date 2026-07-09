"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowUpRight,
  Check,
  ChevronDown,
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
  Collection as ApiCollection,
  FrameBackground,
  FrameOption,
  Product,
  ProductComponentPart,
} from "@lego-shop/shared";

import { ROUTES, UI_MODAL_IDS } from "@/config/routes";
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
    cartItem.accessories = [
      { id: item.id, name: item.name, price: item.price, quantity: 1 },
    ];
  }

  useCartStore.getState().addItem(cartItem);
  openCartDrawer();
}

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
      className={`group flex w-full items-center gap-3 rounded-xl px-2.5 py-2 text-left transition-all duration-300 ${
        active
          ? "bg-primary/10 text-primary"
          : "text-text-secondary hover:bg-primary/5 hover:text-text-primary"
      }`}
    >
      <span
        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all duration-300 ${
          active
            ? "border-primary bg-primary text-white shadow-[0_6px_14px_rgba(0,82,204,0.25)]"
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
      className={`catalog-pill shrink-0 rounded-full px-4 py-2 text-xs font-black transition-all duration-300 sm:px-5 ${
        active
          ? "bg-primary text-white shadow-[0_12px_30px_rgba(0,82,204,0.22)]"
          : "bg-white/80 text-primary shadow-sm ring-1 ring-primary/10 hover:-translate-y-0.5 hover:bg-white hover:ring-primary/25"
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
    <div className="flex w-full rounded-[22px] border border-white/70 bg-white/75 p-1.5 shadow-[0_18px_45px_rgba(15,23,42,0.08)] backdrop-blur md:w-auto">
      <button
        type="button"
        onClick={() => setMode("finished")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[17px] px-4 py-2.5 text-xs font-black transition-all duration-300 md:flex-none ${
          mode === "finished"
            ? "bg-slate-950 text-white shadow-xl"
            : "text-slate-500 hover:text-slate-950"
        }`}
      >
        <Grid3X3 className="h-4 w-4" />
        Sản phẩm hoàn thiện
      </button>
      <button
        type="button"
        onClick={() => setMode("retail")}
        className={`flex flex-1 items-center justify-center gap-2 rounded-[17px] px-4 py-2.5 text-xs font-black transition-all duration-300 md:flex-none ${
          mode === "retail"
            ? "bg-slate-950 text-white shadow-xl"
            : "text-slate-500 hover:text-slate-950"
        }`}
      >
        <Package className="h-4 w-4" />
        Mua đồ lẻ
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
    <aside className="catalog-reveal sticky top-24 hidden h-fit w-[230px] shrink-0 rounded-[24px] border border-white/70 bg-white/85 p-4 shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur xl:block">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-2xl bg-slate-950 text-white shadow-lg">
            <SlidersHorizontal className="h-4 w-4" />
          </span>
          <h2 className="text-xl font-black tracking-tight text-slate-950">
            Filters
          </h2>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="text-[11px] font-black text-primary transition-colors hover:text-primary/75"
        >
          Clear all
        </button>
      </div>

      <div className="space-y-5">
        <div>
          <div className="mb-2 flex items-center justify-between border-t border-slate-100 pt-4">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
              Price Range
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
              <p className="text-[11px] font-black uppercase tracking-[0.12em] text-slate-500">
                Build Complexity
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
    <div className="mb-6 rounded-[24px] border border-white/70 bg-white/85 p-4 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur xl:hidden">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-black text-slate-950">
          <SlidersHorizontal className="h-4 w-4 text-primary" />
          Bộ lọc nhanh
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-bold text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          Reset
        </button>
      </div>
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {PRICE_FILTERS.map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setActivePriceFilter(filter)}
            className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition-all duration-300 ${
              activePriceFilter === filter
                ? "border-primary bg-primary text-white shadow-lg"
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
                className={`shrink-0 rounded-full border px-3.5 py-2 text-xs font-bold transition-all duration-300 ${
                  activeComplexity === filter
                    ? "border-slate-950 bg-slate-950 text-white shadow-lg"
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
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState<CatalogMode>("finished");
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
        ] = await Promise.all([
          publicApiClient.products.listProducts({ limit: 100 }),
          publicApiClient.products.listCollections(),
          publicApiClient.products.listFrameOptions({ type: "size" }),
          publicApiClient.products.listFrameBackgrounds(),
          publicApiClient.products.listAccessories(),
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
    () => buildRetailItems(frameOptions, backgrounds, accessories),
    [accessories, backgrounds, frameOptions],
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
          border-radius: 24px;
          background: linear-gradient(135deg, rgba(255,255,255,.95), rgba(0,82,204,.18), rgba(255,200,87,.24));
          opacity: 0;
          transition: opacity .35s ease;
          z-index: 0;
        }
        .catalog-card-glow:hover::before { opacity: 1; }
        .catalog-shine::after {
          content: "";
          position: absolute;
          inset: 0;
          background: linear-gradient(115deg, transparent 0%, transparent 36%, rgba(255,255,255,.42) 48%, transparent 62%, transparent 100%);
          transform: translateX(-120%);
          transition: transform .75s cubic-bezier(.22,1,.36,1);
        }
        .group:hover .catalog-shine::after { transform: translateX(120%); }
        @keyframes catalogFadeUp {
          from { opacity: 0; transform: translateY(18px); }
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
        <div className="container relative mx-auto max-w-7xl px-4 py-10 sm:py-14 lg:py-16">
          <div className="catalog-reveal flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/70 bg-white/75 px-4 py-2 text-xs font-black uppercase tracking-[0.18em] text-primary shadow-sm backdrop-blur">
                <Sparkles className="h-3.5 w-3.5" />
                Bộ sưu tập
              </div>
              <h1 className="max-w-3xl text-[42px] font-black leading-[0.95] tracking-[-0.055em] text-[#1f1f1f] sm:text-6xl lg:text-7xl">
                Our Collection
              </h1>
              <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-slate-600 sm:text-base">
                Discover our curated selection of customizable, high-end modular
                designs. Chọn mẫu hoàn thiện hoặc mua lẻ cấu phần để tự phối
                theo phong cách riêng.
              </p>
            </div>

            <div className="w-full max-w-xl space-y-4 lg:max-w-md">
              <ModeSwitch mode={mode} setMode={setMode} />
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder={
                    mode === "finished"
                      ? "Search finished models..."
                      : "Search frames, backgrounds, accessories..."
                  }
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  className="h-12 w-full rounded-2xl border border-white/70 bg-white/90 pl-11 pr-11 text-sm font-semibold text-slate-900 shadow-[0_16px_45px_rgba(15,23,42,0.08)] outline-none transition-all duration-300 placeholder:text-slate-400 focus:border-primary/40 focus:ring-4 focus:ring-primary/10"
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
            <div className="catalog-reveal mt-9 flex items-center gap-3 overflow-x-auto pb-2 scrollbar-hide">
              <CollectionPill
                active={activeCollectionId === ALL_COLLECTIONS}
                label="All Models"
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

      <main className="container mx-auto max-w-7xl px-4 py-8 sm:py-10">
        <MobileFilterBar
          mode={mode}
          activePriceFilter={activePriceFilter}
          setActivePriceFilter={setActivePriceFilter}
          activeComplexity={activeComplexity}
          setActiveComplexity={setActiveComplexity}
          onReset={resetFilters}
        />

        <div className="flex items-start gap-8">
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
                  Showing{" "}
                  <span className="font-black text-slate-950">
                    {visibleCount}
                  </span>
                  {totalCount ? <span> of {totalCount}</span> : null} {modeName}
                </p>
                {(activePriceFilter !== "Tất cả" ||
                  activeComplexity !== "Tất cả" ||
                  searchQuery) && (
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1.5 text-xs font-black text-primary shadow-sm ring-1 ring-primary/10 transition-all hover:-translate-y-0.5 hover:ring-primary/25"
                  >
                    <RotateCcw className="h-3.5 w-3.5" />
                    Xóa lọc
                  </button>
                )}
              </div>

              <button
                type="button"
                className="group flex w-full items-center justify-between gap-4 rounded-xl border border-white/80 bg-white/90 px-4 py-2.5 text-xs font-black text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/25 hover:text-primary hover:shadow-xl sm:w-auto"
              >
                <span>Sort by: Featured</span>
                <ChevronDown className="h-4 w-4 transition-transform duration-300 group-hover:rotate-180" />
              </button>
            </div>

            {loading ? (
              <ProductSkeleton />
            ) : mode === "finished" ? (
              <FinishedProductsGrid
                products={filteredProducts}
                onAdd={addFinishedProductToCart}
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
      </main>
    </div>
  );
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, index) => (
        <div
          key={index}
          className="overflow-hidden rounded-[24px] border border-white/70 bg-white shadow-sm"
        >
          <div className="aspect-[4/3] animate-pulse bg-gradient-to-br from-[#eee6d8] via-[#f8f4ec] to-[#e9dcc8]" />
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
    <div className="catalog-reveal rounded-[28px] border border-white/70 bg-white/85 px-6 py-16 text-center shadow-[0_18px_55px_rgba(15,23,42,0.08)] backdrop-blur">
      <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
        <Search className="h-7 w-7" />
      </div>
      <p className="mb-2 text-lg font-black text-slate-950">
        Không tìm thấy sản phẩm phù hợp
      </p>
      <p className="mx-auto mb-7 max-w-md text-sm font-medium leading-6 text-slate-500">
        Thử đổi từ khóa, chọn lại bộ sưu tập hoặc bỏ bớt bộ lọc để xem thêm sản
        phẩm.
      </p>
      <button
        type="button"
        onClick={onReset}
        className="inline-flex items-center gap-2 rounded-full bg-primary px-5 py-3 text-sm font-black text-white shadow-[0_18px_35px_rgba(0,82,204,0.22)] transition-all hover:-translate-y-0.5 hover:bg-primary/90"
      >
        <RotateCcw className="h-4 w-4" />
        Xóa bộ lọc
      </button>
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {products.map((product, index) => {
        const productImage = getProductImage(product);
        const parts = getProductParts(product);
        const collectionName = product.collection?.name ?? "Collection";

        return (
          <article
            key={product.id}
            className="catalog-card-reveal catalog-card-glow group relative rounded-[24px] transition-all duration-500 hover:-translate-y-2"
            style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
          >
            <div className="relative z-[1] overflow-hidden rounded-[23px] border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-500 group-hover:shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
              <div className="catalog-shine relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#efe6d5] via-white to-[#d8d0c4]">
                {productImage ? (
                  <Image
                    src={productImage}
                    alt={product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <Package className="h-12 w-12 text-slate-300" />
                  </div>
                )}

                <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                  <span className="rounded-full bg-primary px-3 py-1.5 text-[10px] font-black text-white shadow-lg shadow-primary/20">
                    Customize
                  </span>
                  <button
                    type="button"
                    disabled
                    title="Wishlist sắp có"
                    className="flex h-9 w-9 cursor-not-allowed items-center justify-center rounded-full bg-white/92 text-slate-400 shadow-lg backdrop-blur transition-all duration-300 group-hover:scale-110 group-hover:text-primary"
                  >
                    <Heart className="h-4 w-4" />
                  </button>
                </div>

                <div className="absolute inset-x-0 bottom-0 translate-y-5 bg-gradient-to-t from-black/55 via-black/15 to-transparent p-4 opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <div className="flex items-center gap-2 rounded-2xl bg-white/92 p-2 shadow-xl backdrop-blur">
                    {parts.slice(0, 3).map((part, partIndex) => {
                      const partImage = resolveApiAssetUrl(part.imageUrl);
                      return (
                        <div
                          key={`${part.type}-${part.id ?? partIndex}`}
                          className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-slate-100 ring-1 ring-slate-200"
                          title={`${part.name} x${part.quantity}`}
                        >
                          {partImage ? (
                            <img
                              src={partImage}
                              alt={part.name}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <Layers className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      );
                    })}
                    <span className="min-w-0 flex-1 truncate text-[11px] font-black text-slate-700">
                      {parts.length} thành phần
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-5">
                <div className="mb-4 min-h-[68px]">
                  <h3 className="mb-1 line-clamp-1 text-base font-black tracking-tight text-slate-950 transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>
                  <p className="line-clamp-1 text-xs font-semibold text-slate-500">
                    {collectionName}
                  </p>
                  <p className="mt-3 text-sm font-black text-slate-950">
                    {formatPrice(product.basePrice)}
                  </p>
                </div>

                <div className="grid grid-cols-[1fr_auto] items-center gap-3">
                  <Link
                    href={`${ROUTES.creatorStudio}?productId=${encodeURIComponent(product.id)}`}
                    className="group/link flex items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white px-3 py-3 text-xs font-black text-slate-700 transition-all duration-300 hover:border-primary/30 hover:bg-primary/5 hover:text-primary"
                  >
                    Tùy chỉnh
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover/link:-translate-y-0.5 group-hover/link:translate-x-0.5" />
                  </Link>
                  <button
                    type="button"
                    onClick={() => onAdd(product)}
                    className="flex h-11 w-11 items-center justify-center rounded-full bg-primary text-white shadow-[0_14px_26px_rgba(0,82,204,0.24)] transition-all duration-300 hover:-translate-y-0.5 hover:scale-105 hover:bg-primary/90 active:scale-95"
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
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => (
        <article
          key={`${item.type}-${item.id}`}
          className="catalog-card-reveal catalog-card-glow group relative rounded-[24px] transition-all duration-500 hover:-translate-y-2"
          style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
        >
          <div className="relative z-[1] overflow-hidden rounded-[23px] border border-white/80 bg-white shadow-[0_18px_45px_rgba(15,23,42,0.08)] transition-all duration-500 group-hover:shadow-[0_28px_70px_rgba(15,23,42,0.16)]">
            <div className="catalog-shine relative aspect-[4/3] overflow-hidden bg-gradient-to-br from-[#efe6d5] via-white to-[#d8d0c4]">
              {item.imageUrl ? (
                <Image
                  src={item.imageUrl}
                  alt={item.name}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center">
                  <Package className="h-12 w-12 text-slate-300" />
                </div>
              )}
              <div className="absolute inset-x-0 top-0 flex items-start justify-between p-4">
                <span className="rounded-full bg-slate-950 px-3 py-1.5 text-[10px] font-black text-white shadow-lg">
                  {getRetailTypeLabel(item.type)}
                </span>
                <button
                  type="button"
                  onClick={() => onAdd(item)}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-white/92 text-primary shadow-lg backdrop-blur transition-all duration-300 hover:scale-110 hover:bg-primary hover:text-white"
                  aria-label={`Thêm ${item.name} vào giỏ`}
                >
                  <ShoppingCart className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="p-5">
              <div className="mb-4 min-h-[86px]">
                <h3 className="mb-1 line-clamp-1 text-base font-black tracking-tight text-slate-950 transition-colors group-hover:text-primary">
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
                <p className="mt-3 text-sm font-black text-slate-950">
                  {formatPrice(item.price)}
                </p>
              </div>

              <button
                type="button"
                onClick={() => onAdd(item)}
                className="group/btn flex w-full items-center justify-center gap-2 rounded-2xl bg-primary px-4 py-3 text-xs font-black text-white shadow-[0_14px_26px_rgba(0,82,204,0.22)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-primary/90 active:scale-[0.98]"
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
