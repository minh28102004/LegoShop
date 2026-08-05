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

const CHARACTER_PART_PAGE_SIZE = 100;

async function loadCharacterPartGroup(
  type: CharacterPartType,
  signal?: AbortSignal,
) {
  const parts: CharacterPart[] = [];
  let page = 1;

  while (true) {
    const currentPage = await publicApiClient.products.listCharacterParts(
      { type, page, limit: CHARACTER_PART_PAGE_SIZE },
      signal ? { signal } : undefined,
    );

    parts.push(...currentPage);

    if (currentPage.length < CHARACTER_PART_PAGE_SIZE) {
      return parts;
    }

    page += 1;
  }
}

export async function loadCharacterPartCatalog(signal?: AbortSignal) {
  const groups = await Promise.all(
    CATALOG_PART_TYPES.map((type) => loadCharacterPartGroup(type, signal)),
  );
  const uniqueParts = new Map<string, CharacterPart>();

  groups.flat().forEach((part) => {
    uniqueParts.set(part.id, part);
  });

  return [...uniqueParts.values()];
}
