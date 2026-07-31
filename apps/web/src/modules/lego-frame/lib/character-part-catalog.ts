import type { CharacterPart, CharacterPartType } from "@lego-shop/shared";

import { publicApiClient } from "@/lib/api/public-client";

const CATALOG_PART_TYPES = [
  "FACE",
  "HAIR",
  "TORSO",
  "LEGS",
  "HAT",
  "ACCESSORY",
] as const satisfies readonly CharacterPartType[];

export async function loadCharacterPartCatalog(signal?: AbortSignal) {
  const groups = await Promise.all(
    CATALOG_PART_TYPES.map((type) =>
      publicApiClient.products.listCharacterParts(
        { type, limit: 200 },
        signal ? { signal } : undefined,
      ),
    ),
  );
  const uniqueParts = new Map<string, CharacterPart>();

  groups.flat().forEach((part) => {
    uniqueParts.set(part.id, part);
  });

  return [...uniqueParts.values()];
}
