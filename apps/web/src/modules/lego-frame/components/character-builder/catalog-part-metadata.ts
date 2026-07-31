import type { CharacterPart } from "@lego-shop/shared";

type CatalogPartMetadata = {
  source: "minifigs-catalog";
  reverseImageUrl: string | null;
  layerCompatible: boolean;
  compositionMode: "canvas" | "slot";
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

export function getCatalogPartMetadata(
  part: CharacterPart,
): CatalogPartMetadata | null {
  if (!isRecord(part.compatibility)) return null;
  if (part.compatibility.source !== "minifigs-catalog") return null;

  return {
    source: "minifigs-catalog",
    reverseImageUrl:
      typeof part.compatibility.reverseImageUrl === "string"
        ? part.compatibility.reverseImageUrl
        : null,
    layerCompatible: part.compatibility.layerCompatible === true,
    compositionMode:
      part.compatibility.compositionMode === "canvas" ||
      part.compatibility.layerCompatible === true
        ? "canvas"
        : "slot",
  };
}

export function isLayerCompatiblePart(part: CharacterPart) {
  return getCatalogPartMetadata(part)?.compositionMode !== "slot";
}

export function isCatalogSlotPart(part: CharacterPart) {
  return getCatalogPartMetadata(part)?.compositionMode === "slot";
}

export function getCharacterPartImageUrl(
  part: CharacterPart,
  reverse: boolean,
) {
  const metadata = getCatalogPartMetadata(part);

  return reverse && metadata?.reverseImageUrl
    ? metadata.reverseImageUrl
    : part.imageUrl;
}
