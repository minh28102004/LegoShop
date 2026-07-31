"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import {
  CATALOG_CATEGORY_SLUGS,
  type CatalogCategorySlug,
  type ConfiguratorSelection,
  type MinifigureCatalog,
  type PreviewSide,
} from "../types";

const STORAGE_KEY = "figurelab-minifigure-configurator-v1";
const QUERY_PREFIX = "mf_";

type PersistedConfiguratorState = {
  selectedIds: ConfiguratorSelection;
  side: PreviewSide;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readPersistedState(): PersistedConfiguratorState {
  if (typeof window === "undefined") {
    return { selectedIds: {}, side: "front" };
  }

  let storedSelection: ConfiguratorSelection = {};
  let storedSide: PreviewSide = "front";
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : null;
    if (isRecord(parsed)) {
      if (isRecord(parsed.selectedIds)) {
        const selectedIds = parsed.selectedIds;
        storedSelection = CATALOG_CATEGORY_SLUGS.reduce<ConfiguratorSelection>(
          (selection, slug) => {
            const id = selectedIds[slug];
            if (typeof id === "string") selection[slug] = id;
            return selection;
          },
          {},
        );
      }
      if (parsed.side === "back") storedSide = "back";
    }
  } catch {
    storedSelection = {};
  }

  const params = new URLSearchParams(window.location.search);
  const urlSelection = CATALOG_CATEGORY_SLUGS.reduce<ConfiguratorSelection>(
    (selection, slug) => {
      const id = params.get(`${QUERY_PREFIX}${slug}`);
      if (id) selection[slug] = id;
      return selection;
    },
    {},
  );
  const hasUrlSelection = Object.keys(urlSelection).length > 0;
  const urlSide = params.get(`${QUERY_PREFIX}side`);

  return {
    selectedIds: hasUrlSelection ? urlSelection : storedSelection,
    side:
      urlSide === "back" || urlSide === "front" ? urlSide : storedSide,
  };
}

function syncUrl(state: PersistedConfiguratorState) {
  const url = new URL(window.location.href);
  CATALOG_CATEGORY_SLUGS.forEach((slug) => {
    const key = `${QUERY_PREFIX}${slug}`;
    const id = state.selectedIds[slug];
    if (id) url.searchParams.set(key, id);
    else url.searchParams.delete(key);
  });
  if (state.side === "back") {
    url.searchParams.set(`${QUERY_PREFIX}side`, "back");
  } else {
    url.searchParams.delete(`${QUERY_PREFIX}side`);
  }
  window.history.replaceState(
    window.history.state,
    "",
    `${url.pathname}${url.search}${url.hash}`,
  );
}

export function useConfiguratorState(catalog: MinifigureCatalog) {
  const [selectedIds, setSelectedIds] = useState<ConfiguratorSelection>({});
  const [side, setSide] = useState<PreviewSide>("front");
  const [hydrated, setHydrated] = useState(false);
  const hydrationFrameRef = useRef<number | null>(null);

  const itemIndex = useMemo(
    () =>
      new Map(
        CATALOG_CATEGORY_SLUGS.flatMap((slug) =>
          catalog.categories[slug].items.map((item) => [item.id, item] as const),
        ),
      ),
    [catalog],
  );

  useEffect(() => {
    const persisted = readPersistedState();
    const validSelection =
      CATALOG_CATEGORY_SLUGS.reduce<ConfiguratorSelection>((selection, slug) => {
        const id = persisted.selectedIds[slug];
        const item = id ? itemIndex.get(id) : null;
        if (item?.categorySlug === slug) selection[slug] = item.id;
        return selection;
      }, {});

    hydrationFrameRef.current = window.requestAnimationFrame(() => {
      setSelectedIds(validSelection);
      setSide(persisted.side);
      setHydrated(true);
    });

    return () => {
      if (hydrationFrameRef.current !== null) {
        window.cancelAnimationFrame(hydrationFrameRef.current);
      }
    };
  }, [itemIndex]);

  useEffect(() => {
    if (!hydrated) return;
    const state = { selectedIds, side } satisfies PersistedConfiguratorState;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    syncUrl(state);
  }, [hydrated, selectedIds, side]);

  const toggleItem = useCallback(
    (categorySlug: CatalogCategorySlug, itemId: string) => {
      setSelectedIds((current) => ({
        ...current,
        [categorySlug]:
          current[categorySlug] === itemId ? undefined : itemId,
      }));
    },
    [],
  );

  const resetCategory = useCallback((categorySlug: CatalogCategorySlug) => {
    setSelectedIds((current) => {
      const next = { ...current };
      delete next[categorySlug];
      return next;
    });
  }, []);

  const clearAll = useCallback(() => {
    setSelectedIds({});
    setSide("front");
  }, []);

  const selectedItems = useMemo(
    () =>
      CATALOG_CATEGORY_SLUGS.flatMap((slug) => {
        const id = selectedIds[slug];
        const item = id ? itemIndex.get(id) : null;
        return item ? [item] : [];
      }),
    [itemIndex, selectedIds],
  );

  return {
    clearAll,
    hydrated,
    resetCategory,
    selectedIds,
    selectedItems,
    setSide,
    side,
    toggleItem,
  };
}
