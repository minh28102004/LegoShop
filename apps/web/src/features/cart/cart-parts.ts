import type { CartItemPart, CartItemPartType, SimpleCartItem } from './store';
import { isCustomFrameDesignData } from "@/modules/studio/lib/design-data";

const DEFAULT_CHARACTER_PRICE = 10000;
type CartAccessory = NonNullable<SimpleCartItem["accessories"]>[number];

type PartInput = {
  id?: string | null | undefined;
  type: CartItemPartType;
  name: string;
  quantity?: number | null | undefined;
  unitPrice?: number | null | undefined;
  imageUrl?: string | null | undefined;
};

function toPositiveNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) && value > 0 ? value : fallback;
}

function makePart(input: PartInput): CartItemPart | null {
  const name = input.name.trim();
  if (!name) return null;

  const quantity = Math.max(1, Math.round(input.quantity ?? 1));
  const unitPrice = Math.max(0, Math.round(input.unitPrice ?? 0));
  const part: CartItemPart = {
    type: input.type,
    name,
    quantity,
    unitPrice,
    totalPrice: unitPrice * quantity,
  };

  if (input.id) part.id = input.id;
  if (input.imageUrl !== undefined) part.imageUrl = input.imageUrl;

  return part;
}

function scaleStoredPart(part: CartItemPart, itemQuantity: number): CartItemPart | null {
  const quantity = Math.max(1, Math.round(part.quantity || 1)) * Math.max(1, itemQuantity);
  const unitPrice = Math.max(0, Math.round(part.unitPrice || 0));
  return makePart({
    id: part.id,
    type: part.type,
    name: part.name,
    quantity,
    unitPrice,
    imageUrl: part.imageUrl,
  });
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

function readRecord(value: unknown): Record<string, unknown> | null {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function getRetailPart(item: SimpleCartItem): CartItemPart | null {
  const designData = readRecord(item.designData);
  if (designData?.type !== "RETAIL_ITEM") return null;

  const retailType = readString(designData.retailType);
  const sourceId = readString(designData.sourceId);
  const imageUrl = readString(designData.imageUrl) ?? item.previewUrl;
  const partType: CartItemPartType =
    retailType === "frame" || retailType === "background" || retailType === "accessory"
      ? retailType
      : "retail";

  return makePart({
    id: sourceId,
    type: partType,
    name: item.productName,
    quantity: item.quantity,
    unitPrice: item.unitPrice,
    imageUrl,
  });
}

function estimateLegacyFramePrice(item: SimpleCartItem) {
  const accessoriesTotal = (item.accessories ?? []).reduce(
    (sum: number, accessory: CartAccessory) =>
      sum + Math.max(0, accessory.price) * Math.max(1, accessory.quantity ?? 1),
    0,
  );

  const designData = item.designData;
  const characterTotal = isCustomFrameDesignData(designData)
    ? designData.characters.reduce((sum, character) => sum + (character.price ?? DEFAULT_CHARACTER_PRICE), 0)
    : toPositiveNumber(designData?.characterCount) * DEFAULT_CHARACTER_PRICE;

  return Math.max(0, item.unitPrice - accessoriesTotal - characterTotal);
}

function getLegacyCustomParts(item: SimpleCartItem): CartItemPart[] {
  const parts: CartItemPart[] = [];
  const designData = item.designData;
  const framePrice = estimateLegacyFramePrice(item);

  if (item.frameSizeLabel) {
    const frame = makePart({
      id: item.frameOptionId ?? item.frameSizeId,
      type: "frame",
      name: [item.frameSizeLabel, item.frameColorName].filter(Boolean).join(" - "),
      quantity: item.quantity,
      unitPrice: framePrice,
    });
    if (frame) parts.push(frame);
  }

  if (isCustomFrameDesignData(designData)) {
    const backgroundImage = designData.uploadedImages.find((image) => image.type === "background")?.url ?? item.previewUrl;
    const background = makePart({
      id: designData.backgroundId,
      type: "background",
      name: designData.backgroundName ?? "Nền ảnh tùy chỉnh",
      quantity: item.quantity,
      unitPrice: 0,
      imageUrl: backgroundImage,
    });
    if (background) parts.push(background);

    designData.characters.forEach((character, index) => {
      const part = makePart({
        id: character.catalogId ?? character.id,
        type: "character",
        name: character.name ?? `Nhân vật ${index + 1}`,
        quantity: item.quantity,
        unitPrice: character.price ?? DEFAULT_CHARACTER_PRICE,
        imageUrl: character.imageUrl,
      });
      if (part) parts.push(part);
    });

    const accessoriesById = new Map<string, CartAccessory>(
      (item.accessories ?? []).map((accessory: CartAccessory) => [accessory.id, accessory]),
    );
    designData.accessories.forEach((accessory) => {
      const pricedAccessory = accessoriesById.get(accessory.id);
      const part = makePart({
        id: accessory.id,
        type: "accessory",
        name: accessory.name,
        quantity: accessory.quantity * item.quantity,
        unitPrice: pricedAccessory?.price ?? 0,
        imageUrl: readString(accessory.imageUrl),
      });
      if (part) parts.push(part);
    });

    return parts;
  }

  const templateName = readString(designData?.templateName);
  if (templateName) {
    const background = makePart({
      id: readString(designData?.templateId),
      type: "background",
      name: templateName,
      quantity: item.quantity,
      unitPrice: 0,
      imageUrl: item.previewUrl,
    });
    if (background) parts.push(background);
  }

  (item.accessories ?? []).forEach((accessory: CartAccessory) => {
    const part = makePart({
      id: accessory.id,
      type: "accessory",
      name: accessory.name,
      quantity: Math.max(1, accessory.quantity ?? 1) * item.quantity,
      unitPrice: accessory.price,
    });
    if (part) parts.push(part);
  });

  return parts;
}

export function getCartItemParts(item: SimpleCartItem): CartItemPart[] {
  const storedParts = item.parts
    ?.map((part: CartItemPart) => scaleStoredPart(part, item.quantity))
    .filter((part): part is CartItemPart => Boolean(part)) ?? [];

  if (storedParts.length > 0) return storedParts;

  const retailPart = getRetailPart(item);
  if (retailPart) return [retailPart];

  const legacyParts = getLegacyCustomParts(item);
  if (legacyParts.length > 0) return legacyParts;

  return [
    {
      type: "product",
      name: item.productName,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice,
      imageUrl: item.previewUrl,
    },
  ];
}
