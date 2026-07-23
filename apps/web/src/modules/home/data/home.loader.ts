import type {
  Banner,
  Collection,
  HomepageMedia,
  Product,
} from "@lego-shop/shared";

import { ROUTES } from "@/config/routes";
import { FIGURE_LAB_TEAM_GIFT_IMAGE } from "@/config/marketing-media";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { getApiBaseUrl } from "@/lib/api/base-url";
import { publicApiClient } from "@/lib/api/public-client";
import { withProductImageFallback } from "@/lib/product-image-fallback";
import { vi } from "@/lib/i18n/dictionaries/vi";
import type {
  HomeCategory,
  HomeFeaturedProduct,
  HomeMediaAsset,
  HomeMediaMap,
  HomeMediaSlot,
  HomePageData,
  HomeResourceState,
} from "@/modules/home/types/home.types";

const MAX_FEATURED_PRODUCTS = 4;
const MAX_HOME_CATEGORIES = 6;
const MAX_HERO_SLIDES = 24;
const EXCLUDED_HERO_MEDIA_SOURCE_KEYS = new Set([
  "home-c4c80ef0a8d8",
]);

const BANNER_TITLES: Record<HomeMediaSlot, string> = {
  hero: "homepage:hero",
  story: "homepage:story",
  friendship: "homepage:friendship",
  transformation: "homepage:transformation",
  "final-cta": "homepage:final-cta",
};

const MEDIA_ALT: Record<HomeMediaSlot, string> = vi.home.media.alt;

const DEVELOPMENT_MEDIA: Record<HomeMediaSlot, string> = {
  hero: FIGURE_LAB_TEAM_GIFT_IMAGE,
  story: "/home/graduation-celebration.png",
  friendship: "/home/love-frame.png",
  transformation: "/home/birthday-frame.png",
  "final-cta": FIGURE_LAB_TEAM_GIFT_IMAGE,
};

type LoadedList<T> = {
  items: T[];
  state: HomeResourceState;
};

function toNonNegativeNumber(value: unknown): number {
  const parsed =
    typeof value === "number"
      ? value
      : typeof value === "string" && value.trim()
        ? Number(value)
        : Number.NaN;

  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function toOptionalPrice(value: unknown): number | null {
  const parsed = toNonNegativeNumber(value);
  return parsed > 0 ? parsed : null;
}

function toNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0
    ? value.trim()
    : null;
}

async function loadList<T>(
  resource: string,
  request: () => Promise<T[]>,
): Promise<LoadedList<T>> {
  try {
    const items = await request();
    return { items, state: items.length > 0 ? "api" : "empty" };
  } catch (error) {
    console.error(`[homepage] Failed to load ${resource}`, error);
    return { items: [], state: "error" };
  }
}

function getSafeApiMediaUrl(value?: string | null): string | null {
  if (!value) return null;

  const trimmed = value.trim();
  if (
    !trimmed ||
    /^(?:data|blob):/i.test(trimmed) ||
    trimmed.startsWith("//")
  ) {
    return null;
  }

  const resolved = resolveApiAssetUrl(trimmed);

  try {
    const mediaUrl = new URL(resolved);
    const apiUrl = new URL(getApiBaseUrl());

    const isApiMedia =
      (mediaUrl.protocol === "http:" || mediaUrl.protocol === "https:") &&
      mediaUrl.origin === apiUrl.origin;
    const isSupabasePublicMedia =
      mediaUrl.protocol === "https:" &&
      mediaUrl.hostname.endsWith(".supabase.co") &&
      mediaUrl.pathname.startsWith("/storage/v1/object/public/");

    if (isApiMedia || isSupabasePublicMedia) {
      return mediaUrl.toString();
    }
  } catch {
    return null;
  }

  return null;
}

function mapProducts(products: Product[]): HomeFeaturedProduct[] {
  return [...products]
    .sort((left, right) => Number(right.featured) - Number(left.featured))
    .flatMap((product, productIndex) => {
      const id = toNonEmptyString(product.id);
      const slug = toNonEmptyString(product.slug);
      const title = toNonEmptyString(product.name);

      if (!id || !slug || !title) {
        console.error("[homepage] Ignoring invalid featured product", {
          id: product.id,
          slug: product.slug,
        });
        return [];
      }

      const basePrice = toNonNegativeNumber(product.basePrice);
      const originalPrice = toOptionalPrice(product.originalPrice);
      const images = Array.isArray(product.images) ? product.images : [];
      const apiImageUrl =
        images.map(getSafeApiMediaUrl).find((url) => url !== null) ?? null;
      const includedItemLabels = Array.isArray(product.includedItemLabels)
        ? product.includedItemLabels.filter(
            (label): label is string =>
              typeof label === "string" && label.trim().length > 0,
          )
        : [];

      return [
        {
          id,
          slug,
          title,
          description:
            typeof product.description === "string"
              ? product.description
              : null,
          basePrice,
          originalPrice:
            originalPrice !== null && originalPrice > basePrice
              ? originalPrice
              : null,
          orderCount: toNonNegativeNumber(product.orderCount),
          characterCount: toNonNegativeNumber(product.characterCount),
          accessoryCount: toNonNegativeNumber(product.accessoryCount),
          includedItemLabels,
          badge: product.collection?.name ?? null,
          featured: product.featured,
          href: ROUTES.studio,
          imageUrl: withProductImageFallback(apiImageUrl, slug, productIndex),
        },
      ];
    })
    .slice(0, MAX_FEATURED_PRODUCTS);
}

