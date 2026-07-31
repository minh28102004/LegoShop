"use client";

import { useEffect, useState } from "react";

import { isMinifigureCatalog } from "../catalog-utils";
import type { CatalogLoadState } from "../types";

const INITIAL_STATE: CatalogLoadState = {
  status: "loading",
  catalog: null,
  error: null,
};

export function useCatalog() {
  const [state, setState] = useState<CatalogLoadState>(INITIAL_STATE);

  useEffect(() => {
    let active = true;

    import(
      "../../../../../../../../data/minifigs-catalog-clean.json"
    )
      .then((module) => {
        if (!active) return;
        const value: unknown = module.default;
        if (!isMinifigureCatalog(value)) {
          throw new Error("Invalid minifigure catalog structure");
        }
        setState({ status: "ready", catalog: value, error: null });
      })
      .catch(() => {
        if (!active) return;
        setState({
          status: "error",
          catalog: null,
          error: "catalog_load_failed",
        });
      });

    return () => {
      active = false;
    };
  }, []);

  return state;
}
