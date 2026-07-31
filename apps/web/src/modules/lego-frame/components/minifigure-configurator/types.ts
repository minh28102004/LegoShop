export const CATALOG_CATEGORY_SLUGS = [
  "hair-hats",
  "bodies",
  "legs",
  "gift-display",
  "accessories",
] as const;

export type CatalogCategorySlug = (typeof CATALOG_CATEGORY_SLUGS)[number];

export type CatalogCategoryName =
  | "Hair & Hats"
  | "Bodies"
  | "Legs"
  | "Gift Display"
  | "Accessories";

export type CatalogPrice = {
  min: string | null;
  max: string | null;
  currency: string | null;
};

export type CatalogItem = {
  id: string;
  title: string;
  handle: string | null;
  category: CatalogCategoryName;
  categorySlug: CatalogCategorySlug;
  mainImage: string | null;
  mainImageAlt: string | null;
  reverseImage: string | null;
  availableForSale: boolean;
  totalInventory: number | null;
  price: CatalogPrice;
  subcategories: string[];
  warning: string | null;
};

export type CatalogSubcategorySummary = {
  name: string;
  count: number;
};

export type CatalogCategorySummary = {
  name: CatalogCategoryName;
  slug: CatalogCategorySlug;
  count: number;
  itemsWithMainImage: number;
  topSubcategories: CatalogSubcategorySummary[];
};

export type CatalogCategory = {
  name: CatalogCategoryName;
  count: number;
  topSubcategories: CatalogSubcategorySummary[];
  items: CatalogItem[];
};

export type MinifigureCatalog = {
  meta: {
    sourceRows: number;
    uniqueProducts: number;
    duplicateRowsRemoved: number;
    productsWithMainImage: number;
    productsWithoutMainImage: number;
    categoryCount: number;
    categoryOrder: CatalogCategoryName[];
    missingExpectedCategories: string[];
  };
  categorySummary: CatalogCategorySummary[];
  categories: Record<CatalogCategorySlug, CatalogCategory>;
};

export type ConfiguratorSelection = Partial<
  Record<CatalogCategorySlug, string>
>;

export type PreviewSide = "front" | "back";

export type LayerConfig = {
  zIndex: number;
  top: number;
  left: number;
  width: number;
  scale: number;
};

export type CatalogLoadState =
  | { status: "loading"; catalog: null; error: null }
  | { status: "ready"; catalog: MinifigureCatalog; error: null }
  | { status: "error"; catalog: null; error: string };
