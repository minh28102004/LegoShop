import { Suspense } from "react";
import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { CollectionPage } from "@/modules/collection/components/CollectionPage";

type CollectionRouteProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const LEGACY_CHARACTER_BUILDER_VALUES = new Set([
  "create-character",
  "character-builder",
  "builder",
]);

function firstQueryValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

export default async function Page({ searchParams }: CollectionRouteProps) {
  const params = await searchParams;
  const legacyMode =
    firstQueryValue(params.type) ??
    firstQueryValue(params.tab) ??
    firstQueryValue(params.mode);

  if (legacyMode && LEGACY_CHARACTER_BUILDER_VALUES.has(legacyMode)) {
    const preset = firstQueryValue(params.preset);
    redirect(
      preset
        ? `${ROUTES.studioCharacter}?preset=${encodeURIComponent(preset)}`
        : ROUTES.studioCharacter,
    );
  }

  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f7faff]" />}>
      <CollectionPage />
    </Suspense>
  );
}
