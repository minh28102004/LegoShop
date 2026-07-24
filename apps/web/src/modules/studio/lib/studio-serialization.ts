import type { CustomFrameDesignData, JsonObject } from "@lego-shop/shared";

import type { CartItemPart, SimpleCartItem } from "@/features/cart/store";
import { getStudioCanvasSize, isPersistableImageUrl } from "./design-data";
import type {
  ApiFrameSize,
  ApiTemplate,
  PrintText,
  StudioContentField,
  StudioElement,
} from "../state/studio.types";

type SerializeStudioDesignInput = {
  frameSize: string;
  frameSizes: ApiFrameSize[];
  characterPrice: number;
  elements: StudioElement[];
  printText: PrintText;
  contentFields: StudioContentField[];
  contentValues: Record<string, string>;
  activeTemplate: string | null;
  customBackgroundUrl: string | null;
  customBackgroundOriginalName: string | null;
  templates: ApiTemplate[];
  labels: {
    customBackground: string;
    accessoryFallback: string;
    characterFallback: (index: number) => string;
  };
};

export type SerializedStudioDesign = {
  designData: CustomFrameDesignData;
  previewUrl: string | null;
  frame: ApiFrameSize | undefined;
  template: ApiTemplate | undefined;
  cartParts: CartItemPart[];
  accessorySnapshot: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
  }>;
};

function serializeCharacterParts(
  value: StudioElement["characterParts"],
): JsonObject {
  const result: JsonObject = {};

  Object.entries(value ?? {}).forEach(([key, part]) => {
    if (Array.isArray(part)) {
      result[key] = part.map((item) => ({ ...item }));
    } else if (part) {
      result[key] = { ...part };
    }
  });

  return result;
}

function findContentValue(
  fields: StudioContentField[],
  values: Record<string, string>,
  candidates: string[],
  fallback = "",
) {
  for (const candidate of candidates) {
    const directValue = values[candidate]?.trim();
    if (directValue) return directValue;
  }

  const matchedField = fields.find((field) => {
    const haystack = `${field.key} ${field.label}`.toLowerCase();
    return candidates.some((candidate) =>
      haystack.includes(candidate.toLowerCase()),
    );
  });

  return matchedField ? values[matchedField.key]?.trim() || fallback : fallback;
}

