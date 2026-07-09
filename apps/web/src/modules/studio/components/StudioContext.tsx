"use client";

import { createContext, useCallback, useContext, useMemo, useRef, useState, ReactNode, useEffect } from "react";
import { resolveApiAssetUrl } from "@/lib/api/assets";
import { publicApiClient } from "@/lib/api/public-client";
import { useCartStore, type SimpleCartItem } from "@/features/cart/store";
import { isCustomFrameDesignData } from "../lib/design-data";
import type { Character, FrameBackground, FrameOption, JsonObject, JsonValue } from "@lego-shop/shared";

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
  addCharacter: (character?: ApiCharacter) => void;
  removeLastCharacter: () => void;
  updateElement: (id: string, updates: Partial<StudioElement>) => void;
  removeElement: (id: string) => void;
  clearAll: () => void;

  // Data from API
  templates: ApiTemplate[];
  templateCategories: ApiCategory[];
  accessories: ApiAccessory[];
  characters: ApiCharacter[];
  accessoryCategories: ApiCategory[];
  frameSizes: ApiFrameSize[];
  isLoadingData: boolean;
  dataError: string | null;
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

type TemplateElement = Omit<StudioElement, "id">;

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
  const hasRestoredCartItemRef = useRef(false);
  const skipNextTemplateResetRef = useRef(false);

  // API State
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [templateCategories, setTemplateCategories] = useState<ApiCategory[]>([]);
  const [accessories, setAccessories] = useState<ApiAccessory[]>([]);
  const [characters, setCharacters] = useState<ApiCharacter[]>([]);
  const [accessoryCategories, setAccessoryCategories] = useState<ApiCategory[]>([]);
  const [frameSizes, setFrameSizes] = useState<ApiFrameSize[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setEditCartItemId(params.get("editCartItemId"));
  }, []);

  useEffect(() => {
    async function loadData() {
      try {
        setDataError(null);
        const [accs, accCats, frameOptions, fSizes, backgrounds, characterItems] = await Promise.all([
          publicApiClient.products.listAccessories(),
          publicApiClient.categories.listAccessoryCategories(),
          publicApiClient.products.listFrameOptions({ type: "size" }),
          publicApiClient.products.listFrameSizes(),
          publicApiClient.products.listFrameBackgrounds(),
          publicApiClient.products.listCharacters().catch(() => []),
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
        setAccessoryCategories(accCats);

        const activeFrameOptions = frameOptions.filter(option => option.status === "active");
        const optionFrameSizes = activeFrameOptions
          .filter(option => option.type === "size")
          .map(mapFrameOptionSize);
        
        const activeFrameSizes = (optionFrameSizes.length > 0 ? optionFrameSizes : fSizes.map(mapLegacyFrameSize))
          .filter(f => f.status === 'active');
        
        setFrameSizes(activeFrameSizes);
        
        const firstFrameSize = activeFrameSizes[0];

        if (firstFrameSize) setFrameSize(firstFrameSize.id);
        
        const firstTemplate = activeBackgrounds[0];
        if (firstTemplate) {
          setActiveTemplate(firstTemplate.id);
        }
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
          if (!current || current.startsWith("background:")) {
            return activeBackgrounds.some((tpl) => tpl.id === current)
              ? current
              : (activeBackgrounds[0]?.id ?? null);
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
    if (!editCartItemId || isLoadingData || hasRestoredCartItemRef.current) {
      return;
    }

    const cartItem = useCartStore.getState().items.find((item) => item.id === editCartItemId);
    hasRestoredCartItemRef.current = true;

    if (!cartItem) {
      alert("Không tìm thấy thiết kế trong giỏ hàng. Bạn có thể bắt đầu thiết kế mới.");
      setEditCartItemId(null);
      window.history.replaceState(null, "", "/studio");
      return;
    }

    restoreCartItem(cartItem);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editCartItemId, isLoadingData, templates.length]);

  function restoreCartItem(cartItem: SimpleCartItem) {
    const designData = cartItem.designData;
    const accessoryPriceById = new Map(
      (cartItem.accessories ?? []).map((accessory) => [accessory.id, accessory.price]),
    );
    const accessoryById = new Map(accessories.map((accessory) => [accessory.id, accessory]));
    const characterById = new Map(characters.map((character) => [character.id, character]));

    setFrameSize(cartItem.frameSizeId);
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
      if (backgroundTemplateId && templates.some((tpl) => tpl.id === backgroundTemplateId)) {
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
      setContentValues({
        recipientName: designData.content.recipientName,
        graduationDate: designData.content.graduationDate,
        majorOrSchool: designData.content.majorOrSchool,
        message: designData.content.message,
      });
      setCharacterCount(designData.characters.length);
      setElements([
        ...designData.accessories.map((accessory) => ({
          id: `${accessory.id}-${Math.random().toString(36).substring(2, 8)}`,
          type: "accessory" as const,
          x: accessory.position.x,
          y: accessory.position.y,
          width: 60 * accessory.position.scale,
          height: 60 * accessory.position.scale,
          content: accessory.name,
          imageUrl: accessoryById.get(accessory.id)?.imageUrl ?? accessoryById.get(accessory.id)?.iconUrl ?? "",
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
          const element: StudioElement = {
            id: character.id || `character-${index + 1}`,
            type: "character",
            x: position.x,
            y: position.y,
            width: 46 * position.scale,
            height: 74 * position.scale,
            content: character.name ?? catalogCharacter?.name ?? `NV ${index + 1}`,
            price: character.price ?? catalogCharacter?.price ?? CHARACTER_PRICE,
          };

          if (character.catalogId) element.characterId = character.catalogId;
          if (imageUrl) element.imageUrl = imageUrl;

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

  const addCharacter = useCallback((character?: ApiCharacter) => {
    const id = Math.random().toString(36).substring(2, 9);

    setElements((prev) => {
      const characters = prev.filter((element) => element.type === "character");
      const characterIndex = characters.length;
      const nextNumber = getNextCharacterNumber(prev);
      const imageUrl = character?.imageUrl ? resolveStudioImageUrl(character.imageUrl, characterIndex) : null;
      const newEl: StudioElement = {
        id,
        type: "character",
        x: 90 + (characterIndex % 4) * 70,
        y: 165 + Math.floor(characterIndex / 4) * 35,
        content: character?.name ?? `NV ${nextNumber}`,
        width: 46,
        height: 74,
        price: character?.price ?? CHARACTER_PRICE,
      };

      if (character?.id) newEl.characterId = character.id;
      if (imageUrl) newEl.imageUrl = imageUrl;

      return [...prev, newEl];
    });
    setCharacterCount((count) => count + 1);
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
      removeLastCharacter,
      updateElement,
      removeElement,
      clearAll,
      templates,
      templateCategories,
      accessories,
      characters,
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
      removeLastCharacter,
      updateElement,
      removeElement,
      clearAll,
      templates,
      templateCategories,
      accessories,
      characters,
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

