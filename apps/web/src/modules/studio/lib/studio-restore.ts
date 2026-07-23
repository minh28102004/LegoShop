import type { SimpleCartItem } from "@/features/cart/store";
import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { getDictionary } from "@/lib/i18n/dictionaries";
import type {
  CharacterPartType,
  CustomFrameDesignData,
  JsonObject,
  JsonValue,
} from "@lego-shop/shared";

import { isCustomFrameDesignData } from "./design-data";
import { resolveStudioImageUrl } from "./studio-data";
import type {
  ApiCharacterPart,
  ApiFrameSize,
  ApiTemplate,
  ElementType,
  StudioCharacterInput,
  StudioCharacterPartSnapshot,
  StudioContentField,
  StudioContentFieldType,
  StudioElement,
} from "../state/studio.types";

type TemplateElement = Omit<StudioElement, "id">;

export type FrameRestoreOverride = {
  id: string | null;
  label: string | null;
  color: string | null;
};

const DEFAULT_STUDIO_COPY = getDictionary(DEFAULT_LOCALE).studio.defaults;
const DEFAULT_CONTENT_FIELDS: StudioContentField[] =
  DEFAULT_STUDIO_COPY.contentFields.map((field) => ({ ...field }));

export function getNextCharacterNumber(elements: StudioElement[]): number {
  return (
    elements
      .filter((element) => element.type === "character")
      .reduce((max, element) => {
        const match = element.content?.match(/^NV\s*(\d+)$/i);
        const value = match?.[1] ? Number(match[1]) : 0;
        return Number.isFinite(value) ? Math.max(max, value) : max;
      }, 0) + 1
  );
}

export function toCharacterPartSnapshot(
  part: ApiCharacterPart | StudioCharacterPartSnapshot | undefined,
): StudioCharacterPartSnapshot | undefined {
  if (!part) return undefined;
  return {
    id: part.id,
    name: part.name,
    type: part.type,
    imageUrl: resolveStudioImageUrl(part.imageUrl),
  };
}

export function buildCharacterPartSnapshots(
  input: StudioCharacterInput,
): Partial<
  Record<
    CharacterPartType,
    StudioCharacterPartSnapshot | StudioCharacterPartSnapshot[]
  >
> {
  const snapshots: Partial<
    Record<
      CharacterPartType,
      StudioCharacterPartSnapshot | StudioCharacterPartSnapshot[]
    >
  > = {};

  const face = toCharacterPartSnapshot(input.face);
  const hair = toCharacterPartSnapshot(input.hair);
  const torso = toCharacterPartSnapshot(input.torso);
  const legs = toCharacterPartSnapshot(input.legs);
  const hat = input.hat ? toCharacterPartSnapshot(input.hat) : undefined;
  const accessories =
    input.accessories
      ?.map((part) => toCharacterPartSnapshot(part))
      .filter((part): part is StudioCharacterPartSnapshot => Boolean(part)) ??
    [];

  if (face) snapshots.FACE = face;
  if (hair) snapshots.HAIR = hair;
  if (torso) snapshots.TORSO = torso;
  if (legs) snapshots.LEGS = legs;
  if (hat) snapshots.HAT = hat;
  snapshots.ACCESSORY = accessories;

  return snapshots;
}

export function calculateCharacterPrice(
  input: StudioCharacterInput,
  basePrice: number,
): number {
  const parts = [
    input.face,
    input.hair,
    input.torso,
    input.legs,
    ...(input.hat ? [input.hat] : []),
    ...(input.accessories ?? []),
  ];

  return parts.reduce(
    (total, part) => total + (part.priceAdjustment ?? 0),
    basePrice,
  );
}

export function getTemplateElements(
  configJson: JsonObject | null,
): TemplateElement[] {
  const elements = configJson?.elements;

  if (!Array.isArray(elements)) return [];

  return elements.flatMap((element) => {
    const parsed = parseTemplateElement(element);
    return parsed ? [parsed] : [];
  });
}

