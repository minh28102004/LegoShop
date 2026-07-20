import type {
  ApiFrameSize,
  ApiTemplate,
  StudioElement,
  StudioPriceBreakdown,
} from "../state/studio.types";

// Backend character pricing is not available yet; keep the fallback centralized.
export const DEFAULT_CHARACTER_SURCHARGE = 10_000;

type CalculateStudioPriceInput = {
  frameSize: string;
  frameSizes: ApiFrameSize[];
  activeTemplate: string | null;
  templates: ApiTemplate[];
  elements: StudioElement[];
  customizationPrice?: number;
};

function toVnd(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? Math.max(0, Math.round(value))
    : 0;
}

export function calculateStudioPrice({
  frameSize,
  frameSizes,
  activeTemplate,
  templates,
  elements,
  customizationPrice = 0,
}: CalculateStudioPriceInput): StudioPriceBreakdown {
  const framePrice = toVnd(
    frameSizes.find((size) => size.id === frameSize)?.price,
  );
  const template = templates.find((item) => item.id === activeTemplate);
  const templatePrice = toVnd(
    template?.configJson && "price" in template.configJson
      ? template.configJson.price
      : 0,
  );
  const characterPrice = elements
    .filter((element) => element.type === "character")
    .reduce(
      (total, element) =>
        total + toVnd(element.price ?? DEFAULT_CHARACTER_SURCHARGE),
      0,
    );
  const accessoryPrice = elements
    .filter((element) => element.type === "accessory")
    .reduce((total, element) => total + toVnd(element.price), 0);
  const normalizedCustomizationPrice = toVnd(customizationPrice);
  const basePrice = 0;

  return {
    basePrice,
    framePrice,
    templatePrice,
    characterPrice,
    accessoryPrice,
    customizationPrice: normalizedCustomizationPrice,
    totalPrice:
      basePrice +
      framePrice +
      templatePrice +
      characterPrice +
      accessoryPrice +
      normalizedCustomizationPrice,
  };
}
