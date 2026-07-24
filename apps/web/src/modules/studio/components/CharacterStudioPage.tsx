"use client";

import type { CharacterPart, CharacterPreset } from "@lego-shop/shared";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

import { Container } from "@/components/layout/Container";
import { ROUTES } from "@/config/routes";
import { publicApiClient } from "@/lib/api/public-client";
import { useI18n } from "@/lib/i18n/useI18n";
import { CharacterBuilderShop } from "@/modules/lego-frame/components/CharacterBuilderShop";

export function CharacterStudioPage() {
  const { dictionary } = useI18n();
  const copy = dictionary.studio.characterShell;
  const [parts, setParts] = useState<CharacterPart[]>([]);
  const [presets, setPresets] = useState<CharacterPreset[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const controller = new AbortController();

    Promise.all([
      publicApiClient.products.listCharacterParts({ limit: 90 }),
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
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });

    return () => controller.abort();
  }, []);

  return (
    <section className="min-h-[calc(100dvh-62px)] bg-[radial-gradient(circle_at_15%_10%,rgba(121,198,240,0.18),transparent_32%),linear-gradient(180deg,#f8fbfe_0%,#edf5fa_100%)] py-7 lg:min-h-[calc(100dvh-58px)] lg:py-10">
      <Container size="wide">
        <Link
          href={ROUTES.studio}
          className="inline-flex min-h-11 items-center gap-2 rounded-[13px] px-3 text-sm font-bold text-slate-600 transition-colors hover:bg-white hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
        >
          <ArrowLeft className="size-4" aria-hidden="true" />
          {copy.backToStudio}
        </Link>

        <header className="mt-4 border-b border-[#d8e6ef] pb-6">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-primary">
            {copy.eyebrow}
          </p>
          <h1 className="mt-2 max-w-4xl font-display text-[clamp(2.1rem,5vw,3.8rem)] font-bold leading-[1.04] tracking-[-0.045em] text-navy">
            {copy.title}
          </h1>
          <p className="mt-3 max-w-3xl text-sm font-medium leading-6 text-slate-600 sm:text-base sm:leading-7">
            {copy.description}
          </p>
        </header>

        <div className="mt-7 rounded-[30px] border border-[#d2e2ec] bg-white p-4 shadow-[0_30px_80px_-58px_rgba(18,45,78,0.35)] sm:p-6 lg:p-8">
          <CharacterBuilderShop
            parts={parts}
            presets={presets}
            loading={loading}
            standalone
          />
        </div>
      </Container>
    </section>
  );
}