function parseTemplateElement(value: unknown): TemplateElement | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;

  const record = value as Record<string, unknown>;
  if (!isElementType(record.type)) return null;

  const element: TemplateElement = {
    type: record.type,
    x: readNumber(record.x) ?? 0,
    y: readNumber(record.y) ?? 0,
  };
  const content = readString(record.content);
  const imageUrl = readString(record.imageUrl);
  const fontSize = readNumber(record.fontSize);
  const color = readString(record.color);
  const width = readNumber(record.width);
  const height = readNumber(record.height);
  const price = readNumber(record.price);
  const accessoryId = readString(record.accessoryId);

  if (content !== undefined) element.content = content;
  if (imageUrl !== undefined)
    element.imageUrl = resolveStudioImageUrl(imageUrl) || imageUrl;
  if (fontSize !== undefined) element.fontSize = fontSize;
  if (color !== undefined) element.color = color;
  if (width !== undefined) element.width = width;
  if (height !== undefined) element.height = height;
  if (price !== undefined) element.price = price;
  if (accessoryId !== undefined) element.accessoryId = accessoryId;

  return element;
}

export function isElementType(value: unknown): value is ElementType {
  return value === "text" || value === "accessory" || value === "character";
}

export function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readNumber(value: unknown, fallback?: number): number | undefined {
  return typeof value === "number" ? value : fallback;
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeContentFieldType(value: unknown): StudioContentFieldType {
  if (value === "date" || value === "textarea" || value === "image") {
    return value;
  }
  return "text";
}

function beautifyContentFieldLabel(label: string): string {
  return label
    .replace(/[_-]+/g, " ")
    .replace(/(\p{Ll})(\p{Lu})/gu, "$1 $2")
    .replace(/([0-9])(\p{L})/gu, "$1 $2")
    .replace(/(\p{L})([0-9])/gu, "$1 $2")
    .replace(/\s+/g, " ")
    .trim();
}

function readContentFieldList(value: JsonValue | null | undefined): unknown[] {
  if (Array.isArray(value)) return value;
  if (!isRecord(value)) return [];

  const fields = value.fields ?? value.contentFields ?? value.inputs;
  return Array.isArray(fields) ? fields : [];
}

export function normalizeContentFields(
  value: JsonValue | null | undefined,
  fallbackFields: StudioContentField[] = DEFAULT_CONTENT_FIELDS,
  getFallbackLabel: (index: number) => string = DEFAULT_STUDIO_COPY.fieldLabel,
): StudioContentField[] {
  const fields = readContentFieldList(value)
    .map((field, index): StudioContentField | null => {
      if (!isRecord(field)) return null;

      const key = readString(field.key)?.trim() || `field_${index + 1}`;
      const rawLabel =
        readString(field.label)?.trim() ||
        readString(field.name)?.trim() ||
        getFallbackLabel(index + 1);
      const label = beautifyContentFieldLabel(rawLabel);
      const type = normalizeContentFieldType(field.type);
      const placeholder = readString(field.placeholder)?.trim();
      const helpText =
        readString(field.helpText)?.trim() ||
        readString(field.description)?.trim();
      const align = readString(field.align);
      const x = readNumber(field.x);
      const y = readNumber(field.y);
      const width = readNumber(field.width);
      const height = readNumber(field.height);
      const fontSize = readNumber(field.fontSize);
      const fontWeight = readNumber(field.fontWeight);
      const maxLines = readNumber(field.maxLines);

      return {
        key,
        label,
        type,
        required: readBoolean(field.required, index === 0),
        ...(placeholder ? { placeholder } : {}),
        ...(helpText ? { helpText } : {}),
        ...(x !== undefined ? { x } : {}),
        ...(y !== undefined ? { y } : {}),
        ...(width !== undefined ? { width } : {}),
        ...(height !== undefined ? { height } : {}),
        ...(fontSize !== undefined ? { fontSize } : {}),
        ...(fontWeight !== undefined ? { fontWeight } : {}),
        ...(align === "left" || align === "center" || align === "right"
          ? { align }
          : {}),
        ...(maxLines !== undefined ? { maxLines } : {}),
      };
    })
    .filter((field): field is StudioContentField => Boolean(field));

  return fields.length > 0 ? fields : fallbackFields;
}

function getStoredStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => typeof item === "string"),
  ) as Record<string, string>;
}

