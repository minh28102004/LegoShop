"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { publicApiClient } from "@/lib/api/public-client";
import { useCartStore, type SimpleCartItem } from "@/features/cart/store";
import { isCustomFrameDesignData } from "../lib/design-data";
import type {
  Character,
  CharacterPart,
  CharacterPartType,
  CharacterPreset,
  FrameBackground,
  FrameOption,
  CustomFrameDesignData,
  JsonObject,
  JsonValue,
} from "@lego-shop/shared";

export type ElementType = "text" | "accessory" | "character";

export interface StudioElement {
  id: string;
  type: ElementType;
  x: number;
  y: number;
  content?: string; // text content
  imageUrl?: string; // image for accessory
  fontSize?: number;
  color?: string;
  width?: number;
  height?: number;
  price?: number;
  accessoryId?: string; // link back to original accessory
  characterId?: string; // link back to admin character catalog
  scale?: number;
  rotation?: number;
  faceId?: string;
  hairId?: string;
  torsoId?: string;
  legsId?: string;
  hatId?: string;
  accessoryIds?: string[];
  characterParts?: Partial<Record<CharacterPartType, StudioCharacterPartSnapshot | StudioCharacterPartSnapshot[]>>;
}

export interface PrintText {
  title: string;
  date: string;
  message: string;
}

export type StudioContentFieldType = "text" | "date" | "textarea" | "image";

export interface StudioContentField {
  key: string;
  label: string;
  type: StudioContentFieldType;
  required: boolean;
  placeholder?: string;
  helpText?: string;
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  fontSize?: number;
  fontWeight?: number;
  align?: "left" | "center" | "right";
  maxLines?: number;
}

export interface ApiTemplate {
  id: string;
  name: string;
  description?: string | null;
  instructions?: string | null;
  imageUrl: string | null;
  categoryId: string | null;
  configJson: JsonObject | null;
  contentFields?: JsonValue | null;
  status?: string;
  source?: "template" | "background";
}

export interface ApiAccessory {
  id: string;
  name: string;
  price: number;
  imageUrl: string | null;
  iconUrl: string | null;
  categoryId: string | null;
}

export type ApiCharacter = Character;
export type ApiCharacterPart = CharacterPart;
export type ApiCharacterPreset = CharacterPreset;

export type StudioCharacterPartSnapshot = {
  id: string;
  name: string;
  type: CharacterPartType;
  imageUrl: string | null;
};

export type StudioCharacterInput = {
  name?: string;
  face: ApiCharacterPart;
  hair: ApiCharacterPart;
  torso: ApiCharacterPart;
  legs: ApiCharacterPart;
  hat?: ApiCharacterPart;
  accessories?: ApiCharacterPart[];
};

export interface ApiCategory {
  id: string;
  name: string;
}

export interface ApiFrameSize {
  id: string;
  label: string;
  price: number;
  popular: boolean;
  status: string;
  widthCm: number | null;
  heightCm: number | null;
  colorHex: string | null;
  colorName: string | null;
}

export interface ApiFrameBackground {
  id: string;
  title: string;
  description?: string | null;
  instructions?: string | null;
  imageUrl: string;
  contentFields?: JsonValue | null;
  sortOrder: number;
  status: string;
}

export interface StudioContextType {
  step: number;
  setStep: (step: number) => void;
  frameSize: string;
  setFrameSize: (size: string) => void;
  printText: PrintText;
  setPrintText: (text: PrintText) => void;
  contentFields: StudioContentField[];
  contentValues: Record<string, string>;
  setContentValue: (key: string, value: string) => void;
  clearContentValues: () => void;
  
