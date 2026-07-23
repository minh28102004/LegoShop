const PRODUCT_IMAGE_BY_SLUG: Record<string, string> = {
  "classic-brick-set": "/home/graduation-frame.png",
  "mini-figure-custom": "/home/love-frame.png",
};

const PRODUCT_FIXTURE_IMAGES = [
  "/home/birthday-frame.png",
  "/home/graduation-celebration.png",
  "/home/graduation-frame.png",
  "/home/love-frame.png",
] as const;

const PRODUCT_FIXTURE_SLUG_PREFIX = "test-paging-";

export function withProductImageFallback(
  imageUrl: string | null,
  slug: string,
  productIndex: number,
): string | null {
  const normalizedImageUrl = imageUrl?.trim() || null;

  if (process.env.NODE_ENV === "production") {
    return normalizedImageUrl;
  }

  const fallbackImageUrl =
    PRODUCT_IMAGE_BY_SLUG[slug] ??
    (slug.startsWith(PRODUCT_FIXTURE_SLUG_PREFIX)
      ? (PRODUCT_FIXTURE_IMAGES[productIndex % PRODUCT_FIXTURE_IMAGES.length] ??
        null)
      : null);

  return slug.startsWith(PRODUCT_FIXTURE_SLUG_PREFIX)
    ? (fallbackImageUrl ?? normalizedImageUrl)
    : (normalizedImageUrl ?? fallbackImageUrl);
}