function matchesContentAlias(
  field: StudioContentField,
  aliases: string[],
): boolean {
  const haystack = normalizeSearchText(`${field.key} ${field.label}`);
  return aliases.some((alias) => haystack.includes(normalizeSearchText(alias)));
}

function getFallbackContentValue(
  designData: CustomFrameDesignData,
  field: StudioContentField,
): string {
  if (
    matchesContentAlias(field, [
      "recipientName",
      "recipient",
      "name",
      "title",
      "ten",
    ])
  ) {
    return designData.content.recipientName;
  }
  if (matchesContentAlias(field, ["graduationDate", "date", "day", "ngay"])) {
    return designData.content.graduationDate;
  }
  if (
    matchesContentAlias(field, [
      "majorOrSchool",
      "major",
      "school",
      "nganh",
      "truong",
    ])
  ) {
    return designData.content.majorOrSchool;
  }
  if (matchesContentAlias(field, ["message", "note", "loi", "thong"])) {
    return designData.content.message;
  }

  return "";
}

export function getRestoredContentValues(
  designData: CustomFrameDesignData,
  backgroundTemplateId: string | null,
  templates: ApiTemplate[],
  currentContentFields: StudioContentField[],
): Record<string, string> {
  const storedValues = getStoredStringRecord(designData.contentValues);
  const restoredValues: Record<string, string> = {
    ...storedValues,
    recipientName:
      storedValues.recipientName ?? designData.content.recipientName,
    graduationDate:
      storedValues.graduationDate ?? designData.content.graduationDate,
    majorOrSchool:
      storedValues.majorOrSchool ?? designData.content.majorOrSchool,
    message: storedValues.message ?? designData.content.message,
    title: storedValues.title ?? designData.content.recipientName,
    name: storedValues.name ?? designData.content.recipientName,
    date: storedValues.date ?? designData.content.graduationDate,
    major: storedValues.major ?? designData.content.majorOrSchool,
    school: storedValues.school ?? designData.content.majorOrSchool,
  };
  const templateFields = backgroundTemplateId
    ? normalizeContentFields(
        templates.find((template) => template.id === backgroundTemplateId)
          ?.contentFields,
        currentContentFields,
      )
    : currentContentFields;

  templateFields.forEach((field) => {
    if (restoredValues[field.key]?.trim()) return;
    const fallbackValue = getFallbackContentValue(designData, field);
    if (fallbackValue.trim()) restoredValues[field.key] = fallbackValue;
  });

  return restoredValues;
}

export function getRestoredTextElements(
  designData: CustomFrameDesignData,
): StudioElement[] {
  const storedElements = designData.elements;
  if (!Array.isArray(storedElements)) return [];

  return storedElements.flatMap((element, index): StudioElement[] => {
    const parsed = parseTemplateElement(element);
    if (!parsed || parsed.type !== "text") return [];

    const storedId = isRecord(element) ? readString(element.id) : undefined;
    return [
      {
        ...parsed,
        owner: "user",
        id:
          storedId ??
          `text-${index}-${Math.random().toString(36).substring(2, 8)}`,
      },
    ];
  });
}

function normalizeFrameMatchText(value: string | null | undefined): string {
  return normalizeSearchText(value ?? "").replace(/\s+/g, "");
}

function getFrameLabelFromName(
  value: string | null | undefined,
): string | null {
  const match = value?.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  return match?.[1] && match?.[2] ? `${match[1]}x${match[2]}` : null;
}

function getFrameColorFromName(
  value: string | null | undefined,
): string | null {
  const parts =
    value
      ?.split(/\s+-\s+/)
      .map((part) => part.trim())
      .filter(Boolean) ?? [];
  return parts.length > 1 ? (parts[parts.length - 1] ?? null) : null;
}