  elements: StudioElement[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  activeTemplate: string | null;
  setActiveTemplate: (id: string | null) => void;
  customBackgroundUrl: string | null;
  setCustomBackgroundUrl: (url: string | null) => void;
  customBackgroundOriginalName: string | null;
  setCustomBackgroundOriginalName: (name: string | null) => void;
  zoom: number;
  setZoom: (zoom: number) => void;
  editCartItemId: string | null;
  isEditMode: boolean;
  
  // Characters (nhân vật LEGO)
  characterCount: number;
  setCharacterCount: (count: number) => void;
  characterPrice: number;

  totalPrice: number;
  
  addElement: (el: Omit<StudioElement, "id">) => void;
  addCharacter: (character: StudioCharacterInput) => void;
  updateCharacterParts: (id: string, character: StudioCharacterInput) => void;
  removeLastCharacter: () => void;
  updateElement: (id: string, updates: Partial<StudioElement>) => void;
  removeElement: (id: string) => void;
  clearAll: () => void;

  // Data from API
  templates: ApiTemplate[];
  templateCategories: ApiCategory[];
  accessories: ApiAccessory[];
  characters: ApiCharacter[];
  characterParts: ApiCharacterPart[];
  characterPresets: ApiCharacterPreset[];
  accessoryCategories: ApiCategory[];
  frameSizes: ApiFrameSize[];
  isLoadingData: boolean;
  dataError: string | null;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

type TemplateElement = Omit<StudioElement, "id">;

type FrameRestoreOverride = {
  id: string | null;
  label: string | null;
  color: string | null;
};

const STUDIO_BACKGROUND_FALLBACKS = [
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1516589178581-6cd7833ae3b2?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1513151233558-d860c5398176?w=900&auto=format&fit=crop&q=80",
  "https://images.unsplash.com/photo-1529636798458-92182e662485?w=900&auto=format&fit=crop&q=80",
];

const ACCESSORY_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518199266791-5375a83190b7?w=240&auto=format&fit=crop&q=70";

const DEFAULT_CONTENT_FIELDS: StudioContentField[] = [
  {
    key: "title",
    label: "Tên / lời tựa ngắn",
    type: "text",
    required: true,
    placeholder: "VD: Tú & Lan",
  },
  {
    key: "date",
    label: "Ngày kỷ niệm",
    type: "date",
    required: false,
    placeholder: "VD: 01/06/2026",
  },
  {
    key: "message",
    label: "Lời nhắn",
    type: "textarea",
    required: false,
    placeholder: "Nhập lời nhắn gửi...",
  },
];

function getNextCharacterNumber(elements: StudioElement[]): number {
  return elements
    .filter((element) => element.type === "character")
    .reduce((max, element) => {
      const match = element.content?.match(/^NV\s*(\d+)$/i);
      const value = match?.[1] ? Number(match[1]) : 0;
      return Number.isFinite(value) ? Math.max(max, value) : max;
    }, 0) + 1;
}

function resolveStudioImageUrl(imageUrl: string | null, fallbackIndex = 0): string | null {
  if (!imageUrl) return null;
  if (imageUrl.includes("example.com")) {
    return STUDIO_BACKGROUND_FALLBACKS[fallbackIndex % STUDIO_BACKGROUND_FALLBACKS.length] ?? ACCESSORY_FALLBACK_IMAGE;
  }

  return resolveApiAssetUrl(imageUrl) || imageUrl;
}

function toCharacterPartSnapshot(
  part: ApiCharacterPart | StudioCharacterPartSnapshot | undefined,
): StudioCharacterPartSnapshot | undefined {
  if (!part) return undefined;
  return {
    id: part.id,
    name: part.name,
    type: part.type,
    imageUrl: resolveStudioImageUrl(part.imageUrl) ?? part.imageUrl ?? null,
  };
}

function buildCharacterPartSnapshots(
  input: StudioCharacterInput,
): Partial<Record<CharacterPartType, StudioCharacterPartSnapshot | StudioCharacterPartSnapshot[]>> {
  const snapshots: Partial<
    Record<CharacterPartType, StudioCharacterPartSnapshot | StudioCharacterPartSnapshot[]>
  > = {};

  const face = toCharacterPartSnapshot(input.face);
  const hair = toCharacterPartSnapshot(input.hair);
  const torso = toCharacterPartSnapshot(input.torso);
  const legs = toCharacterPartSnapshot(input.legs);
  const hat = input.hat ? toCharacterPartSnapshot(input.hat) : undefined;
  const accessories =
    input.accessories
      ?.map((part) => toCharacterPartSnapshot(part))
      .filter((part): part is StudioCharacterPartSnapshot => Boolean(part)) ?? [];

  if (face) snapshots.FACE = face;
  if (hair) snapshots.HAIR = hair;
  if (torso) snapshots.TORSO = torso;
  if (legs) snapshots.LEGS = legs;
  if (hat) snapshots.HAT = hat;
  snapshots.ACCESSORY = accessories;

  return snapshots;
}

function calculateCharacterPrice(input: StudioCharacterInput, basePrice: number): number {
  const parts = [
    input.face,
    input.hair,
    input.torso,
    input.legs,
    ...(input.hat ? [input.hat] : []),
    ...(input.accessories ?? []),
  ];

  return parts.reduce((total, part) => total + (part.priceAdjustment ?? 0), basePrice);
}

function getTemplateElements(configJson: JsonObject | null): TemplateElement[] {
  const elements = configJson?.elements;

  if (!Array.isArray(elements)) {
    return [];
  }

  return elements.flatMap((element) => {
    const parsed = parseTemplateElement(element);
    return parsed ? [parsed] : [];
  });
}

function parseTemplateElement(value: unknown): TemplateElement | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return null;
  }

  const record = value as Record<string, unknown>;

  if (!isElementType(record.type)) {
    return null;
  }

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
  if (imageUrl !== undefined) element.imageUrl = resolveApiAssetUrl(imageUrl) || imageUrl;
  if (fontSize !== undefined) element.fontSize = fontSize;
  if (color !== undefined) element.color = color;
  if (width !== undefined) element.width = width;
  if (height !== undefined) element.height = height;
  if (price !== undefined) element.price = price;
  if (accessoryId !== undefined) element.accessoryId = accessoryId;

  return element;
}

function isElementType(value: unknown): value is ElementType {
  return value === "text" || value === "accessory" || value === "character";
}

function readString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function readBoolean(value: unknown, fallback = false): boolean {
  return typeof value === "boolean" ? value : fallback;
}

