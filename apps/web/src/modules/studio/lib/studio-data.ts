import { resolveApiAssetUrl } from "@/lib/api/assets";
import { getApiBaseUrl } from "@/lib/api/base-url";
import type { FrameBackground, FrameOption } from "@lego-shop/shared";
import type {
  ApiAccessory,
  ApiCategory,
  ApiFrameSize,
  ApiTemplate,
} from "../state/studio.types";

const STUDIO_MEDIA_PATH_PREFIXES = ["/uploads/", "/shared/images/"];
const FIGURE_LAB_STORAGE_HOST = "akgcqvirfqumhaxyzenr.supabase.co";
const FIGURE_LAB_STORAGE_PREFIX = "/storage/v1/object/public/figure-lab-media/";

const KNOWN_FRAME_COLORS = [
  {
    label: "Trắng",
    hex: "#ffffff",
    names: ["trang", "white"],
    hexes: ["#ffffff"],
  },
  {
    label: "Đen",
    hex: "#1f1f21",
    names: ["den", "black"],
    hexes: ["#000000", "#111111", "#1a1a1a", "#1f1f21"],
  },
  { label: "Gỗ", hex: "#d7a15c", names: ["go", "wood"], hexes: ["#d7a15c"] },
  {
    label: "Xám",
    hex: "#808080",
    names: ["xam", "gray", "grey"],
    hexes: ["#808080", "#6b7280", "#9ca3af"],
  },
  { label: "Nâu", hex: "#8b4513", names: ["nau", "brown"], hexes: ["#8b4513"] },
  {
    label: "Đỏ",
    hex: "#ef4444",
    names: ["do", "red"],
    hexes: ["#ff0000", "#ef4444", "#dc2626"],
  },
  {
    label: "Vàng",
    hex: "#facc15",
    names: ["vang", "yellow"],
    hexes: ["#facc15", "#fbbf24", "#ffd700"],
  },
  {
    label: "Xanh",
    hex: "#3b82f6",
    names: ["xanh", "blue"],
    hexes: ["#3b82f6", "#2563eb"],
  },
] as const;

const BACKGROUND_CATEGORY_LABELS: Record<string, { vi: string; en: string }> = {
  graduation: { vi: "Tốt nghiệp", en: "Graduation" },
  birthday: { vi: "Sinh nhật", en: "Birthday" },
  anniversary: { vi: "Kỷ niệm", en: "Anniversary" },
  wedding: { vi: "Đám cưới", en: "Wedding" },
  love: { vi: "Tình yêu", en: "Love" },
  sports: { vi: "Thể thao", en: "Sports" },
  family: { vi: "Gia đình", en: "Family" },
  career: { vi: "Sự nghiệp", en: "Career" },
  travel: { vi: "Du lịch", en: "Travel" },
  christmas: { vi: "Giáng sinh", en: "Christmas" },
  other: { vi: "Khác", en: "Other" },
};

const BACKGROUND_CATEGORY_ORDER = Object.keys(BACKGROUND_CATEGORY_LABELS);

export type StudioFrameBackground = FrameBackground & {
  category?: string | null;
  thumbnailUrl?: string | null;
  naturalWidth?: number | null;
  naturalHeight?: number | null;
};

export function resolveStudioImageUrl(imageUrl: string | null): string | null {
  if (!imageUrl) return null;
  const trimmed = imageUrl.trim();
  if (
    !trimmed ||
    /^(?:data|blob):/i.test(trimmed) ||
    trimmed.startsWith("//")
  ) {
    return null;
  }

  const resolved = resolveApiAssetUrl(trimmed);
  try {
    const mediaUrl = new URL(resolved);
    const apiUrl = new URL(getApiBaseUrl());
    const isFigureLabAsset = STUDIO_MEDIA_PATH_PREFIXES.some((prefix) =>
      mediaUrl.pathname.startsWith(prefix),
    );
    const isFigureLabStorageAsset =
      mediaUrl.protocol === "https:" &&
      mediaUrl.hostname === FIGURE_LAB_STORAGE_HOST &&
      mediaUrl.pathname.startsWith(FIGURE_LAB_STORAGE_PREFIX);

    return (mediaUrl.origin === apiUrl.origin && isFigureLabAsset) ||
      isFigureLabStorageAsset
      ? mediaUrl.toString()
      : null;
  } catch {
    return null;
  }
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function normalizeFrameColorName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.toLowerCase() === "goo" || trimmed === "Gỗoo") return "Gỗ";
  return trimmed;
}

function normalizeHex(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = value.trim();
  if (/^#[0-9a-f]{3}$/i.test(trimmed)) {
    return `#${trimmed
      .slice(1)
      .split("")
      .map((char) => `${char}${char}`)
      .join("")}`.toLowerCase();
  }
  if (/^#[0-9a-f]{6}$/i.test(trimmed)) return trimmed.toLowerCase();
  if (/^[0-9a-f]{6}$/i.test(trimmed)) return `#${trimmed.toLowerCase()}`;
  return null;
}

function getKnownFrameColorByHex(colorHex?: string | null) {
  const normalizedHex = normalizeHex(colorHex);
  if (!normalizedHex) return null;
  return (
    KNOWN_FRAME_COLORS.find((color) =>
      (color.hexes as readonly string[]).includes(normalizedHex),
    ) ?? null
  );
}

function getKnownFrameColorByName(name: string) {
  const normalizedName = normalizeSearchText(name);
  return (
    KNOWN_FRAME_COLORS.find((color) =>
      (color.names as readonly string[]).includes(normalizedName),
    ) ?? null
  );
}

function readFrameOptionMetadataString(
  option: FrameOption,
  keys: string[],
): string | null {
  const metadata = option.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
    return null;
  }
  const record = metadata as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value.trim();
  }
  return null;
}

