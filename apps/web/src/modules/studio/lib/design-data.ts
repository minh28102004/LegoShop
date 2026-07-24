import type { CustomFrameDesignData } from "@lego-shop/shared";
import type { ApiFrameSize } from "../state/studio.types";

const STUDIO_CANVAS_MAX_BOUND = 500;
const STUDIO_CANVAS_MIN_BOUND = 240;

function parseFrameDimensions(label?: string | null) {
  const match = label?.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);

  if (match?.[1] && match?.[2]) {
    return { width: Number(match[1]), height: Number(match[2]) };
  }

  return { width: 30, height: 30 };
}

function getFrameDimensions(size?: ApiFrameSize | null) {
  if (
    typeof size?.widthCm === "number" &&
    Number.isFinite(size.widthCm) &&
    typeof size.heightCm === "number" &&
    Number.isFinite(size.heightCm)
  ) {
    return { width: size.widthCm, height: size.heightCm };
  }

  return parseFrameDimensions(size?.label);
}

export function getStudioCanvasSize(
  selectedSize: ApiFrameSize | null | undefined,
  allSizes: ApiFrameSize[],
) {
  const parsedSizes = allSizes.map(getFrameDimensions);
  const maxDimension =
    parsedSizes.length > 0
      ? Math.max(
          ...parsedSizes.map((size) => Math.max(size.width, size.height)),
          30,
        )
      : 30;
  const currentSize = getFrameDimensions(selectedSize);

  return {
    width: Math.max(
      STUDIO_CANVAS_MIN_BOUND,
      Math.round((currentSize.width / maxDimension) * STUDIO_CANVAS_MAX_BOUND),
    ),
    height: Math.max(
      STUDIO_CANVAS_MIN_BOUND,
      Math.round((currentSize.height / maxDimension) * STUDIO_CANVAS_MAX_BOUND),
    ),
  };
}

export function isCustomFrameDesignData(
  value: unknown,
): value is CustomFrameDesignData {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    !Array.isArray(value) &&
    (value as { type?: unknown }).type === "CUSTOM_FRAME" &&
    (value as { version?: unknown }).version === 1
  );
}

export function getDesignTemplateName(
  value: Record<string, unknown> | undefined,
) {
  if (!value) return null;
  if (isCustomFrameDesignData(value)) return value.backgroundName ?? null;
  const templateName = value.templateName;
  return typeof templateName === "string" && templateName.trim()
    ? templateName.trim()
    : null;
}

export function getDesignCharacterCount(
  value: Record<string, unknown> | undefined,
) {
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
