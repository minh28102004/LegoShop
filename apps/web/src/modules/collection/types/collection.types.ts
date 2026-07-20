import type { PublicProductsSort } from "@lego-shop/shared";

export type CollectionTab = "templates" | "characters" | "parts";

export type CollectionFilters = {
  minPrice?: number | undefined;
  maxPrice?: number | undefined;
  characterCounts?: number[] | undefined;
  charmCounts?: number[] | undefined;
  statuses?: string[] | undefined;
  featured?: boolean | undefined;
  isNew?: boolean | undefined;
  includedGift?: boolean | undefined;
  frameSize?: string | undefined;
};

export type CollectionQueryState = CollectionFilters & {
  page: number;
  pageSize: number;
  search: string;
  collections: string[];
  sort: PublicProductsSort;
  tab: CollectionTab;
};

export type RetailItemType =
  | "frame"
  | "background"
  | "accessory"
  | "character_part";

export type CollectionRetailItem = {
  id: string;
  type: RetailItemType;
  name: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
};