function getFrameOptionColorName(
  option: FrameOption,
  sizeLabel: string,
): string {
  const metadataColorName = readFrameOptionMetadataString(option, [
    "colorName",
    "frameColorName",
    "color",
    "mauKhung",
  ]);
  if (metadataColorName) return normalizeFrameColorName(metadataColorName);

  const knownByHex = getKnownFrameColorByHex(option.colorHex);
  if (knownByHex) return knownByHex.label;

  const normalizedOptionHex = normalizeHex(option.colorHex);
  if (normalizedOptionHex) return normalizedOptionHex.toUpperCase();

  const optionName = normalizeFrameColorName(option.name);
  const knownByName = getKnownFrameColorByName(optionName);
  if (knownByName && optionName !== sizeLabel) return knownByName.label;
  return "Trắng";
}

function getFrameOptionColorHex(
  option: FrameOption,
  colorName: string,
): string {
  const normalizedHex = normalizeHex(option.colorHex);
  if (normalizedHex) return normalizedHex;
  return getKnownFrameColorByName(colorName)?.hex ?? "#ffffff";
}

function formatDimension(value: number): string {
  return Number.isInteger(value)
    ? String(value)
    : String(value).replace(/\.?0+$/, "");
}

function getFrameSizeLabel(option: FrameOption): string {
  if (option.widthCm !== null && option.heightCm !== null) {
    return `${formatDimension(option.widthCm)}x${formatDimension(option.heightCm)}`;
  }
  if (option.label) return option.label;
  return normalizeFrameColorName(option.name);
}

export function mapFrameOptionSize(option: FrameOption): ApiFrameSize {
  const label = getFrameSizeLabel(option);
  const colorName = getFrameOptionColorName(option, label);

  return {
    id: option.id,
    label,
    price: option.price,
    popular: option.popular,
    status: option.status,
    widthCm: option.widthCm,
    heightCm: option.heightCm,
    colorHex: getFrameOptionColorHex(option, colorName),
    colorName,
  };
}

export function mapLegacyFrameSize(
  size: Omit<ApiFrameSize, "widthCm" | "heightCm" | "colorHex" | "colorName">,
  locale: "vi" | "en",
): ApiFrameSize {
  return {
    ...size,
    widthCm: null,
    heightCm: null,
    colorHex: "#ffffff",
    colorName: locale === "vi" ? "Trắng" : "White",
  };
}

function normalizeBackgroundCategory(value?: string | null): string {
  const normalized = value
    ?.trim()
    .toLowerCase()
    .replace(/[_\s]+/g, "-")
    .replace(/^-+|-+$/g, "");
  return normalized || "other";
}

export function getBackgroundCategories(
  backgrounds: Array<{ category?: string | null }>,
  locale: "vi" | "en",
): ApiCategory[] {
  const categoryIds = Array.from(
    new Set(
      backgrounds.map((background) =>
        normalizeBackgroundCategory(background.category),
      ),
    ),
  );

  return categoryIds
    .sort((left, right) => {
      const leftIndex = BACKGROUND_CATEGORY_ORDER.indexOf(left);
      const rightIndex = BACKGROUND_CATEGORY_ORDER.indexOf(right);
      const leftOrder = leftIndex === -1 ? Number.MAX_SAFE_INTEGER : leftIndex;
      const rightOrder =
        rightIndex === -1 ? Number.MAX_SAFE_INTEGER : rightIndex;
      return leftOrder - rightOrder || left.localeCompare(right, "vi");
    })
    .map((id) => ({
      id,
      name: BACKGROUND_CATEGORY_LABELS[id]?.[locale] ?? id.replace(/-/g, " "),
      slug: id,
    }));
}

export function mapFrameBackground(
  background: StudioFrameBackground,
): ApiTemplate {
  const category = normalizeBackgroundCategory(background.category);
  return {
    id: `background:${background.id}`,
    name: background.title,
    description: background.description,
    instructions: background.instructions,
    imageUrl: resolveStudioImageUrl(background.imageUrl),
    categoryId: category,
    configJson: null,
    contentFields: background.contentFields,
    status: background.status,
    source: "background",
    category,
    thumbnailUrl: resolveStudioImageUrl(background.thumbnailUrl ?? null),
    naturalWidth: background.naturalWidth ?? null,
    naturalHeight: background.naturalHeight ?? null,
  };
}

export function mapStudioAccessory(accessory: ApiAccessory): ApiAccessory {
  return {
    ...accessory,
    imageUrl: resolveStudioImageUrl(accessory.imageUrl),
    thumbnailUrl: resolveStudioImageUrl(accessory.thumbnailUrl ?? null),
    iconUrl: resolveStudioImageUrl(accessory.iconUrl),
  };
}
