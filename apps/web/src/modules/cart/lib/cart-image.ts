import type { SimpleCartItem } from "@/features/cart/store";
import { resolveApiAssetUrl } from "@/lib/api/assets";

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readUrl(value: unknown) {
  if (typeof value !== "string") return null;
  const url = value.trim();
  if (!url || /^[a-z]:[\\/]/i.test(url) || url.includes("\\")) return null;
  if (
    !url.startsWith("/") &&
    !url.startsWith("data:image/") &&
    !url.startsWith("blob:") &&
    !/^https?:\/\//i.test(url)
  ) {
    return null;
  }

  return resolveApiAssetUrl(url) || null;
}

function firstArrayUrl(value: unknown) {
  if (!Array.isArray(value)) return null;
  for (const candidate of value) {
    const directUrl = readUrl(candidate);
    if (directUrl) return directUrl;
    if (isRecord(candidate)) {
      const nestedUrl = readUrl(candidate.url ?? candidate.imageUrl);
      if (nestedUrl) return nestedUrl;
    }
  }
  return null;
}

export type CartItemImage = {
  src: string;
  fit: "contain" | "cover";
};

function imageCandidate(
  value: unknown,
  fit: CartItemImage["fit"],
): CartItemImage | null {
  const src = readUrl(value);
  return src ? { src, fit } : null;
}

export function resolveCartItemImage(
  item: SimpleCartItem,
): CartItemImage | null {
  const design = isRecord(item.designData) ? item.designData : {};
  const uploadedImages = Array.isArray(design.uploadedImages)
    ? design.uploadedImages
    : [];
  const uploadedBackground = uploadedImages.find(
    (image) => isRecord(image) && image.type === "background",
  );
  const productPart = item.parts?.find(
    (part) => part.type === "product" || part.type === "retail",
  );
  const backgroundPart = item.parts?.find((part) => part.type === "background");
  const galleryImage = firstArrayUrl(design.images);

  const candidates: Array<CartItemImage | null> = [
    imageCandidate(design.previewUrl, "contain"),
    imageCandidate(item.previewUrl, "contain"),
    imageCandidate(design.studioPreviewUrl, "contain"),
    imageCandidate(design.thumbnailUrl, "cover"),
    imageCandidate(design.templateThumbnailUrl, "cover"),
    imageCandidate(design.backgroundThumbnailUrl, "contain"),
    imageCandidate(design.primaryImageUrl, "cover"),
    imageCandidate(productPart?.imageUrl, "cover"),
    imageCandidate(design.productThumbnail, "cover"),
    imageCandidate(backgroundPart?.imageUrl, "contain"),
    isRecord(uploadedBackground)
      ? imageCandidate(
          uploadedBackground.url ?? uploadedBackground.imageUrl,
          "contain",
        )
      : null,
    imageCandidate(design.templateImageUrl, "contain"),
    galleryImage ? { src: galleryImage, fit: "cover" } : null,
    imageCandidate(design.imageUrl, "cover"),
  ];

  return (
    candidates.find((candidate): candidate is CartItemImage =>
      Boolean(candidate),
    ) ?? null
  );
}