function mapCategories(collections: Collection[]): HomeCategory[] {
  return collections.slice(0, MAX_HOME_CATEGORIES).map((collection) => ({
    id: collection.id,
    title: collection.name,
    description: collection.description,
    href: ROUTES.collection,
    imageUrl: getSafeApiMediaUrl(collection.imageUrl),
    imageAlt: collection.name,
  }));
}

function mapBanners(banners: Banner[]): HomeMediaMap {
  const bannerByTitle = new Map(
    banners
      .filter((banner) => banner.title)
      .map((banner) => [banner.title?.trim().toLowerCase(), banner] as const),
  );
  const isDevelopment = process.env.NODE_ENV !== "production";

  return (Object.keys(BANNER_TITLES) as HomeMediaSlot[]).reduce<HomeMediaMap>(
    (media, slot) => {
      const banner = bannerByTitle.get(BANNER_TITLES[slot]);
      const apiSource = getSafeApiMediaUrl(banner?.imageUrl);

      if (apiSource) {
        media[slot] = {
          src: apiSource,
          alt: MEDIA_ALT[slot],
          slot,
          source: "api",
        };
      } else if (isDevelopment) {
        media[slot] = {
          src: DEVELOPMENT_MEDIA[slot],
          alt: `${MEDIA_ALT[slot]} (${vi.home.media.developmentBadge})`,
          slot,
          source: "development-fallback",
        };
      } else {
        media[slot] = null;
      }

      return media;
    },
    {
      hero: null,
      story: null,
      friendship: null,
      transformation: null,
      "final-cta": null,
    },
  );
}

function mapHeroSlides(
  homepageMedia: HomepageMedia[],
  banners: Banner[],
): HomeMediaAsset[] {
  const importedSlides = [...homepageMedia]
    .filter((item) => !EXCLUDED_HERO_MEDIA_SOURCE_KEYS.has(item.sourceKey))
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .flatMap((item) => {
      const src = getSafeApiMediaUrl(item.imageUrl);
      if (!src) return [];

      return [
        {
          src,
          alt: MEDIA_ALT.hero,
          slot: "hero" as const,
          source: "api" as const,
        },
      ];
    });
  const bannerSlides = [...banners]
    .filter((banner) =>
      banner.title?.trim().toLowerCase().startsWith("homepage:"),
    )
    .sort((left, right) => left.sortOrder - right.sortOrder)
    .flatMap((banner) => {
      const src = getSafeApiMediaUrl(banner.imageUrl);
      if (!src) return [];

      const title = banner.title?.trim().toLowerCase() ?? "";
      const slot = (Object.entries(BANNER_TITLES).find(
        ([, expectedTitle]) => expectedTitle === title,
      )?.[0] ?? "hero") as HomeMediaSlot;

      return [
        {
          src,
          alt: MEDIA_ALT[slot],
          slot: "hero" as const,
          source: "api" as const,
        },
      ];
    });
  const slides = [
    {
      src: FIGURE_LAB_TEAM_GIFT_IMAGE,
      alt: MEDIA_ALT.hero,
      slot: "hero" as const,
      source: "static" as const,
    },
    ...importedSlides,
    ...bannerSlides,
  ]
    .filter(
      (slide, index, allSlides) =>
        allSlides.findIndex((candidate) => candidate.src === slide.src) ===
        index,
    )
    .slice(0, MAX_HERO_SLIDES);

  return slides;
}

export async function loadHomePageData(): Promise<HomePageData> {
  const [productResult, categoryResult, bannerResult, homepageMediaResult] =
    await Promise.all([
      loadList("products", () => publicApiClient.products.listProducts()),
      loadList("collections", () => publicApiClient.products.listCollections()),
      loadList("banners", () => publicApiClient.public.listBanners()),
      loadList("homepage media gallery", () =>
        publicApiClient.public.listHomepageMedia(),
      ),
    ]);

  const media = mapBanners(bannerResult.items);

  return {
    products: mapProducts(productResult.items),
    productState: productResult.state,
    categories: mapCategories(categoryResult.items),
    categoryState: categoryResult.state,
    media,
    heroSlides: mapHeroSlides(homepageMediaResult.items, bannerResult.items),
    bannerState:
      homepageMediaResult.state === "api" ? "api" : bannerResult.state,
  };
}