function findFrameSizeByLabelAndColor(
  frameSizes: ApiFrameSize[],
  label: string | null | undefined,
  color: string | null | undefined,
): string | null {
  const normalizedLabel = normalizeFrameMatchText(label);
  if (!normalizedLabel) return null;

  const normalizedColor = normalizeFrameMatchText(color);
  const matchesLabel = (size: ApiFrameSize) =>
    normalizeFrameMatchText(size.label) === normalizedLabel;
  const matchesColor = (size: ApiFrameSize) =>
    !normalizedColor ||
    normalizeFrameMatchText(size.colorName) === normalizedColor;

  return (
    frameSizes.find((size) => matchesLabel(size) && matchesColor(size))?.id ??
    frameSizes.find(matchesLabel)?.id ??
    null
  );
}

function findFrameSizeByDisplay(
  cartItem: SimpleCartItem,
  frameSizes: ApiFrameSize[],
  override?: FrameRestoreOverride | null,
): string | null {
  if (override?.id && frameSizes.some((size) => size.id === override.id)) {
    return override.id;
  }

  const overrideMatch = override
    ? findFrameSizeByLabelAndColor(frameSizes, override.label, override.color)
    : null;
  if (overrideMatch) return overrideMatch;

  const framePart = cartItem.parts?.find((part) => part.type === "frame");
  const designData = cartItem.designData;
  const designFrameLabel = isCustomFrameDesignData(designData)
    ? designData.frameOptionLabel
    : null;
  const designFrameColor = isCustomFrameDesignData(designData)
    ? designData.frameColorName
    : null;
  const displayCandidates = [
    {
      label: getFrameLabelFromName(framePart?.name),
      color: getFrameColorFromName(framePart?.name),
    },
    { label: cartItem.frameSizeLabel, color: cartItem.frameColorName },
    { label: designFrameLabel, color: designFrameColor },
  ];

  for (const candidate of displayCandidates) {
    const match = findFrameSizeByLabelAndColor(
      frameSizes,
      candidate.label,
      candidate.color,
    );
    if (match) return match;
  }

  return null;
}

export function getRestoredFrameSizeId(
  cartItem: SimpleCartItem,
  frameSizes: ApiFrameSize[],
  override?: FrameRestoreOverride | null,
): string {
  const displayedFrameSizeId = findFrameSizeByDisplay(
    cartItem,
    frameSizes,
    override,
  );
  if (displayedFrameSizeId) return displayedFrameSizeId;

  const framePartId = cartItem.parts?.find(
    (part) => part.type === "frame" && part.id,
  )?.id;
  if (framePartId && frameSizes.some((size) => size.id === framePartId)) {
    return framePartId;
  }

  if (
    typeof cartItem.frameOptionId === "string" &&
    cartItem.frameOptionId &&
    frameSizes.some((size) => size.id === cartItem.frameOptionId)
  ) {
    return cartItem.frameOptionId;
  }

  const designData = cartItem.designData;
  if (
    isCustomFrameDesignData(designData) &&
    typeof designData.frameOptionId === "string" &&
    frameSizes.some((size) => size.id === designData.frameOptionId)
  ) {
    return designData.frameOptionId;
  }

  return cartItem.frameSizeId;
}

export function getStoredCharacterPartSnapshot(
  value: unknown,
): StudioCharacterPartSnapshot | undefined {
  const record = Array.isArray(value)
    ? isRecord(value[0])
      ? value[0]
      : null
    : isRecord(value)
      ? value
      : null;
  if (!record) return undefined;

  const id = readString(record.id);
  const name = readString(record.name);
  const type = readString(record.type);
  const imageUrl = readString(record.imageUrl) ?? null;

  if (
    !id ||
    !name ||
    (type !== "FACE" &&
      type !== "HAIR" &&
      type !== "TORSO" &&
      type !== "LEGS" &&
      type !== "HAT" &&
      type !== "ACCESSORY")
  ) {
    return undefined;
  }

  return { id, name, type, imageUrl };
}

export function getStoredCharacterAccessorySnapshots(
  value: unknown,
): StudioCharacterPartSnapshot[] {
  if (!Array.isArray(value)) {
    const snapshot = getStoredCharacterPartSnapshot(value);
    return snapshot ? [snapshot] : [];
  }

  return value
    .map((item) => getStoredCharacterPartSnapshot(item))
    .filter((item): item is StudioCharacterPartSnapshot => Boolean(item));
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}
