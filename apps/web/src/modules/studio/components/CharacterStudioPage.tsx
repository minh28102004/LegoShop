"use client";

import type { CharacterPart, CharacterPreset } from "@lego-shop/shared";
import { useEffect, useState } from "react";

import { publicApiClient } from "@/lib/api/public-client";
import { CharacterBuilderShop } from "@/modules/lego-frame/components/CharacterBuilderShop";
import { loadCharacterPartCatalog } from "@/modules/lego-frame/lib/character-part-catalog";

export function CharacterStudioPage() {
  const [parts, setParts] = useState<CharacterPart[]>([]);
  const [presets, setPresets] = useState<CharacterPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState(false);
  const [loadVersion, setLoadVersion] = useState(0);

  useEffect(() => {
    const scrollRoot = document.querySelector<HTMLElement>("#site-scroll-root");
    if (!scrollRoot) return;

    const previousOverflowY = scrollRoot.style.overflowY;
    const previousOverscrollBehavior = scrollRoot.style.overscrollBehavior;
    const previousScrollTop = scrollRoot.scrollTop;
    const desktopQuery = window.matchMedia("(min-width: 1024px)");

    scrollRoot.scrollTop = 0;
    const syncScrollMode = () => {
      if (desktopQuery.matches) {
        scrollRoot.style.overflowY = "hidden";
        scrollRoot.style.overscrollBehavior = "none";
        return;
      }

      scrollRoot.style.overflowY = previousOverflowY;
      scrollRoot.style.overscrollBehavior = previousOverscrollBehavior;
    };

    syncScrollMode();
    desktopQuery.addEventListener("change", syncScrollMode);
    window.addEventListener("resize", syncScrollMode);

    return () => {
      desktopQuery.removeEventListener("change", syncScrollMode);
      window.removeEventListener("resize", syncScrollMode);
      scrollRoot.style.overflowY = previousOverflowY;
      scrollRoot.style.overscrollBehavior = previousOverscrollBehavior;
      scrollRoot.scrollTop = previousScrollTop;
    };
  }, []);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      loadCharacterPartCatalog(controller.signal),
      publicApiClient.products.listCharacterPresets({ limit: 24 }),
    ])
      .then(([nextParts, nextPresets]) => {
        if (controller.signal.aborted) return;
        setParts(nextParts);
        setPresets(nextPresets);
      })
      .catch(() => {
        if (controller.signal.aborted) return;
        setParts([]);
        setPresets([]);
        setLoadError(true);
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, [loadVersion]);

  return (
    <section
      data-character-page="true"
      className="min-h-[calc(100dvh-62px)] overflow-visible bg-[#f2f7fb] p-2 sm:p-3 lg:h-[calc(100dvh-58px)] lg:min-h-0 lg:overflow-hidden lg:p-4 xl:h-[calc(100dvh-62px)]"
    >
      <CharacterBuilderShop
        error={loadError}
        loading={loading}
        onRetry={() => {
          setLoading(true);
          setLoadError(false);
          setLoadVersion((current) => current + 1);
        }}
        parts={parts}
        presets={presets}
      />
    </section>
  );
}
