"use client";

import { useDebounce } from "@lego-shop/hooks";
import type {
  Accessory,
  CharacterPart,
  Collection,
  FrameBackground,
  FrameOption,
  FrameSize,
  Product,
  PublicProductsMeta,
  PublicProductsQuery,
  PublicProductsSort,
} from "@lego-shop/shared";
import {
  Boxes,
  LayoutGrid,
  PackageSearch,
  Search,
  SlidersHorizontal,
  UserRound,
  X,
} from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import toast from "react-hot-toast";

import { Container } from "@/components/layout/Container";
import { SearchableMultiSelect } from "@/components/ui/SearchableMultiSelect";
import { Select } from "@/components/ui/Select";
import { useI18n } from "@/lib/i18n/useI18n";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { publicApiClient } from "@/lib/api/public-client";
import { CharacterBuilderShop } from "@/modules/lego-frame/components/CharacterBuilderShop";
import { PRODUCT_DETAIL_TRANSLATIONS } from "@/modules/home/data/product-detail.translations";
import { ProductCard } from "@/modules/home/components/ProductCard";
import { ProductTemplateDetailModal } from "@/modules/home/components/ProductTemplateDetailModal";
import type { HomeFeaturedProduct } from "@/modules/home/types/home.types";
import { CollectionFilterDrawer } from "@/modules/collection/components/CollectionFilterDrawer";
import { CollectionPagination } from "@/modules/collection/components/CollectionPagination";
import { CollectionRetailGrid } from "@/modules/collection/components/CollectionRetailGrid";
import {
  COLLECTION_TRANSLATIONS,
  type CollectionTranslations,
} from "@/modules/collection/data/collection.translations";
import type {
  CollectionFilters,
  CollectionRetailItem,
  CollectionTab,
} from "@/modules/collection/types/collection.types";

const PAGE_SIZE = 12;
const PAGE_SIZE_OPTIONS = [8, 12, 16, 20] as const;
const DEFAULT_META: PublicProductsMeta = {
  page: 1,
  pageSize: PAGE_SIZE,
  totalItems: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPreviousPage: false,
};
const SORT_OPTIONS: PublicProductsSort[] = [
  "featured",
  "newest",
  "popular",
  "price_asc",
  "price_desc",
  "name_asc",
];
const TABS: Array<{
  value: CollectionTab;
  icon: typeof LayoutGrid;
}> = [
  { value: "templates", icon: LayoutGrid },
  { value: "characters", icon: UserRound },
  { value: "parts", icon: Boxes },
];

function positiveInteger(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
}

function resolvePageSize(value: string | null) {
  const parsed = positiveInteger(value, PAGE_SIZE);
  return PAGE_SIZE_OPTIONS.includes(
    parsed as (typeof PAGE_SIZE_OPTIONS)[number],
  )
    ? parsed
    : PAGE_SIZE;
}

