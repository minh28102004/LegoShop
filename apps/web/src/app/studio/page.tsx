import { redirect } from "next/navigation";

import { ROUTES } from "@/config/routes";
import { StudioModeLanding } from "@/modules/studio/components/StudioModeLanding";

type StudioSearchParams = Promise<
  Record<string, string | string[] | undefined>
>;

function firstValue(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function buildForwardedSearchParams(
  searchParams: Awaited<StudioSearchParams>,
) {
  const forwarded = new URLSearchParams();

  Object.entries(searchParams).forEach(([key, value]) => {
    if (key === "mode" || key === "type" || value === undefined) return;

    if (Array.isArray(value)) {
      value.forEach((entry) => forwarded.append(key, entry));
      return;
    }

    forwarded.set(key, value);
  });

  return forwarded;
}

export default async function Page({
  searchParams,
}: {
  searchParams: StudioSearchParams;
}) {
  const params = await searchParams;
  const requestedMode =
    firstValue(params.mode)?.toLowerCase() ??
    firstValue(params.type)?.toLowerCase();
  const hasLegacyFrameState = [
    "editCartItemId",
    "frameOptionId",
    "frameLabel",
    "frameColor",
  ].some((key) => firstValue(params[key]) !== undefined);

  if (requestedMode === "frame" || hasLegacyFrameState) {
    const forwarded = buildForwardedSearchParams(params);
    const query = forwarded.toString();
    redirect(`${ROUTES.studioFrame}${query ? `?${query}` : ""}`);
  }

  if (requestedMode === "character") {
    redirect(ROUTES.studioCharacter);
  }

  return <StudioModeLanding />;
}
