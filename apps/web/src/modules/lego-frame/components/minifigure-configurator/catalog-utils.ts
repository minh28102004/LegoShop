import type {
  CatalogCategoryName,
  CatalogCategorySlug,
  CatalogPrice,
  LayerConfig,
  MinifigureCatalog,
} from "./types";

export const layerConfig = {
  "Gift Display": {
    zIndex: 10,
    top: 61,
    left: 50,
    width: 84,
    scale: 1,
  },
  Legs: {
    zIndex: 20,
    top: 66,
    left: 50,
    width: 38,
    scale: 1,
  },
  Bodies: {
    zIndex: 30,
    top: 45,
    left: 50,
    width: 42,
    scale: 1,
  },
  Accessories: {
    zIndex: 40,
    top: 49,
    left: 76,
    width: 27,
    scale: 0.92,
  },
  "Hair & Hats": {
    zIndex: 50,
    top: 22,
    left: 50,
    width: 34,
    scale: 1,
  },
} satisfies Record<CatalogCategoryName, LayerConfig>;

export function isCatalogCategorySlug(
  value: string,
): value is CatalogCategorySlug {
  return [
    "hair-hats",
    "bodies",
    "legs",
    "gift-display",
    "accessories",
  ].includes(value);
}

export function isMinifigureCatalog(value: unknown): value is MinifigureCatalog {
  if (!value || typeof value !== "object" || Array.isArray(value)) return false;
  const candidate = value as Record<string, unknown>;
  if (
    !candidate.meta ||
    typeof candidate.meta !== "object" ||
    !Array.isArray(candidate.categorySummary) ||
    !candidate.categories ||
    typeof candidate.categories !== "object"
  ) {
    return false;
  }

  const categories = candidate.categories as Record<string, unknown>;
  return [
    "hair-hats",
    "bodies",
    "legs",
    "gift-display",
    "accessories",
  ].every((slug) => {
    const category = categories[slug];
    return (
      Boolean(category) &&
      typeof category === "object" &&
      !Array.isArray(category) &&
      Array.isArray((category as Record<string, unknown>).items)
    );
  });
}

export function formatCatalogPrice(
  price: CatalogPrice,
  locale: "vi" | "en",
  unavailableLabel: string,
) {
  const min = price.min ? Number.parseFloat(price.min) : Number.NaN;
  const max = price.max ? Number.parseFloat(price.max) : Number.NaN;
  const currency = price.currency?.trim().toUpperCase();
  if (!Number.isFinite(min) || !currency) return unavailableLabel;

  const formatter = new Intl.NumberFormat(locale === "vi" ? "vi-VN" : "en-GB", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  });
  if (!Number.isFinite(max) || max === min) return formatter.format(min);
  return `${formatter.format(min)} – ${formatter.format(max)}`;
}