function readNumber(value: unknown, fallback?: number): number | undefined {
  return typeof value === "number" ? value : fallback;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function normalizeContentFieldType(value: unknown): StudioContentFieldType {
  if (value === "date" || value === "textarea" || value === "image") return value;
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

function normalizeContentFields(value: JsonValue | null | undefined): StudioContentField[] {
  const fields = readContentFieldList(value)
    .map((field, index): StudioContentField | null => {
      if (!isRecord(field)) return null;

      const key = readString(field.key)?.trim() || `field_${index + 1}`;
      const rawLabel = readString(field.label)?.trim() || readString(field.name)?.trim() || `Thông tin ${index + 1}`;
      const label = beautifyContentFieldLabel(rawLabel);
      const type = normalizeContentFieldType(field.type);
      const placeholder = readString(field.placeholder)?.trim();
      const helpText = readString(field.helpText)?.trim() || readString(field.description)?.trim();
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
        ...(align === "left" || align === "center" || align === "right" ? { align } : {}),
        ...(maxLines !== undefined ? { maxLines } : {}),
      };
    })
    .filter((field): field is StudioContentField => Boolean(field));

  return fields.length > 0 ? fields : DEFAULT_CONTENT_FIELDS;
}

function getStoredStringRecord(value: unknown): Record<string, string> {
  if (!isRecord(value)) return {};

  return Object.fromEntries(
    Object.entries(value).filter(([, item]) => typeof item === "string"),
  ) as Record<string, string>;
}

function matchesContentAlias(field: StudioContentField, aliases: string[]): boolean {
  const haystack = normalizeSearchText(`${field.key} ${field.label}`);
  return aliases.some((alias) => haystack.includes(normalizeSearchText(alias)));
}

function getFallbackContentValue(
  designData: CustomFrameDesignData,
  field: StudioContentField,
): string {
  if (matchesContentAlias(field, ["recipientName", "recipient", "name", "title", "ten"])) {
    return designData.content.recipientName;
  }
  if (matchesContentAlias(field, ["graduationDate", "date", "day", "ngay"])) {
    return designData.content.graduationDate;
  }
  if (matchesContentAlias(field, ["majorOrSchool", "major", "school", "nganh", "truong"])) {
    return designData.content.majorOrSchool;
  }
  if (matchesContentAlias(field, ["message", "note", "loi", "thong"])) {
    return designData.content.message;
  }

  return "";
}

function getRestoredContentValues(
  designData: CustomFrameDesignData,
  backgroundTemplateId: string | null,
  templates: ApiTemplate[],
  currentContentFields: StudioContentField[],
): Record<string, string> {
  const storedValues = getStoredStringRecord(designData.contentValues);
  const restoredValues: Record<string, string> = {
    ...storedValues,
    recipientName: storedValues.recipientName ?? designData.content.recipientName,
    graduationDate: storedValues.graduationDate ?? designData.content.graduationDate,
    majorOrSchool: storedValues.majorOrSchool ?? designData.content.majorOrSchool,
    message: storedValues.message ?? designData.content.message,
    title: storedValues.title ?? designData.content.recipientName,
    name: storedValues.name ?? designData.content.recipientName,
    date: storedValues.date ?? designData.content.graduationDate,
    major: storedValues.major ?? designData.content.majorOrSchool,
    school: storedValues.school ?? designData.content.majorOrSchool,
  };
  const templateFields = backgroundTemplateId
    ? normalizeContentFields(templates.find((tpl) => tpl.id === backgroundTemplateId)?.contentFields)
    : currentContentFields;

  templateFields.forEach((field) => {
    if (restoredValues[field.key]?.trim()) return;
    const fallbackValue = getFallbackContentValue(designData, field);
    if (fallbackValue.trim()) restoredValues[field.key] = fallbackValue;
  });

  return restoredValues;
}

function getRestoredTextElements(designData: CustomFrameDesignData): StudioElement[] {
  const storedElements = designData.elements;
  if (!Array.isArray(storedElements)) return [];

  return storedElements.flatMap((element, index): StudioElement[] => {
    const parsed = parseTemplateElement(element);
    if (!parsed || parsed.type !== "text") return [];

    const storedId = isRecord(element) ? readString(element.id) : undefined;
    return [
      {
        ...parsed,
        id: storedId ?? `text-${index}-${Math.random().toString(36).substring(2, 8)}`,
      },
    ];
  });
}

function normalizeFrameMatchText(value: string | null | undefined): string {
  return normalizeSearchText(value ?? "").replace(/\s+/g, "");
}

function getFrameLabelFromName(value: string | null | undefined): string | null {
  const match = value?.match(/(\d+(?:\.\d+)?)\s*x\s*(\d+(?:\.\d+)?)/i);
  return match?.[1] && match?.[2] ? `${match[1]}x${match[2]}` : null;
}

function getFrameColorFromName(value: string | null | undefined): string | null {
  const parts = value?.split(/\s+-\s+/).map((part) => part.trim()).filter(Boolean) ?? [];
  return parts.length > 1 ? parts[parts.length - 1] ?? null : null;
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
    !normalizedColor || normalizeFrameMatchText(size.colorName) === normalizedColor;

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
  const designFrameLabel = isCustomFrameDesignData(designData) ? designData.frameOptionLabel : null;
  const designFrameColor = isCustomFrameDesignData(designData) ? designData.frameColorName : null;
  const displayCandidates = [
    {
      label: getFrameLabelFromName(framePart?.name),
      color: getFrameColorFromName(framePart?.name),
    },
    {
      label: cartItem.frameSizeLabel,
      color: cartItem.frameColorName,
    },
    {
      label: designFrameLabel,
      color: designFrameColor,
    },
  ];

  for (const candidate of displayCandidates) {
    const match = findFrameSizeByLabelAndColor(frameSizes, candidate.label, candidate.color);
    if (match) return match;
  }

  return null;
}

function getRestoredFrameSizeId(
  cartItem: SimpleCartItem,
  frameSizes: ApiFrameSize[],
  override?: FrameRestoreOverride | null,
): string {
  const displayedFrameSizeId = findFrameSizeByDisplay(cartItem, frameSizes, override);
  if (displayedFrameSizeId) return displayedFrameSizeId;

  const framePartId = cartItem.parts?.find((part) => part.type === "frame" && part.id)?.id;
  if (framePartId && frameSizes.some((size) => size.id === framePartId)) return framePartId;

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

function getStoredCharacterPartSnapshot(
  value: unknown,
): StudioCharacterPartSnapshot | undefined {
  const record = Array.isArray(value)
    ? (isRecord(value[0]) ? value[0] : null)
    : (isRecord(value) ? value : null);
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

function getStoredCharacterAccessorySnapshots(value: unknown): StudioCharacterPartSnapshot[] {
  if (!Array.isArray(value)) {
    const snapshot = getStoredCharacterPartSnapshot(value);
    return snapshot ? [snapshot] : [];
  }

  return value
    .map((item) => getStoredCharacterPartSnapshot(item))
    .filter((item): item is StudioCharacterPartSnapshot => Boolean(item));
}

function resolvePrintTextPatch(
  fields: StudioContentField[],
  key: string,
  value: string,
): Partial<PrintText> | null {
  const field = fields.find(item => item.key === key);
  const normalizedKey = key.toLowerCase();

  if (
    normalizedKey === "title" ||
    normalizedKey === "name" ||
    normalizedKey.includes("name") ||
    normalizedKey.includes("title")
  ) {
    return { title: value };
  }

  if (field?.type === "date" || normalizedKey.includes("date") || normalizedKey.includes("day")) {
    return { date: value };
  }

  if (
    field?.type === "textarea" ||
    normalizedKey.includes("message") ||
    normalizedKey.includes("note") ||
    normalizedKey.includes("description")
  ) {
    return { message: value };
  }

  return null;
}

function normalizeFrameColorName(name: string): string {
  const trimmed = name.trim();
  if (trimmed.toLowerCase() === "goo" || trimmed === "Gỗoo") return "Gỗ";
  return trimmed;
}

function normalizeSearchText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
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

const KNOWN_FRAME_COLORS = [
  { label: "Trắng", hex: "#ffffff", names: ["trang", "white"], hexes: ["#ffffff"] },
  { label: "Đen", hex: "#1f1f21", names: ["den", "black"], hexes: ["#000000", "#111111", "#1a1a1a", "#1f1f21"] },
  { label: "Gỗ", hex: "#d7a15c", names: ["go", "wood"], hexes: ["#d7a15c"] },
  { label: "Xám", hex: "#808080", names: ["xam", "gray", "grey"], hexes: ["#808080", "#6b7280", "#9ca3af"] },
  { label: "Nâu", hex: "#8b4513", names: ["nau", "brown"], hexes: ["#8b4513"] },
  { label: "Đỏ", hex: "#ef4444", names: ["do", "red"], hexes: ["#ff0000", "#ef4444", "#dc2626"] },
  { label: "Vàng", hex: "#facc15", names: ["vang", "yellow"], hexes: ["#facc15", "#fbbf24", "#ffd700"] },
  { label: "Xanh", hex: "#3b82f6", names: ["xanh", "blue"], hexes: ["#3b82f6", "#2563eb"] },
] as const;

function getKnownFrameColorByHex(colorHex?: string | null) {
  const normalizedHex = normalizeHex(colorHex);
  if (!normalizedHex) return null;
  return KNOWN_FRAME_COLORS.find((color) => (color.hexes as readonly string[]).includes(normalizedHex)) ?? null;
}

function getKnownFrameColorByName(name: string) {
  const normalizedName = normalizeSearchText(name);
  return KNOWN_FRAME_COLORS.find((color) => (color.names as readonly string[]).includes(normalizedName)) ?? null;
}

function readFrameOptionMetadataString(option: FrameOption, keys: string[]): string | null {
  const metadata = option.metadata;
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return null;
  const record = metadata as Record<string, unknown>;

  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return null;
}

function getFrameOptionColorName(option: FrameOption, sizeLabel: string): string {
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

function getFrameOptionColorHex(option: FrameOption, colorName: string): string {
  const normalizedHex = normalizeHex(option.colorHex);
  if (normalizedHex) return normalizedHex;
  return getKnownFrameColorByName(colorName)?.hex ?? "#ffffff";
}

function formatDimension(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value).replace(/\.?0+$/, "");
}

function getFrameSizeLabel(option: FrameOption): string {
  if (option.widthCm !== null && option.heightCm !== null) {
    return `${formatDimension(option.widthCm)}x${formatDimension(option.heightCm)}`;
  }
  if (option.label) return option.label;
  return normalizeFrameColorName(option.name);
}

function mapFrameOptionSize(option: FrameOption): ApiFrameSize {
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

function mapLegacyFrameSize(size: Omit<ApiFrameSize, "widthCm" | "heightCm" | "colorHex" | "colorName">): ApiFrameSize {
  return {
    ...size,
    widthCm: null,
    heightCm: null,
    colorHex: "#ffffff",
    colorName: "Trắng",
  };
}

function mapFrameBackground(background: FrameBackground, index = 0): ApiTemplate {
  return {
    id: `background:${background.id}`,
    name: background.title,
    description: background.description,
    instructions: background.instructions,
    imageUrl: resolveStudioImageUrl(background.imageUrl, index),
    categoryId: null,
    configJson: null,
    contentFields: background.contentFields,
    status: background.status,
    source: "background",
  };
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const searchParams = useSearchParams();
  const searchParamString = searchParams.toString();
  const [step, setStep] = useState<number>(1);
  const [frameSize, setFrameSize] = useState<string>("");
  const [printText, setPrintText] = useState<PrintText>({ title: "", date: "", message: "" });
  const [contentValues, setContentValues] = useState<Record<string, string>>({});
  const [characterCount, setCharacterCount] = useState<number>(0);
  const CHARACTER_PRICE = 10000; // 10,000đ per character
  
  const [elements, setElements] = useState<StudioElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [customBackgroundOriginalName, setCustomBackgroundOriginalName] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);
  const [editCartItemId, setEditCartItemId] = useState<string | null>(null);
  const [frameRestoreOverride, setFrameRestoreOverride] = useState<FrameRestoreOverride | null>(null);
  const hasRestoredCartItemRef = useRef(false);
  const lastRestoreKeyRef = useRef<string | null>(null);
  const skipNextTemplateResetRef = useRef(false);
  const restoredActiveTemplateRef = useRef<string | null | undefined>(undefined);

  // API State
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [templateCategories, setTemplateCategories] = useState<ApiCategory[]>([]);
  const [accessories, setAccessories] = useState<ApiAccessory[]>([]);
  const [characters, setCharacters] = useState<ApiCharacter[]>([]);
  const [characterParts, setCharacterParts] = useState<ApiCharacterPart[]>([]);
  const [characterPresets, setCharacterPresets] = useState<ApiCharacterPreset[]>([]);
  const [accessoryCategories, setAccessoryCategories] = useState<ApiCategory[]>([]);
  const [frameSizes, setFrameSizes] = useState<ApiFrameSize[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(searchParamString);
    const nextEditCartItemId = params.get("editCartItemId");
    const nextOverride: FrameRestoreOverride = {
      id: params.get("frameOptionId"),
      label: params.get("frameLabel"),
      color: params.get("frameColor"),
    };
    const nextOverrideValue =
      nextOverride.id || nextOverride.label || nextOverride.color
        ? nextOverride
        : null;
    const nextRestoreKey = JSON.stringify({
      editCartItemId: nextEditCartItemId,
      frameOverride: nextOverrideValue,
    });

    if (lastRestoreKeyRef.current !== nextRestoreKey) {
      hasRestoredCartItemRef.current = false;
      restoredActiveTemplateRef.current = undefined;
      lastRestoreKeyRef.current = null;
    }

    setEditCartItemId(nextEditCartItemId);
    setFrameRestoreOverride(nextOverrideValue);
  }, [searchParamString]);

  useEffect(() => {
    async function loadData() {
      try {
        setDataError(null);
        const [
          accs,
          accCats,
          frameOptions,
          fSizes,
          backgrounds,
          characterItems,
          characterPartItems,
          characterPresetItems,
        ] = await Promise.all([
          publicApiClient.products.listAccessories(),
          publicApiClient.categories.listAccessoryCategories(),
          publicApiClient.products.listFrameOptions({ type: "size" }),
          publicApiClient.products.listFrameSizes(),
          publicApiClient.products.listFrameBackgrounds(),
          publicApiClient.products.listCharacters().catch(() => []),
          publicApiClient.products.listCharacterParts().catch(() => []),
          publicApiClient.products.listCharacterPresets().catch(() => []),
        ]);
        const activeBackgrounds = backgrounds
          .filter(bg => bg.status === "active")
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(mapFrameBackground);

        setTemplates(activeBackgrounds);
        setTemplateCategories([]);
        setAccessories(accs
          .filter(a => a.status === 'active')
          .map((accessory, index) => ({
            ...accessory,
            imageUrl: resolveStudioImageUrl(accessory.imageUrl, index) ?? accessory.imageUrl,
            iconUrl: resolveStudioImageUrl(accessory.iconUrl, index) ?? accessory.iconUrl,
          })));
        setCharacters(characterItems
          .filter(character => character.status === "active")
          .map((character, index) => ({
            ...character,
            imageUrl: resolveStudioImageUrl(character.imageUrl, index) ?? character.imageUrl,
          })));
        setCharacterParts(characterPartItems
          .filter(part => part.status === "active")
          .map((part, index) => ({
            ...part,
            imageUrl: resolveStudioImageUrl(part.imageUrl, index) ?? part.imageUrl,
          })));
        setCharacterPresets(characterPresetItems.filter(preset => preset.status === "active"));
        setAccessoryCategories(accCats);

        const activeFrameOptions = frameOptions.filter(option => option.status === "active");
        const optionFrameSizes = activeFrameOptions
          .filter(option => option.type === "size")
          .map(mapFrameOptionSize);
        
        const activeFrameSizes = (optionFrameSizes.length > 0 ? optionFrameSizes : fSizes.map(mapLegacyFrameSize))
          .filter(f => f.status === 'active');
        
        setFrameSizes(activeFrameSizes);
      } catch (err) {
        console.error("Failed to load studio data:", err);
        setDataError("Không tải được dữ liệu studio. Vui lòng kiểm tra API hoặc thử lại sau.");
      } finally {
        setIsLoadingData(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (!frameSize || isLoadingData) return;

    let cancelled = false;
    publicApiClient.products
      .listFrameBackgrounds({ frameOptionId: frameSize })
      .then((backgrounds) => {
        if (cancelled) return;
        const activeBackgrounds = backgrounds
          .filter(bg => bg.status === "active")
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(mapFrameBackground);

        setTemplates(activeBackgrounds);
        setActiveTemplate((current) => {
          if (!current) return null;
          if (current.startsWith("background:")) {
            return activeBackgrounds.some((tpl) => tpl.id === current) ? current : null;
          }
          return current;
        });
      })
      .catch((error) => {
        console.error("Failed to reload frame backgrounds:", error);
      });

    return () => {
      cancelled = true;
    };
  }, [frameSize, isLoadingData]);

  // When activeTemplate changes, reload its default elements
  useEffect(() => {
    if (!activeTemplate || isLoadingData) return;
    if (
      hasRestoredCartItemRef.current &&
      restoredActiveTemplateRef.current !== undefined &&
      activeTemplate === restoredActiveTemplateRef.current
    ) {
      skipNextTemplateResetRef.current = false;
      return;
    }
    if (
      hasRestoredCartItemRef.current &&
      restoredActiveTemplateRef.current !== undefined &&
      activeTemplate !== restoredActiveTemplateRef.current
    ) {
      restoredActiveTemplateRef.current = undefined;
    }
    if (skipNextTemplateResetRef.current) {
      skipNextTemplateResetRef.current = false;
      return;
    }
    const tpl = templates.find(t => t.id === activeTemplate);
    const templateElements = tpl ? getTemplateElements(tpl.configJson) : [];
    if (templateElements.length > 0) {
      setElements(templateElements.map((el) => ({
        ...el,
        id: Math.random().toString(36).substring(2, 9)
      })));
    } else {
      setElements([]); // Clear if no default elements
    }
    setSelectedId(null);
    setContentValues({});
    setPrintText({ title: "", date: "", message: "" });
  }, [activeTemplate, templates, isLoadingData]);

  const activeTemplateObj = useMemo(
    () => templates.find(t => t.id === activeTemplate) ?? null,
    [activeTemplate, templates],
  );
  const contentFields = useMemo(
    () => normalizeContentFields(activeTemplateObj?.contentFields),
    [activeTemplateObj?.contentFields],
  );

  const activeFrameSizeObj = useMemo(
    () => frameSizes.find(s => s.id === frameSize),
    [frameSize, frameSizes],
  );

  useEffect(() => {
    if (!editCartItemId || isLoadingData) {
      return;
    }
    const restoreKey = JSON.stringify({
      editCartItemId,
      frameOverride: frameRestoreOverride,
    });
    if (hasRestoredCartItemRef.current && lastRestoreKeyRef.current === restoreKey) {
      return;
    }

    const cartItem = useCartStore.getState().items.find((item) => item.id === editCartItemId);
    hasRestoredCartItemRef.current = true;
    lastRestoreKeyRef.current = restoreKey;

    if (!cartItem) {
      alert("Không tìm thấy thiết kế trong giỏ hàng. Bạn có thể bắt đầu thiết kế mới.");
      setEditCartItemId(null);
      window.history.replaceState(null, "", "/studio");
      return;
    }

    restoreCartItem(cartItem);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCartItemId, frameRestoreOverride, isLoadingData, templates.length, characterParts.length, frameSizes.length]);

  function restoreCartItem(cartItem: SimpleCartItem) {
    const designData = cartItem.designData;
    const accessoryPriceById = new Map(
      (cartItem.accessories ?? []).map((accessory) => [accessory.id, accessory.price]),
    );
    const accessoryById = new Map(accessories.map((accessory) => [accessory.id, accessory]));
    const characterById = new Map(characters.map((character) => [character.id, character]));
    const characterPartById = new Map(characterParts.map((part) => [part.id, part]));

    const restoredFrameSizeId = getRestoredFrameSizeId(cartItem, frameSizes, frameRestoreOverride);
    if (process.env.NODE_ENV !== "production") {
      const framePart = cartItem.parts?.find((part) => part.type === "frame");
      console.info("[studio restore frame]", {
        restoredFrameSizeId,
        frameRestoreOverride,
        framePart,
        cartFrameSizeId: cartItem.frameSizeId,
        cartFrameSizeLabel: cartItem.frameSizeLabel,
        cartFrameColorName: cartItem.frameColorName,
        designFrameOptionId: isCustomFrameDesignData(designData) ? designData.frameOptionId : null,
        designFrameOptionLabel: isCustomFrameDesignData(designData) ? designData.frameOptionLabel : null,
        availableFrameSizes: frameSizes.map((size) => ({
          id: size.id,
          label: size.label,
          colorName: size.colorName,
        })),
      });
    }
    setFrameSize(restoredFrameSizeId);
    setSelectedId(null);
    setStep(4);

    if (isCustomFrameDesignData(designData)) {
      const backgroundTemplateId = designData.backgroundId
        ? `background:${designData.backgroundId}`
        : null;
      const uploadedBackground = designData.uploadedImages.find(
        (image) => image.type === "background",
      );

      skipNextTemplateResetRef.current = true;
      restoredActiveTemplateRef.current = backgroundTemplateId ?? null;
      if (backgroundTemplateId) {
        setActiveTemplate(backgroundTemplateId);
        setCustomBackgroundUrl(null);
        setCustomBackgroundOriginalName(null);
      } else if (uploadedBackground?.url) {
        setActiveTemplate(null);
        setCustomBackgroundUrl(uploadedBackground.url);
        setCustomBackgroundOriginalName(uploadedBackground.originalName);
      }

      setPrintText({
        title: designData.content.recipientName,
        date: designData.content.graduationDate,
        message: designData.content.message,
      });
      setContentValues(getRestoredContentValues(designData, backgroundTemplateId, templates, contentFields));
      setCharacterCount(designData.characters.length);
      setElements([
        ...getRestoredTextElements(designData),
        ...designData.accessories.map((accessory) => ({
          id: `${accessory.id}-${Math.random().toString(36).substring(2, 8)}`,
          type: "accessory" as const,
          x: accessory.position.x,
          y: accessory.position.y,
          width: 60 * accessory.position.scale,
          height: 60 * accessory.position.scale,
          content: accessory.name,
          imageUrl: readString(accessory.imageUrl) ?? accessoryById.get(accessory.id)?.imageUrl ?? accessoryById.get(accessory.id)?.iconUrl ?? "",
          price: accessoryPriceById.get(accessory.id) ?? 0,
          accessoryId: accessory.id,
        })),
        ...designData.characters.map((character, index) => {
          const catalogCharacter = character.catalogId ? characterById.get(character.catalogId) : null;
          const imageUrl = character.imageUrl ?? catalogCharacter?.imageUrl ?? null;
          const position = character.position ?? {
            x: character.x,
            y: character.y,
            scale: character.scale,
            rotate: character.rotation,
          };
          const accessoryIds = Array.isArray(character.accessoryIds) ? character.accessoryIds : [];
          const face = characterPartById.get(character.faceId);
          const hair = characterPartById.get(character.hairId);
          const torso = characterPartById.get(character.torsoId);
          const legs = characterPartById.get(character.legsId);
          const hat = character.hatId ? characterPartById.get(character.hatId) : undefined;
          const characterAccessories = accessoryIds
            .map((id) => characterPartById.get(id))
            .filter((part): part is ApiCharacterPart => Boolean(part));
          const element: StudioElement = {
            id: character.id || `character-${index + 1}`,
            type: "character",
            x: position.x,
            y: position.y,
            width: 46 * position.scale,
            height: 74 * position.scale,
            scale: position.scale,
            rotation: character.rotation ?? position.rotation ?? position.rotate ?? 0,
            content: character.name ?? catalogCharacter?.name ?? `NV ${index + 1}`,
            price: character.price ?? catalogCharacter?.price ?? CHARACTER_PRICE,
          };

          if (character.catalogId) element.characterId = character.catalogId;
          if (imageUrl) element.imageUrl = imageUrl;
          if (character.faceId) element.faceId = character.faceId;
          if (character.hairId) element.hairId = character.hairId;
          if (character.torsoId) element.torsoId = character.torsoId;
          if (character.legsId) element.legsId = character.legsId;
          if (character.hatId) element.hatId = character.hatId;
          if (accessoryIds.length) element.accessoryIds = accessoryIds;
          element.characterParts = {};
          const faceSnapshot = toCharacterPartSnapshot(face);
          const hairSnapshot = toCharacterPartSnapshot(hair);
          const torsoSnapshot = toCharacterPartSnapshot(torso);
          const legsSnapshot = toCharacterPartSnapshot(legs);
          const hatSnapshot = toCharacterPartSnapshot(hat);
          const accessorySnapshots = characterAccessories
            .map((part) => toCharacterPartSnapshot(part))
            .filter((part): part is StudioCharacterPartSnapshot => Boolean(part));
          const storedCharacterParts = isRecord(character.characterParts) ? character.characterParts : null;
          const storedFaceSnapshot = getStoredCharacterPartSnapshot(storedCharacterParts?.FACE);
          const storedHairSnapshot = getStoredCharacterPartSnapshot(storedCharacterParts?.HAIR);
          const storedTorsoSnapshot = getStoredCharacterPartSnapshot(storedCharacterParts?.TORSO);
          const storedLegsSnapshot = getStoredCharacterPartSnapshot(storedCharacterParts?.LEGS);
          const storedHatSnapshot = getStoredCharacterPartSnapshot(storedCharacterParts?.HAT);
          const storedAccessorySnapshots = getStoredCharacterAccessorySnapshots(storedCharacterParts?.ACCESSORY);

          const restoredFaceSnapshot = faceSnapshot ?? storedFaceSnapshot;
          const restoredHairSnapshot = hairSnapshot ?? storedHairSnapshot;
          const restoredTorsoSnapshot = torsoSnapshot ?? storedTorsoSnapshot;
          const restoredLegsSnapshot = legsSnapshot ?? storedLegsSnapshot;
          const restoredHatSnapshot = hatSnapshot ?? storedHatSnapshot;

          if (restoredFaceSnapshot) element.characterParts.FACE = restoredFaceSnapshot;
          if (restoredHairSnapshot) element.characterParts.HAIR = restoredHairSnapshot;
          if (restoredTorsoSnapshot) element.characterParts.TORSO = restoredTorsoSnapshot;
          if (restoredLegsSnapshot) element.characterParts.LEGS = restoredLegsSnapshot;
          if (restoredHatSnapshot) element.characterParts.HAT = restoredHatSnapshot;
          element.characterParts.ACCESSORY = accessorySnapshots.length > 0 ? accessorySnapshots : storedAccessorySnapshots;

          return element;
        }),
      ]);
      return;
    }

    const legacyTemplateId = typeof designData.templateId === "string" ? designData.templateId : null;
    skipNextTemplateResetRef.current = true;
    setActiveTemplate(legacyTemplateId);
    setCustomBackgroundUrl(typeof designData.backgroundImageUrl === "string" ? designData.backgroundImageUrl : cartItem.previewUrl);
    setCustomBackgroundOriginalName(null);
    setPrintText({
      title: typeof designData.printText === "object" && designData.printText && !Array.isArray(designData.printText)
        ? String((designData.printText as Record<string, unknown>).title ?? "")
        : "",
      date: typeof designData.printText === "object" && designData.printText && !Array.isArray(designData.printText)
        ? String((designData.printText as Record<string, unknown>).date ?? "")
        : "",
      message: typeof designData.printText === "object" && designData.printText && !Array.isArray(designData.printText)
        ? String((designData.printText as Record<string, unknown>).message ?? "")
        : "",
    });
    setContentValues(
      typeof designData.contentValues === "object" && designData.contentValues && !Array.isArray(designData.contentValues)
        ? Object.fromEntries(
            Object.entries(designData.contentValues).filter(([, value]) => typeof value === "string"),
          ) as Record<string, string>
        : {},
    );
    const legacyElements = Array.isArray(designData.elements)
      ? designData.elements.filter((element): element is StudioElement => isRecord(element) && isElementType(element.type))
      : [];
    setElements(legacyElements);
    setCharacterCount(legacyElements.filter((element) => element.type === "character").length);
  }

  const baseFramePrice = activeFrameSizeObj ? activeFrameSizeObj.price : 0;
  const accessoriesPrice = useMemo(
    () => elements
      .filter((el) => el.type === "accessory")
      .reduce((acc, el) => acc + (el.price || 0), 0),
    [elements],
  );
  const charactersTotalPrice = useMemo(
    () => elements
      .filter((el) => el.type === "character")
      .reduce((acc, el) => acc + (el.price ?? CHARACTER_PRICE), 0),
    [elements],
  );
  const totalPrice = baseFramePrice + accessoriesPrice + charactersTotalPrice;

  const addElement = useCallback((el: Omit<StudioElement, "id">) => {
    const newEl = { ...el, id: Math.random().toString(36).substring(2, 9) };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, []);

  const setContentValue = useCallback((key: string, value: string) => {
    setContentValues(prev => ({ ...prev, [key]: value }));

    const printTextPatch = resolvePrintTextPatch(contentFields, key, value);
    if (printTextPatch) {
      setPrintText(prev => ({ ...prev, ...printTextPatch }));
    }
  }, [contentFields]);

  const clearContentValues = useCallback(() => {
    setContentValues({});
    setPrintText({ title: "", date: "", message: "" });
  }, []);

  const addCharacter = useCallback((character: StudioCharacterInput) => {
    const id = Math.random().toString(36).substring(2, 9);
    const characterPrice = calculateCharacterPrice(character, CHARACTER_PRICE);

    setElements((prev) => {
      const characters = prev.filter((element) => element.type === "character");
      const characterIndex = characters.length;
      const nextNumber = getNextCharacterNumber(prev);
      const name = character.name?.trim() || `NV ${nextNumber}`;
      const newEl: StudioElement = {
        id,
        type: "character",
        x: 90 + (characterIndex % 4) * 70,
        y: 165 + Math.floor(characterIndex / 4) * 35,
        content: name,
        width: 54,
        height: 92,
        scale: 1,
        rotation: 0,
        price: characterPrice,
        faceId: character.face.id,
        hairId: character.hair.id,
        torsoId: character.torso.id,
        legsId: character.legs.id,
        accessoryIds: character.accessories?.map((part) => part.id) ?? [],
        characterParts: buildCharacterPartSnapshots(character),
      };

      if (character.hat?.id) newEl.hatId = character.hat.id;

      return [...prev, newEl];
    });
    setCharacterCount((count) => count + 1);
    setSelectedId(id);
  }, []);

  const updateCharacterParts = useCallback((id: string, character: StudioCharacterInput) => {
    const characterPrice = calculateCharacterPrice(character, CHARACTER_PRICE);
    setElements((prev) =>
      prev.map((element) => {
        if (element.id !== id || element.type !== "character") return element;
        const { hatId: _hatId, ...elementWithoutHat } = element;
        return {
          ...elementWithoutHat,
          content: character.name?.trim() || element.content || "NV",
          price: characterPrice,
          faceId: character.face.id,
          hairId: character.hair.id,
          torsoId: character.torso.id,
          legsId: character.legs.id,
          ...(character.hat?.id ? { hatId: character.hat.id } : {}),
          accessoryIds: character.accessories?.map((part) => part.id) ?? [],
          characterParts: buildCharacterPartSnapshots(character),
        };
      }),
    );
    setSelectedId(id);
  }, []);

  const removeLastCharacter = useCallback(() => {
    setElements(prev => {
      const lastCharacterIndex = [...prev].reverse().findIndex(el => el.type === "character");
      if (lastCharacterIndex === -1) return prev;

      const index = prev.length - 1 - lastCharacterIndex;
      const removed = prev[index];
      setSelectedId(current => (removed && current === removed.id ? null : current));
      return prev.filter((_, itemIndex) => itemIndex !== index);
    });
    setCharacterCount(count => Math.max(0, count - 1));
  }, []);

  const updateElement = useCallback((id: string, updates: Partial<StudioElement>) => {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } : el)));
  }, []);

  const removeElement = useCallback((id: string) => {
    setElements(prev => {
      const removed = prev.find(el => el.id === id);
      if (removed?.type === "character") {
        setCharacterCount(count => Math.max(0, count - 1));
      }
      return prev.filter(el => el.id !== id);
    });
    setSelectedId(current => (current === id ? null : current));
  }, []);

  const clearAll = useCallback(() => {
    setElements([]);
    setCharacterCount(0);
    setSelectedId(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      step,
      setStep,
      frameSize,
      setFrameSize,
      frameSizes,
      printText,
      setPrintText,
      contentFields,
      contentValues,
      setContentValue,
      clearContentValues,
      characterCount,
      setCharacterCount,
      characterPrice: CHARACTER_PRICE,
      totalPrice,
      elements,
      selectedId,
      activeTemplate,
      customBackgroundUrl,
      customBackgroundOriginalName,
      zoom,
      setZoom,
      editCartItemId,
      isEditMode: Boolean(editCartItemId),
      setActiveTemplate,
      setCustomBackgroundUrl,
      setCustomBackgroundOriginalName,
      setSelectedId,
      addElement,
      addCharacter,
      updateCharacterParts,
      removeLastCharacter,
      updateElement,
      removeElement,
      clearAll,
      templates,
      templateCategories,
      accessories,
      characters,
      characterParts,
      characterPresets,
      accessoryCategories,
      isLoadingData,
      dataError,
    }),
    [
      step,
      frameSize,
      frameSizes,
      printText,
      contentFields,
      contentValues,
      setContentValue,
      clearContentValues,
      characterCount,
      totalPrice,
      elements,
      selectedId,
      activeTemplate,
      customBackgroundUrl,
      customBackgroundOriginalName,
      zoom,
      editCartItemId,
      addElement,
      addCharacter,
      updateCharacterParts,
      removeLastCharacter,
      updateElement,
      removeElement,
      clearAll,
      templates,
      templateCategories,
      accessories,
      characters,
      characterParts,
      characterPresets,
      accessoryCategories,
      isLoadingData,
      dataError,
    ],
  );

  return (
    <StudioContext.Provider value={contextValue}>
      {children}
    </StudioContext.Provider>
  );
}

export function useStudio() {
  const context = useContext(StudioContext);
  if (context === undefined) {
    throw new Error("useStudio must be used within a StudioProvider");
  }
  return context;
}

