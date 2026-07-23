import type { SimpleCartItem } from "@/features/cart/store";
import { getCartItemParts } from "@/features/cart/cart-parts";
import { formatCurrency } from "@lego-shop/shared";

export function formatCartCurrency(value: number) {
  return formatCurrency(Math.max(0, Math.round(value))).replace(/\s*₫/u, "₫");
}

export function sanitizeCartText(value: string) {
  const targeted = value
    .replace(/tùy ch(?:ï¿½|�)nh/gi, "tùy chỉnh")
    .replace(/tuy chinh/gi, "tùy chỉnh");

  if (!/[ÃÂÄÆáºá»]/.test(targeted)) return targeted;

  try {
    const bytes = Uint8Array.from(targeted, (character) =>
      character.charCodeAt(0),
    );
    const decoded = new TextDecoder("utf-8", { fatal: true }).decode(bytes);
    return decoded.includes("�") ? targeted : decoded;
  } catch {
    return targeted;
  }
}

function readString(value: unknown) {
  return typeof value === "string" && value.trim() ? value.trim() : null;
}

export function getCartConfiguration(item: SimpleCartItem) {
  const parts = getCartItemParts(item);
  const frame = parts.find((part) => part.type === "frame");
  const background = parts.find((part) => part.type === "background");
  const characters = parts.filter((part) => part.type === "character");
  const accessories = parts.filter((part) => part.type === "accessory");
  const characterCount = characters.reduce(
    (total, part) => total + Math.max(1, part.quantity / item.quantity),
    0,
  );
  const accessoryCount = accessories.reduce(
    (total, part) => total + Math.max(1, part.quantity / item.quantity),
    0,
  );
  const design = item.designData;
  const printedText = [
    readString(design?.printText),
    readString(design?.recipientName),
    readString(design?.message),
  ].filter((value): value is string => Boolean(value));

  if (design?.printText && typeof design.printText === "object") {
    printedText.push(
      ...Object.values(design.printText)
        .map(readString)
        .filter((value): value is string => Boolean(value)),
    );
  }

  const uploadedImages = Array.isArray(design?.uploadedImages)
    ? design.uploadedImages.filter(
        (image) => image && typeof image === "object",
      ).length
    : 0;

  return {
    parts,
    frame,
    background,
    characters,
    accessories,
    characterCount: Math.round(characterCount),
    accessoryCount: Math.round(accessoryCount),
    printedText: Array.from(new Set(printedText)),
    uploadedImages,
  };
}
