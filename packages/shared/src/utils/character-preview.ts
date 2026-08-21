export const CHARACTER_PREVIEW_PART_TYPES = [
  "LEGS",
  "TORSO",
  "FACE",
  "HAIR",
  "HAT",
  "ACCESSORY",
] as const;

export type CharacterPreviewPartType =
  (typeof CHARACTER_PREVIEW_PART_TYPES)[number];

export type CharacterPreviewPart = {
  id: string;
  name: string;
  type: CharacterPreviewPartType;
  imageUrl: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function isPreviewPartType(value: string): value is CharacterPreviewPartType {
  return CHARACTER_PREVIEW_PART_TYPES.includes(
    value as CharacterPreviewPartType,
  );
}

function toPreviewPart(value: unknown): CharacterPreviewPart | null {
  const record = isRecord(value) ? value : null;
  if (!record) return null;

  const id = readString(record.id);
  const type = readString(record.type);
  const imageUrl = readString(record.imageUrl);
  if (!id || !type || !imageUrl || !isPreviewPartType(type)) return null;

  return {
    id,
    name: readString(record.name) ?? id,
    type,
    imageUrl,
  };
}

function readPartArray(value: unknown) {
  if (!Array.isArray(value)) return [];
  return value
    .map(toPreviewPart)
    .filter((part): part is CharacterPreviewPart => Boolean(part));
}

function readCharacterPartRecord(value: unknown) {
  const record = isRecord(value) ? value : null;
  if (!record) return [];

  return CHARACTER_PREVIEW_PART_TYPES.flatMap((type) => {
    const rawValue = record[type];
    const values = Array.isArray(rawValue) ? rawValue : [rawValue];
    return values
      .map(toPreviewPart)
      .filter((part): part is CharacterPreviewPart => Boolean(part));
  });
}

function deduplicateParts(parts: CharacterPreviewPart[]) {
  const seen = new Set<string>();
  return parts.filter((part) => {
    const key = `${part.type}:${part.id}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

/**
 * Resolves the immutable character-part snapshots used by cart, checkout and
 * admin order previews. Order component snapshots take priority over design
 * data so historical orders do not change when the live catalog is edited.
 */
export function getCharacterPreviewParts(
  designData: unknown,
  componentSnapshot?: unknown,
): CharacterPreviewPart[] {
  const componentRecord = isRecord(componentSnapshot)
    ? componentSnapshot
    : null;
  const snapshotParts = readPartArray(componentRecord?.parts);
  if (snapshotParts.length > 0) return deduplicateParts(snapshotParts);

  const designRecord = isRecord(designData) ? designData : null;
  if (!designRecord) return [];

  const resolvedParts = readPartArray(designRecord.resolvedParts);
  if (resolvedParts.length > 0) return deduplicateParts(resolvedParts);

  const primaryCharacter = isRecord(designRecord.character)
    ? designRecord.character
    : null;
  const firstCharacter = Array.isArray(designRecord.characters)
    ? designRecord.characters.find(isRecord)
    : null;
  const storedParts = readCharacterPartRecord(
    primaryCharacter?.characterParts ?? firstCharacter?.characterParts,
  );

  return deduplicateParts(storedParts);
}
