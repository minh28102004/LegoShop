import type { CustomFrameDesignData } from "@lego-shop/shared";

export function isCustomFrameDesignData(value: unknown): value is CustomFrameDesignData {
  return Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value as { type?: unknown }).type === "CUSTOM_FRAME" &&
    (value as { version?: unknown }).version === 1;
}

export function getDesignTemplateName(value: Record<string, unknown> | undefined) {
  if (!value) return null;
  if (isCustomFrameDesignData(value)) return value.backgroundName ?? null;
  const templateName = value.templateName;
  return typeof templateName === "string" && templateName.trim() ? templateName.trim() : null;
}

export function getDesignCharacterCount(value: Record<string, unknown> | undefined) {
  if (!value) return 0;
  if (isCustomFrameDesignData(value)) return value.characters.length;
  const legacyValue = value.characterCount;
  if (typeof legacyValue === "number" && legacyValue > 0) return legacyValue;
  const elements = value.elements;
  return Array.isArray(elements)
    ? elements.filter(
        (element) =>
          Boolean(element) &&
          typeof element === "object" &&
          !Array.isArray(element) &&
          (element as { type?: unknown }).type === "character",
      ).length
    : 0;
}

export function isPersistableImageUrl(value: string | null | undefined) {
  if (!value) return true;
  return !value.startsWith("data:") && !value.startsWith("blob:");
}
