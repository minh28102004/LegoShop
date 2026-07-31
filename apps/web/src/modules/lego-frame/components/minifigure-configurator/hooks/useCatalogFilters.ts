"use client";

import { useDeferredValue, useMemo } from "react";

import type { CatalogCategory, CatalogItem } from "../types";

export function useCatalogFilters({
  category,
  search,
  subcategory,
}: {
  category: CatalogCategory;
  search: string;
  subcategory: string | null;
}) {
  const deferredSearch = useDeferredValue(search);
  const normalizedSearch = deferredSearch.trim().toLocaleLowerCase();

  const filteredItems = useMemo(
    () =>
      category.items.filter((item) => {
        if (
          subcategory &&
          !item.subcategories.includes(subcategory)
        ) {
          return false;
        }
        if (!normalizedSearch) return true;
        return item.title.toLocaleLowerCase().includes(normalizedSearch);
      }),
    [category.items, normalizedSearch, subcategory],
  );

  const subcategories = useMemo(
    () => category.topSubcategories,
    [category.topSubcategories],
  );

  return {
    filteredItems,
    subcategories,
    isFiltering: deferredSearch !== search,
  } satisfies {
    filteredItems: CatalogItem[];
    subcategories: CatalogCategory["topSubcategories"];
    isFiltering: boolean;
  };
}