function optionalNumber(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function uniqueQueryValues(values: string[]) {
  return Array.from(
    new Set(
      values
        .flatMap((value) => value.split(","))
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  );
}

function queryStringList(
  searchParams: Pick<URLSearchParams, "getAll">,
  ...keys: string[]
) {
  return uniqueQueryValues(keys.flatMap((key) => searchParams.getAll(key)));
}

function queryNumberList(
  searchParams: Pick<URLSearchParams, "getAll">,
  ...keys: string[]
) {
  return queryStringList(searchParams, ...keys)
    .map(Number)
    .filter((value) => Number.isFinite(value) && value >= 0);
}

function queryBoolean(value: string | null) {
  return value === "true" ? true : undefined;
}

function isAbortError(error: unknown) {
  return error instanceof Error && error.name === "AbortError";
}

function resolveTab(value: string | null): CollectionTab {
  return value === "characters" || value === "parts" ? value : "templates";
}

function resolveSort(value: string | null): PublicProductsSort {
  return SORT_OPTIONS.includes(value as PublicProductsSort)
    ? (value as PublicProductsSort)
    : "featured";
}

type ProductImageSource = Product & {
  imageUrl?: string | null;
  primaryImage?: string | null;
  primaryImageUrl?: string | null;
  thumbnail?: string | null;
  thumbnailUrl?: string | null;
};

function nonEmptyImageUrl(value: unknown): string | null {
  if (typeof value === "string") {
    const normalized = value.trim();
    return normalized.length > 0 ? normalized : null;
  }

  if (!value || typeof value !== "object") return null;

  const image = value as Record<string, unknown>;
  return (
    nonEmptyImageUrl(image.thumbnailUrl) ??
    nonEmptyImageUrl(image.primaryImageUrl) ??
    nonEmptyImageUrl(image.imageUrl) ??
    nonEmptyImageUrl(image.url) ??
    nonEmptyImageUrl(image.src)
  );
}

function productImage(product: Product) {
  const source = product as ProductImageSource;
  const firstImage = Array.isArray(product.images)
    ? (product.images.map(nonEmptyImageUrl).find(Boolean) ?? null)
    : null;

  return resolveApiAssetUrl(
    nonEmptyImageUrl(source.thumbnailUrl) ??
      nonEmptyImageUrl(source.thumbnail) ??
      nonEmptyImageUrl(source.primaryImageUrl) ??
      nonEmptyImageUrl(source.primaryImage) ??
      nonEmptyImageUrl(source.imageUrl) ??
      firstImage ??
      null,
  );
}

function toFeaturedProduct(product: Product): HomeFeaturedProduct {
  return {
    id: product.id || "",
    slug: product.slug || "",
    title: product.name || "Figure Lab",
    description: product.description ?? null,
    basePrice: Math.max(0, Number(product.basePrice) || 0),
    originalPrice:
      product.originalPrice === null || product.originalPrice === undefined
        ? null
        : Math.max(0, Number(product.originalPrice) || 0),
    orderCount: Math.max(0, Number(product.orderCount) || 0),
    characterCount: Math.max(0, Number(product.characterCount) || 0),
    accessoryCount: Math.max(
      0,
      Number(product.charmCount ?? product.accessoryCount) || 0,
    ),
    includedItemLabels: Array.isArray(product.includedItemLabels)
      ? product.includedItemLabels.filter(Boolean)
      : [],
    badge: null,
    featured: product.featured === true,
    href: `/collection?product=${encodeURIComponent(product.slug || product.id)}`,
    imageUrl: productImage(product),
  };
}

function activeFilterCount(filters: CollectionFilters) {
  return Object.values(filters).filter(
    (value) =>
      value !== undefined &&
      value !== "" &&
      value !== false &&
      (!Array.isArray(value) || value.length > 0),
  ).length;
}

function collectionIsActive(collection: Collection) {
  return !collection.status || collection.status === "active";
}

function retailItems(
  frameOptions: FrameOption[],
  backgrounds: FrameBackground[],
  accessories: Accessory[],
  characterParts: CharacterPart[],
): CollectionRetailItem[] {
  const frames = frameOptions
    .filter((item) => item.type === "size")
    .map((item) => ({
      id: item.id,
      type: "frame" as const,
      name: item.label || item.name,
      description: item.description ?? null,
      price: Math.max(0, item.price || 0),
      imageUrl: resolveApiAssetUrl(item.imageUrl),
    }));
  const backgroundItems = backgrounds.map((item) => ({
    id: item.id,
    type: "background" as const,
    name: item.title,
    description: item.description ?? null,
    price: 0,
    imageUrl: resolveApiAssetUrl(item.thumbnailUrl || item.imageUrl),
  }));
  const accessoryItems = accessories.map((item) => ({
    id: item.id,
    type: "accessory" as const,
    name: item.name,
    description: null,
    price: Math.max(0, item.price || 0),
    imageUrl: resolveApiAssetUrl(item.imageUrl || item.iconUrl),
  }));
  const partItems = characterParts.map((item) => ({
    id: item.id,
    type: "character_part" as const,
    name: item.name,
    description: null,
    price: Math.max(0, item.priceAdjustment || 0),
    imageUrl: resolveApiAssetUrl(item.imageUrl),
  }));

  return [...frames, ...backgroundItems, ...accessoryItems, ...partItems];
}

function ProductSkeleton() {
  return (
    <div className="overflow-hidden rounded-[22px] border border-border/70 bg-white">
      <div className="aspect-[4/3] animate-pulse bg-slate-100" />
      <div className="space-y-3 p-5">
        <div className="h-5 w-3/4 animate-pulse rounded bg-slate-100" />
        <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
        <div className="h-7 w-2/5 animate-pulse rounded bg-slate-100" />
        <div className="h-11 animate-pulse rounded-xl bg-slate-100" />
      </div>
    </div>
  );
}

type CollectionSearchProps = {
  clearLabel: string;
  initialValue: string;
  label: string;
  placeholder: string;
  onSearch: (value: string) => void;
};

function CollectionSearch({
  clearLabel,
  initialValue,
  label,
  placeholder,
  onSearch,
}: CollectionSearchProps) {
  const [value, setValue] = useState(initialValue);
  const debouncedValue = useDebounce(value, 350);

  useEffect(() => {
    const normalizedValue = debouncedValue.trim();
    if (normalizedValue !== initialValue) onSearch(normalizedValue);
  }, [debouncedValue, initialValue, onSearch]);

  return (
    <div className="relative min-w-0 flex-1">
      <label className="sr-only" htmlFor="collection-search">
        {label}
      </label>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
      <input
        id="collection-search"
        type="search"
        value={value}
        placeholder={placeholder}
        className="h-11 w-full rounded-xl border border-slate-200/80 bg-white pl-11 pr-12 text-sm text-navy outline-none transition-colors placeholder:text-slate-400 hover:border-primary/25 focus:border-primary/35 focus:ring-2 focus:ring-primary/10"
        onChange={(event) => setValue(event.target.value)}
      />
      {value ? (
        <button
          type="button"
          aria-label={clearLabel}
          className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition-colors hover:bg-primary-light/50 hover:text-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/25"
          onClick={() => {
            setValue("");
            onSearch("");
          }}
        >
          <X className="h-4 w-4" />
        </button>
      ) : null}
    </div>
  );
}

export function CollectionPage() {
  const { locale } = useI18n();
  const labels = COLLECTION_TRANSLATIONS[locale] as CollectionTranslations;
  const detailLabels = PRODUCT_DETAIL_TRANSLATIONS[locale];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const tab = resolveTab(searchParams.get("type") ?? searchParams.get("tab"));
  const page = positiveInteger(searchParams.get("page"), 1);
  const pageSize = resolvePageSize(searchParams.get("pageSize"));
  const sort = resolveSort(searchParams.get("sort"));
  const selectedCollections = useMemo(
    () =>
      queryStringList(
        searchParams,
        "categoryIds",
        "collections",
        "collectionIds",
        "collection",
      ),
    [searchParams],
  );
  const urlSearch = searchParams.get("search")?.trim() ?? "";
  const filters = useMemo<CollectionFilters>(
    () => ({
      minPrice: optionalNumber(
        searchParams.get("minPrice") ?? searchParams.get("min"),
      ),
      maxPrice: optionalNumber(
        searchParams.get("maxPrice") ?? searchParams.get("max"),
      ),
      characterCounts: queryNumberList(
        searchParams,
        "characterCounts",
        "character",
        "characterCount",
      ),
      charmCounts: queryNumberList(
        searchParams,
        "charmCounts",
        "charm",
        "charmCount",
      ),
      statuses: queryStringList(searchParams, "statuses", "status"),
      featured: queryBoolean(searchParams.get("featured")),
      isNew: queryBoolean(searchParams.get("isNew")),
      includedGift: queryBoolean(searchParams.get("includedGift")),
      frameSize: searchParams.get("frameSize")?.trim() || undefined,
    }),
    [searchParams],
  );
  const [products, setProducts] = useState<HomeFeaturedProduct[]>([]);
  const [meta, setMeta] = useState<PublicProductsMeta>(DEFAULT_META);
  const [collections, setCollections] = useState<Collection[]>([]);
  const [frameSizes, setFrameSizes] = useState<FrameSize[]>([]);
  const [characterParts, setCharacterParts] = useState<CharacterPart[]>([]);
  const [retailCatalog, setRetailCatalog] = useState<CollectionRetailItem[]>(
    [],
  );
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [filterOpen, setFilterOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null);
  const [isToolbarStuck, setIsToolbarStuck] = useState(false);
  const requestId = useRef(0);
  const templateAbortController = useRef<AbortController | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);

  const replaceQuery = useCallback(
    (
      changes: Record<
        string,
        string | number | boolean | Array<string | number> | undefined | null
      >,
    ) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(changes).forEach(([key, value]) => {
        if (
          value === undefined ||
          value === null ||
          value === "" ||
          value === false ||
          (Array.isArray(value) && value.length === 0)
        ) {
          next.delete(key);
        } else if (Array.isArray(value)) {
          next.set(key, value.join(","));
        } else {
          next.set(key, String(value));
        }

        const aliases: Record<string, string[]> = {
          type: ["tab"],
          categoryIds: ["collection", "collectionIds", "collections"],
          minPrice: ["min"],
          maxPrice: ["max"],
          characterCounts: ["character", "characterCount"],
          charmCounts: ["charm", "charmCount"],
          statuses: ["status"],
        };
        aliases[key]?.forEach((alias) => next.delete(alias));
      });
      const nextQuery = next.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    },
    [pathname, router, searchParams],
  );

  useEffect(() => {
    const next = new URLSearchParams(searchParams.toString());
    let changed = false;

    const promoteAlias = (canonical: string, aliases: string[]) => {
      if (!next.has(canonical)) {
        const alias = aliases.find((candidate) => next.has(candidate));
        const value = alias ? next.get(alias) : null;
        if (value) {
          next.set(canonical, value);
          changed = true;
        }
      }

      aliases.forEach((alias) => {
        if (next.has(alias)) {
          next.delete(alias);
          changed = true;
        }
      });
    };

    promoteAlias("type", ["tab"]);
    promoteAlias("categoryIds", ["collection", "collectionIds", "collections"]);
    promoteAlias("minPrice", ["min"]);
    promoteAlias("maxPrice", ["max"]);
    promoteAlias("characterCounts", ["character", "characterCount"]);
    promoteAlias("charmCounts", ["charm", "charmCount"]);
    promoteAlias("statuses", ["status"]);

    if (changed) {
      const nextQuery = next.toString();
      router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
        scroll: false,
      });
    }
  }, [pathname, router, searchParams]);

  useEffect(() => {
    if (tab === "characters") return;

    const toolbar = toolbarRef.current;
    if (!toolbar) return;

    const scrollRoot = document.getElementById("site-scroll-root");
    const scrollTarget: Window | HTMLElement = scrollRoot ?? window;
    const syncStickyState = () => {
      const rootTop = scrollRoot?.getBoundingClientRect().top ?? 0;
      const hasScrolled = scrollRoot
        ? scrollRoot.scrollTop > 0
        : window.scrollY > 0;
      setIsToolbarStuck(
        hasScrolled && toolbar.getBoundingClientRect().top <= rootTop + 68,
      );
    };

    syncStickyState();
    scrollTarget.addEventListener("scroll", syncStickyState, { passive: true });
    window.addEventListener("resize", syncStickyState);

    return () => {
      scrollTarget.removeEventListener("scroll", syncStickyState);
      window.removeEventListener("resize", syncStickyState);
    };
  }, [tab]);

  const handleSearch = useCallback(
    (value: string) => {
      replaceQuery({ search: value || undefined, page: undefined });
    },
    [replaceQuery],
  );

  useEffect(() => {
    let active = true;
    Promise.all([
      publicApiClient.products.listCollections(),
      publicApiClient.products.listFrameSizes(),
    ])
      .then(([collectionItems, sizeItems]) => {
        if (!active) return;
        setCollections(
          (Array.isArray(collectionItems) ? collectionItems : [])
            .filter(collectionIsActive)
            .sort((left, right) => left.sortOrder - right.sortOrder),
        );
        setFrameSizes(Array.isArray(sizeItems) ? sizeItems : []);
      })
      .catch(() => {
        if (!active) return;
        setCollections([]);
        setFrameSizes([]);
      });
    return () => {
      active = false;
    };
  }, []);

  const loadTemplates = useCallback(async () => {
    templateAbortController.current?.abort();
    const controller = new AbortController();
    templateAbortController.current = controller;
    const currentRequest = ++requestId.current;
    setIsLoading(true);
    setLoadError(null);
    const query: PublicProductsQuery = {
      page,
      pageSize,
      sort,
      ...(urlSearch ? { search: urlSearch } : {}),
      ...(selectedCollections.length > 0
        ? { collections: selectedCollections }
        : {}),
      ...(filters.minPrice !== undefined ? { minPrice: filters.minPrice } : {}),
      ...(filters.maxPrice !== undefined ? { maxPrice: filters.maxPrice } : {}),
      ...(filters.characterCounts?.length
        ? { characterCounts: filters.characterCounts }
        : {}),
      ...(filters.charmCounts?.length
        ? { charmCounts: filters.charmCounts }
        : {}),
      ...(filters.statuses?.length
        ? {
            statuses: filters.statuses as NonNullable<
              PublicProductsQuery["statuses"]
            >,
          }
        : {}),
      ...(filters.featured !== undefined ? { featured: filters.featured } : {}),
      ...(filters.isNew !== undefined ? { isNew: filters.isNew } : {}),
      ...(filters.includedGift !== undefined
        ? { includedGift: filters.includedGift }
        : {}),
      ...(filters.frameSize ? { frameSize: filters.frameSize } : {}),
    };

    try {
      const response: unknown =
        await publicApiClient.products.listProductCatalog(query, {
          signal: controller.signal,
        });
      if (currentRequest !== requestId.current) return;
      if (Array.isArray(response)) {
        const mapped = response.map((item) =>
          toFeaturedProduct(item as Product),
        );
        setProducts(mapped);
        setMeta({
          ...DEFAULT_META,
          pageSize,
          totalItems: mapped.length,
          totalPages: 1,
        });
      } else {
        const payload = response as {
          items?: unknown;
          meta?: Partial<PublicProductsMeta>;
        };
        const items = Array.isArray(payload.items) ? payload.items : [];
        setProducts(items.map((item) => toFeaturedProduct(item as Product)));
        setMeta({
          page: Math.max(1, Number(payload.meta?.page) || 1),
          pageSize: Math.max(1, Number(payload.meta?.pageSize) || pageSize),
          totalItems: Math.max(0, Number(payload.meta?.totalItems) || 0),
          totalPages: Math.max(1, Number(payload.meta?.totalPages) || 1),
          hasNextPage: payload.meta?.hasNextPage === true,
          hasPreviousPage: payload.meta?.hasPreviousPage === true,
        });
      }
    } catch (error) {
      if (controller.signal.aborted || isAbortError(error)) return;
      if (currentRequest !== requestId.current) return;
      setProducts([]);
      setMeta({ ...DEFAULT_META, pageSize });
      setLoadError(error instanceof Error ? error.message : labels.loadError);
    } finally {
      if (templateAbortController.current === controller) {
        templateAbortController.current = null;
        if (currentRequest === requestId.current) setIsLoading(false);
      }
    }
  }, [
    filters,
    labels.loadError,
    page,
    pageSize,
    selectedCollections,
    sort,
    urlSearch,
  ]);

  useEffect(() => {
    if (tab !== "templates") return;
    const timer = window.setTimeout(() => void loadTemplates(), 0);
    return () => {
      window.clearTimeout(timer);
      const controller = templateAbortController.current;
      templateAbortController.current = null;
      controller?.abort();
    };
  }, [loadTemplates, tab]);

  useEffect(() => {
    if (tab !== "characters") return;
    const timer = window.setTimeout(() => {
      const currentRequest = ++requestId.current;
      setIsLoading(true);
      setLoadError(null);
      publicApiClient.products
        .listCharacterParts()
        .then((items) => {
          if (currentRequest !== requestId.current) return;
          setCharacterParts(Array.isArray(items) ? items : []);
        })
        .catch((error: unknown) => {
          if (currentRequest !== requestId.current) return;
          setCharacterParts([]);
          setLoadError(
            error instanceof Error ? error.message : labels.loadError,
          );
        })
        .finally(() => {
          if (currentRequest === requestId.current) setIsLoading(false);
        });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [labels.loadError, tab]);

  useEffect(() => {
    if (tab !== "parts") return;
    const timer = window.setTimeout(() => {
      const currentRequest = ++requestId.current;
      setIsLoading(true);
      setLoadError(null);
      Promise.all([
        publicApiClient.products.listFrameOptions({ type: "size" }),
        publicApiClient.products.listFrameBackgrounds(),
        publicApiClient.products.listAccessories(),
        publicApiClient.products.listCharacterParts(),
      ])
        .then(([frames, backgrounds, accessories, parts]) => {
          if (currentRequest !== requestId.current) return;
          setRetailCatalog(
            retailItems(
              Array.isArray(frames) ? frames : [],
              Array.isArray(backgrounds) ? backgrounds : [],
              Array.isArray(accessories) ? accessories : [],
              Array.isArray(parts) ? parts : [],
            ),
          );
        })
        .catch((error: unknown) => {
          if (currentRequest !== requestId.current) return;
          setRetailCatalog([]);
          setLoadError(
            error instanceof Error ? error.message : labels.loadError,
          );
        })
        .finally(() => {
          if (currentRequest === requestId.current) setIsLoading(false);
        });
    }, 0);
    return () => window.clearTimeout(timer);
  }, [labels.loadError, tab]);

  const filteredRetail = useMemo(() => {
    const normalized = urlSearch.toLocaleLowerCase(locale);
    if (!normalized) return retailCatalog;
    return retailCatalog.filter((item) =>
      `${item.name} ${item.description ?? ""}`
        .toLocaleLowerCase(locale)
        .includes(normalized),
    );
  }, [locale, retailCatalog, urlSearch]);

  const resetFilters = useCallback(() => {
    replaceQuery({
      page: undefined,
      categoryIds: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      characterCounts: undefined,
      charmCounts: undefined,
      statuses: undefined,
      featured: undefined,
      isNew: undefined,
      includedGift: undefined,
      frameSize: undefined,
    });
  }, [replaceQuery]);

  const resetAdvancedFilters = useCallback(() => {
    replaceQuery({
      page: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      characterCounts: undefined,
      charmCounts: undefined,
      statuses: undefined,
      featured: undefined,
      isNew: undefined,
      includedGift: undefined,
      frameSize: undefined,
    });
  }, [replaceQuery]);

  const appliedFilters = activeFilterCount(filters);
  const resultStart =
    meta.totalItems === 0 ? 0 : (meta.page - 1) * meta.pageSize + 1;
  const resultEnd = Math.min(meta.totalItems, meta.page * meta.pageSize);
  const activeFilterLabels = useMemo(() => {
    const values: Array<{
      key: string;
      text: string;
      clear: Record<string, undefined>;
    }> = [];
    if (selectedCollections.length > 0) {
      values.push({
        key: "categoryIds",
        text: `${labels.filters.collection}: ${selectedCollections
          .map(
            (slug) =>
              collections.find((item) => item.slug === slug)?.name ?? slug,
          )
          .join(", ")}`,
        clear: { categoryIds: undefined },
      });
    }
    if (filters.minPrice !== undefined) {
      values.push({
        key: "minPrice",
        text: `>= ${filters.minPrice.toLocaleString(locale)}`,
        clear: { minPrice: undefined },
      });
    }
    if (filters.maxPrice !== undefined) {
      values.push({
        key: "maxPrice",
        text: `<= ${filters.maxPrice.toLocaleString(locale)}`,
        clear: { maxPrice: undefined },
      });
    }
    if (filters.characterCounts?.length) {
      values.push({
        key: "characterCounts",
        text: `${labels.filters.characters}: ${filters.characterCounts
          .map((count) => `${count}${count === 3 ? "+" : ""}`)
          .join(", ")}`,
        clear: { characterCounts: undefined },
      });
    }
    if (filters.charmCounts?.length) {
      values.push({
        key: "charmCounts",
        text: `${labels.filters.charms}: ${filters.charmCounts
          .map((count) => `${count}${count === 3 ? "+" : ""}`)
          .join(", ")}`,
        clear: { charmCounts: undefined },
      });
    }
    if (filters.statuses?.length) {
      values.push({
        key: "statuses",
        text: `${labels.filters.status}: ${filters.statuses.join(", ")}`,
        clear: { statuses: undefined },
      });
    }
    if (filters.frameSize) {
      values.push({
        key: "frameSize",
        text: filters.frameSize,
        clear: { frameSize: undefined },
      });
    }
    if (filters.featured) {
      values.push({
        key: "featured",
        text: labels.filters.featured,
        clear: { featured: undefined },
      });
    }
    if (filters.isNew) {
      values.push({
        key: "isNew",
        text: labels.filters.isNew,
        clear: { isNew: undefined },
      });
    }
    if (filters.includedGift) {
      values.push({
        key: "includedGift",
        text: labels.filters.includedGift,
        clear: { includedGift: undefined },
      });
    }
    return values;
  }, [collections, filters, labels, locale, selectedCollections]);
  return (
    <main className="min-h-screen min-w-0 overflow-x-clip bg-[#f4f6f8] pb-20 text-navy">
      <section className="border-b border-slate-200/75 bg-white">
        <Container size="full" className="max-w-[1520px] px-4 sm:px-6 lg:px-8">
          <div className="flex min-h-[174px] w-full min-w-0 max-w-full flex-col items-center justify-center py-5 text-center sm:min-h-[182px]">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary-dark">
              {labels.eyebrow}
            </p>
            <h1 className="mt-2.5 text-[clamp(2.1rem,3.4vw,3.5rem)] font-bold leading-[1.02] tracking-[-0.04em] text-navy">
              {labels.title}
            </h1>
            <p className="mx-auto mt-3 max-w-[340px] whitespace-normal break-words px-1 text-sm leading-6 text-text-muted sm:max-w-2xl sm:text-base">
              {labels.description}
            </p>

            <div className="mt-5 w-full min-w-0 max-w-full pb-1">
              <div className="mx-auto flex w-full min-w-0 max-w-[380px] gap-0.5 rounded-2xl border border-border/80 bg-white p-1 shadow-sm sm:w-max sm:max-w-none sm:gap-1">
                {TABS.map(({ icon: Icon, value }) => {
                  const active = tab === value;
                  return (
                    <button
                      key={value}
                      type="button"
                      aria-pressed={active}
                      className={`inline-flex h-10 min-w-0 flex-1 items-center justify-center gap-1 rounded-xl border px-2 text-[11px] font-bold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 sm:flex-none sm:gap-2 sm:px-5 sm:text-sm ${
                        active
                          ? "border-primary bg-primary text-white shadow-sm"
                          : "border-transparent bg-white text-slate-600 hover:border-primary/20 hover:bg-primary-light/30 hover:text-primary-dark"
                      }`}
                      onClick={() =>
                        replaceQuery({
                          type: value === "templates" ? undefined : value,
                          page: undefined,
                        })
                      }
                    >
                      <Icon className="h-3.5 w-3.5 shrink-0 sm:h-4 sm:w-4" />
                      <span className="min-w-0 truncate">
                        {labels.tabs[value]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <Container size="full" className="max-w-[1520px] px-4 sm:px-6 lg:px-8">
        {tab !== "characters" ? (
          <div
            ref={toolbarRef}
            className={`sticky top-[66px] z-30 -mx-4 border-y border-slate-200/80 bg-white/95 px-4 py-2.5 backdrop-blur-xl transition-shadow duration-200 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8 ${
              isToolbarStuck
                ? "shadow-[0_12px_30px_-24px_rgba(15,23,42,0.4)]"
                : "shadow-none"
            }`}
          >
            <div className="mx-auto grid min-w-0 max-w-[1520px] grid-cols-1 items-center gap-2 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-[minmax(260px,1fr)_230px_auto_168px_116px] xl:grid-cols-[minmax(320px,1fr)_250px_auto_190px_128px]">
              <div
                className={
                  tab === "templates"
                    ? "min-w-0 sm:col-span-2 md:col-span-4 lg:col-span-1"
                    : "min-w-0 sm:col-span-2 md:col-span-4 lg:col-span-5"
                }
              >
                <CollectionSearch
                  key={urlSearch}
                  clearLabel={labels.clearSearch}
                  initialValue={urlSearch}
                  label={labels.searchLabel}
                  placeholder={labels.searchPlaceholder}
                  onSearch={handleSearch}
                />
              </div>

              {tab === "templates" ? (
                <>
                  {collections.length > 0 ? (
                    <SearchableMultiSelect
                      ariaLabel={labels.otherCollections}
                      clearLabel={labels.clearAll}
                      emptyLabel={labels.collectionEmpty}
                      options={collections.map((item) => ({
                        label: item.name,
                        value: item.slug,
                      }))}
                      placeholder={labels.allCollections}
                      searchPlaceholder={labels.collectionSearchPlaceholder}
                      selectAllLabel={labels.allCollections}
                      values={selectedCollections}
                      className="min-w-0 w-full"
                      onChange={(values) =>
                        replaceQuery({
                          categoryIds: values.length > 0 ? values : undefined,
                          page: undefined,
                        })
                      }
                    />
                  ) : null}

                  <button
                    type="button"
                    className="relative inline-flex h-11 min-w-0 w-full items-center justify-center gap-2 rounded-xl border border-border/80 bg-white px-4 text-sm font-bold text-navy transition-colors hover:border-primary/25 hover:bg-primary-light/30 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                    onClick={() => setFilterOpen(true)}
                  >
                    <SlidersHorizontal className="h-4 w-4" />
                    {labels.filter}
                    {appliedFilters > 0 ? (
                      <span className="grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1 text-[10px] text-white">
                        {appliedFilters}
                      </span>
                    ) : null}
                  </button>

                  <div className="min-w-0">
                    <Select
                      aria-label={labels.sort}
                      value={sort}
                      options={SORT_OPTIONS.map((option) => ({
                        label: labels.sorts[option],
                        value: option,
                      }))}
                      className="h-11 min-w-0 overflow-hidden rounded-xl border-border/80 bg-white px-3 text-sm font-semibold text-navy shadow-none hover:border-primary/25 focus-visible:border-primary/35 focus-visible:ring-2 focus-visible:ring-primary/10 sm:px-4"
                      contentClassName="rounded-xl border-slate-200/90 bg-white shadow-xl shadow-slate-900/10"
                      itemClassName="data-[highlighted]:bg-primary-light/55 data-[highlighted]:text-primary-dark"
                      onValueChange={(value) =>
                        replaceQuery({ sort: value, page: undefined })
                      }
                    />
                  </div>

                  <div className="min-w-0">
                    <Select
                      aria-label={labels.pageSize}
                      value={String(pageSize)}
                      options={PAGE_SIZE_OPTIONS.map((option) => ({
                        label: `${option} / ${labels.pageSizeShort}`,
                        value: String(option),
                      }))}
                      className="h-11 min-w-0 overflow-hidden rounded-xl border-border/80 bg-white px-3 text-sm font-semibold text-navy shadow-none hover:border-primary/25 focus-visible:border-primary/35 focus-visible:ring-2 focus-visible:ring-primary/10 sm:px-4"
                      contentClassName="rounded-xl border-slate-200/90 bg-white shadow-xl shadow-slate-900/10"
                      itemClassName="data-[highlighted]:bg-primary-light/55 data-[highlighted]:text-primary-dark"
                      onValueChange={(value) => {
                        const nextPageSize = Number(value);
                        replaceQuery({
                          pageSize:
                            nextPageSize === PAGE_SIZE
                              ? undefined
                              : nextPageSize,
                          page: undefined,
                        });
                      }}
                    />
                  </div>
                </>
              ) : null}
            </div>
          </div>
        ) : null}

        {tab === "templates" && activeFilterLabels.length > 0 ? (
          <div className="mt-4 flex flex-wrap items-center gap-2">
            <span className="mr-1 text-xs font-bold uppercase tracking-[0.08em] text-text-muted">
              {labels.activeFilters}
            </span>
            {activeFilterLabels.map((item) => (
              <button
                key={item.key}
                type="button"
                className="inline-flex items-center gap-1.5 rounded-full border border-primary/15 bg-primary-light/45 px-3 py-1.5 text-xs font-semibold text-primary-dark transition-colors hover:bg-primary-light"
                onClick={() => replaceQuery({ ...item.clear, page: undefined })}
              >
                {item.text}
                <X className="h-3 w-3" />
              </button>
            ))}
            <button
              type="button"
              className="px-2 py-1.5 text-xs font-bold text-primary-dark underline-offset-4 hover:underline"
              onClick={resetFilters}
            >
              {labels.clearAll}
            </button>
          </div>
        ) : null}

        <div
          id="collection-results"
          className="mb-5 mt-7 flex scroll-mt-[148px] items-center justify-between gap-4"
        >
          <p className="text-sm font-semibold text-text-muted">
            {tab === "templates"
              ? labels.resultRange(resultStart, resultEnd, meta.totalItems)
              : tab === "parts"
                ? labels.resultCount(filteredRetail.length)
                : labels.tabs.characters}
          </p>
        </div>

        {loadError ? (
          <div className="min-w-0 max-w-full overflow-hidden rounded-[26px] border border-amber-200/70 bg-amber-50/80 px-5 py-12 text-center sm:px-6">
            <PackageSearch className="mx-auto h-10 w-10 text-amber-600" />
            <h2 className="mt-4 max-w-full break-words text-xl font-bold text-navy">
              {labels.loadError}
            </h2>
            <p className="mx-auto mt-2 max-w-full break-words text-sm leading-6 text-text-muted sm:max-w-lg">
              {loadError}
            </p>
            <button
              type="button"
              className="mt-5 h-11 rounded-xl bg-navy px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
              onClick={() => {
                if (tab === "templates") void loadTemplates();
                else router.refresh();
              }}
            >
              {labels.retry}
            </button>
          </div>
        ) : isLoading ? (
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 min-[1200px]:grid-cols-4 xl:grid-cols-4 xl:gap-6">
            {Array.from({ length: tab === "characters" ? 3 : 8 }).map(
              (_, index) => (
                <ProductSkeleton key={index} />
              ),
            )}
          </div>
        ) : tab === "templates" ? (
          products.length > 0 ? (
            <>
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3 min-[1200px]:grid-cols-4 xl:grid-cols-4 xl:gap-6">
                {products.map((product) => (
                  <ProductCard
                    key={product.id}
                    {...product}
                    detailLabels={detailLabels}
                    onConsult={(selected) => {
                      const subject = detailLabels.consultationMessage(
                        selected.title,
                      );
                      window.location.href = `mailto:hello@figurelab.vn?subject=${encodeURIComponent(subject)}`;
                      toast.success(
                        `${labels.consultationOpened}: ${selected.title}`,
                      );
                    }}
                    onSelect={(selected) => {
                      if (!selected.slug?.trim()) {
                        toast.error(detailLabels.loadError);
                        return;
                      }
                      setSelectedSlug(selected.slug);
                    }}
                  />
                ))}
              </div>
              <CollectionPagination
                labels={labels}
                page={meta.page}
                totalPages={meta.totalPages}
                onChange={(nextPage) => {
                  replaceQuery({ page: nextPage === 1 ? undefined : nextPage });
                  document
                    .getElementById("collection-results")
                    ?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                }}
              />
            </>
          ) : (
            <div className="min-w-0 max-w-full overflow-hidden rounded-[28px] border border-dashed border-border bg-white px-5 py-16 text-center sm:px-6">
              <PackageSearch className="mx-auto h-10 w-10 text-primary/55" />
              <h2 className="mt-4 max-w-full break-words text-xl font-bold text-navy">
                {labels.emptyTitle}
              </h2>
              <p className="mx-auto mt-2 max-w-full break-words text-sm leading-6 text-text-muted sm:max-w-lg">
                {labels.emptyDescription}
              </p>
              <button
                type="button"
                className="mt-5 h-11 rounded-xl bg-primary px-5 text-sm font-bold text-white transition-colors hover:bg-primary-dark"
                onClick={() => {
                  replaceQuery({
                    search: undefined,
                    page: undefined,
                    categoryIds: undefined,
                    minPrice: undefined,
                    maxPrice: undefined,
                    characterCounts: undefined,
                    charmCounts: undefined,
                    statuses: undefined,
                    featured: undefined,
                    isNew: undefined,
                    includedGift: undefined,
                    frameSize: undefined,
                  });
                }}
              >
                {labels.emptyAction}
              </button>
            </div>
          )
        ) : tab === "characters" ? (
          <CharacterBuilderShop parts={characterParts} loading={false} />
        ) : (
          <CollectionRetailGrid items={filteredRetail} labels={labels} />
        )}
      </Container>

      <CollectionFilterDrawer
        key={JSON.stringify(filters)}
        filters={filters}
        frameSizes={frameSizes}
        isOpen={filterOpen}
        labels={labels}
        onApply={(nextFilters) =>
          replaceQuery({
            minPrice: nextFilters.minPrice,
            maxPrice: nextFilters.maxPrice,
            characterCounts: nextFilters.characterCounts,
            charmCounts: nextFilters.charmCounts,
            statuses: nextFilters.statuses,
            featured: nextFilters.featured,
            isNew: nextFilters.isNew,
            includedGift: nextFilters.includedGift,
            frameSize: nextFilters.frameSize,
            page: undefined,
          })
        }
        onClose={() => setFilterOpen(false)}
        onReset={resetAdvancedFilters}
      />

      <ProductTemplateDetailModal
        isOpen={selectedSlug !== null}
        labels={detailLabels}
        slug={selectedSlug}
        onClose={() => setSelectedSlug(null)}
      />
    </main>
  );
}
