import { uploadPreviewImage } from "@/lib/api/uploads";
import { isPersistableImageUrl } from "./design-data";

const PREVIEW_FILE_NAME = "studio-preview";

function getFileExtension(mimeType: string) {
  if (mimeType === "image/jpeg") return "jpg";
  if (mimeType === "image/webp") return "webp";
  if (mimeType === "image/gif") return "gif";
  return "png";
}

export async function prepareStudioPreview(
  sourceUrl: string | null,
  signal?: AbortSignal,
): Promise<string | null> {
  if (!sourceUrl) return null;
  if (isPersistableImageUrl(sourceUrl)) return sourceUrl;

  const response = await fetch(sourceUrl, signal ? { signal } : undefined);
  if (!response.ok) {
    throw new Error(`Preview source returned ${response.status}.`);
  }

  const blob = await response.blob();
  if (!blob.type.startsWith("image/")) {
    throw new Error("Preview source is not an image.");
  }

  const file = new File(
    [blob],
    `${PREVIEW_FILE_NAME}.${getFileExtension(blob.type)}`,
    { type: blob.type },
  );
  const uploaded = await uploadPreviewImage(file, signal);
  return uploaded.url;
}