export function serializeStudioDesign({
  frameSize,
  frameSizes,
  characterPrice,
  elements,
  printText,
  contentFields,
  contentValues,
  activeTemplate,
  customBackgroundUrl,
  customBackgroundOriginalName,
  templates,
  labels,
}: SerializeStudioDesignInput): SerializedStudioDesign {
  const frame = frameSizes.find((item) => item.id === frameSize);
  const template = templates.find((item) => item.id === activeTemplate);
  const previewUrl = customBackgroundUrl ?? template?.imageUrl ?? null;
  const backgroundId =
    template?.source === "background" && template.id.startsWith("background:")
      ? template.id.replace("background:", "")
      : null;
  const accessoryItems = elements.filter((item) => item.type === "accessory");
  const characterItems = elements.filter((item) => item.type === "character");

  const designData: CustomFrameDesignData = {
    version: 1,
    type: "CUSTOM_FRAME",
    frameOptionId: frameSize,
    frameOptionLabel: frame?.label ?? frameSize,
    ...(frame?.colorName ? { frameColorName: frame.colorName } : {}),
    ...(frame?.colorHex ? { frameColorHex: frame.colorHex } : {}),
    canvasSize: getStudioCanvasSize(frame, frameSizes),
    backgroundId,
    backgroundName: template?.name ?? null,
    content: {
      recipientName: findContentValue(
        contentFields,
        contentValues,
        ["recipientName", "title", "name", "ten"],
        printText.title,
      ),
      graduationDate: findContentValue(
        contentFields,
        contentValues,
        ["graduationDate", "date", "ngay"],
        printText.date,
      ),
      majorOrSchool: findContentValue(contentFields, contentValues, [
        "majorOrSchool",
        "major",
        "school",
        "nganh",
        "truong",
      ]),
      message: findContentValue(
        contentFields,
        contentValues,
        ["message", "note", "loi", "thong"],
        printText.message,
      ),
    },
    contentValues: { ...contentValues },
    printText: { ...printText },
    elements: elements
      .filter((item) => item.type === "text")
      .map((item) => ({
        id: item.id,
        type: item.type,
        x: item.x,
        y: item.y,
        ...(item.content ? { content: item.content } : {}),
        ...(typeof item.fontSize === "number"
          ? { fontSize: item.fontSize }
          : {}),
        ...(item.color ? { color: item.color } : {}),
        ...(typeof item.width === "number" ? { width: item.width } : {}),
        ...(typeof item.height === "number" ? { height: item.height } : {}),
      })),
    uploadedImages:
      customBackgroundUrl && isPersistableImageUrl(customBackgroundUrl)
        ? [
            {
              id: "background-upload",
              url: customBackgroundUrl,
              type: "background",
              originalName: customBackgroundOriginalName,
              position: { x: 0, y: 0, scale: 1, rotate: 0 },
            },
          ]
        : [],
    accessories: accessoryItems
      .filter((item) => typeof item.accessoryId === "string")
      .map((item) => ({
        id: item.accessoryId as string,
        name: item.content || labels.accessoryFallback,
        quantity: 1,
        imageUrl: item.imageUrl ?? null,
        position: {
          x: item.x,
          y: item.y,
          scale: item.width ? item.width / 60 : 1,
          rotate: item.rotation ?? 0,
        },
      })),
    characters: characterItems.map((item, index) => {
      const scale = item.scale ?? (item.width ? item.width / 54 : 1);
      const rotation = item.rotation ?? 0;

      return {
        id: item.id,
        ...(item.characterId ? { catalogId: item.characterId } : {}),
        name: item.content || labels.characterFallback(index + 1),
        x: item.x,
        y: item.y,
        scale,
        rotation,
        faceId: item.faceId ?? "",
        hairId: item.hairId ?? "",
        torsoId: item.torsoId ?? "",
        legsId: item.legsId ?? "",
        ...(item.hatId ? { hatId: item.hatId } : {}),
        accessoryIds: item.accessoryIds ?? [],
        characterParts: serializeCharacterParts(item.characterParts),
        imageUrl: item.imageUrl ?? null,
        price: item.price ?? characterPrice,
        position: {
          x: item.x,
          y: item.y,
          scale,
          rotate: rotation,
          rotation,
        },
      };
    }),
    previewUrl,
  };

  const cartParts: CartItemPart[] = [];
  if (frame) {
    cartParts.push({
      id: frameSize,
      type: "frame",
      name: [frame.label, frame.colorName].filter(Boolean).join(" - "),
      quantity: 1,
      unitPrice: frame.price,
      totalPrice: frame.price,
    });
  }
  if (template || customBackgroundUrl) {
    cartParts.push({
      ...(backgroundId ? { id: backgroundId } : {}),
      type: "background",
      name:
        template?.name ??
        customBackgroundOriginalName ??
        labels.customBackground,
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      imageUrl: previewUrl,
    });
  }
  characterItems.forEach((item, index) => {
    cartParts.push({
      ...(item.characterId ? { id: item.characterId } : {}),
      type: "character",
      name: item.content || labels.characterFallback(index + 1),
      quantity: 1,
      unitPrice: item.price ?? characterPrice,
      totalPrice: item.price ?? characterPrice,
      ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
    });
  });
  accessoryItems.forEach((item) => {
    cartParts.push({
      ...(item.accessoryId ? { id: item.accessoryId } : {}),
      type: "accessory",
      name: item.content || labels.accessoryFallback,
      quantity: 1,
      unitPrice: item.price || 0,
      totalPrice: item.price || 0,
      ...(item.imageUrl ? { imageUrl: item.imageUrl } : {}),
    });
  });

  return {
    designData,
    previewUrl,
    frame,
    template,
    cartParts,
    accessorySnapshot: accessoryItems
      .filter((item) => typeof item.accessoryId === "string")
      .map((item) => ({
        id: item.accessoryId as string,
        name: item.content || labels.accessoryFallback,
        price: item.price || 0,
        quantity: 1,
      })),
  };
}

type BuildCartItemInput = SerializedStudioDesign & {
  activeTemplate: string | null;
  frameSize: string;
  printText: PrintText;
  totalPrice: number;
  productName: string;
};

export function buildStudioCartItem({
  activeTemplate,
  accessorySnapshot,
  cartParts,
  designData,
  frame,
  frameSize,
  previewUrl,
  printText,
  totalPrice,
  productName,
}: BuildCartItemInput): Omit<SimpleCartItem, "id" | "addedAt" | "totalPrice"> {
  return {
    productId: null,
    productName: `${productName}${printText.title ? ` - ${printText.title}` : ""}`,
    quantity: 1,
    unitPrice: totalPrice,
    frameOptionId: frameSize,
    frameSizeId: frameSize,
    frameSizeLabel: frame?.label ?? frameSize,
    frameColorName: frame?.colorName ?? "",
    accessories: accessorySnapshot,
    parts: cartParts,
    templateId: activeTemplate,
    designData,
    previewUrl,
  };
}
