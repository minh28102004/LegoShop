import type { CharacterPart, CharacterPartType } from "@lego-shop/shared";

export const BUILDER_PART_TYPES = [
  "FACE",
  "HAIR",
  "TORSO",
  "LEGS",
  "HAT",
  "ACCESSORY",
] as const satisfies readonly CharacterPartType[];

export const REQUIRED_PART_TYPES = [
  "FACE",
  "TORSO",
  "LEGS",
] as const satisfies readonly CharacterPartType[];

export const PROGRESS_PART_TYPES = [
  "FACE",
  "HAIR",
  "TORSO",
  "LEGS",
  "ACCESSORY",
] as const satisfies readonly CharacterPartType[];

export const CHARACTER_LAYER_ORDER = [
  "LEGS",
  "TORSO",
  "FACE",
  "HAIR",
  "HAT",
  "ACCESSORY",
] as const satisfies readonly CharacterPartType[];

export const HEADWEAR_PART_TYPES = [
  "HAIR",
  "HAT",
] as const satisfies readonly CharacterPartType[];

export type BuilderCategory =
  "PRESET" | "HEADWEAR" | Exclude<CharacterPartType, "HAIR" | "HAT">;

export type CharacterSelection = Partial<Record<CharacterPartType, string>>;

export function getPartPrice(part: CharacterPart) {
  return Math.max(0, Math.round(part.priceAdjustment ?? 0));
}

export function toPartSnapshot(part: CharacterPart) {
  return {
    id: part.id,
    name: part.name,
    type: part.type,
    imageUrl: part.imageUrl,
    priceAdjustment: getPartPrice(part),
  };
}
