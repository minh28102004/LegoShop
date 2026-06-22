"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { publicApiClient } from "@/lib/api/public-client";
import type { FrameBackground, FrameOption, JsonObject, JsonValue } from "@lego-shop/shared";

export type ElementType = "text" | "accessory" | "character";

export const FREESHIP_THRESHOLD = 349000; // Ngưỡng miễn phí vận chuyển

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
}

interface PrintText {
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
}

export interface ApiFrameColor {
  id: string;
  name: string;
  colorHex: string | null;
  status: string;
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
  frameColor: string;
  setFrameColor: (color: string) => void;
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
  zoom: number;
  setZoom: (zoom: number) => void;
  
  // Characters (nhân vật LEGO)
  characterCount: number;
  setCharacterCount: (count: number) => void;
  characterPrice: number;

  totalPrice: number;
  freeshipAmount: number; // Amount needed to reach freeship
  freeshipProgress: number; // % progress toward freeship
  
  addElement: (el: Omit<StudioElement, "id">) => void;
  addCharacter: () => void;
  removeLastCharacter: () => void;
  updateElement: (id: string, updates: Partial<StudioElement>) => void;
  removeElement: (id: string) => void;
  clearAll: () => void;

  // Data from API
  templates: ApiTemplate[];
  templateCategories: ApiCategory[];
  accessories: ApiAccessory[];
  accessoryCategories: ApiCategory[];
  frameSizes: ApiFrameSize[];
  frameColors: ApiFrameColor[];
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

function resolveStudioImageUrl(imageUrl: string | null, fallbackIndex = 0): string | null {
  if (!imageUrl) return null;
  if (imageUrl.includes("example.com")) {
    return STUDIO_BACKGROUND_FALLBACKS[fallbackIndex % STUDIO_BACKGROUND_FALLBACKS.length] ?? ACCESSORY_FALLBACK_IMAGE;
  }

  if (imageUrl.startsWith("/shared/images/bg_template/")) {
    const match = imageUrl.match(/(\d+)\.png$/);
    const index = match?.[1] ? Number(match[1]) - 1 : fallbackIndex;
    return STUDIO_BACKGROUND_FALLBACKS[index % STUDIO_BACKGROUND_FALLBACKS.length] ?? STUDIO_BACKGROUND_FALLBACKS[0] ?? imageUrl;
  }

  return imageUrl;
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
  if (imageUrl !== undefined) element.imageUrl = imageUrl;
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
      const label = readString(field.label)?.trim() || readString(field.name)?.trim() || `Thông tin ${index + 1}`;
      const type = normalizeContentFieldType(field.type);
      const placeholder = readString(field.placeholder)?.trim();
      const helpText = readString(field.helpText)?.trim() || readString(field.description)?.trim();

      return {
        key,
        label,
        type,
        required: readBoolean(field.required, index === 0),
        ...(placeholder ? { placeholder } : {}),
        ...(helpText ? { helpText } : {}),
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

function formatDimension(value: number): string {
  return Number.isInteger(value) ? String(value) : String(value).replace(/\.?0+$/, "");
}

function getFrameSizeLabel(option: FrameOption): string {
  if (option.label) return option.label;
  if (option.widthCm !== null && option.heightCm !== null) {
    return `${formatDimension(option.widthCm)}x${formatDimension(option.heightCm)}`;
  }
  return option.name;
}

function mapFrameOptionSize(option: FrameOption): ApiFrameSize {
  return {
    id: option.id,
    label: getFrameSizeLabel(option),
    price: option.price,
    popular: option.popular,
    status: option.status,
    widthCm: option.widthCm,
    heightCm: option.heightCm,
  };
}

function mapFrameOptionColor(option: FrameOption): ApiFrameColor {
  return {
    id: option.id,
    name: normalizeFrameColorName(option.label ?? option.name),
    colorHex: option.colorHex,
    status: option.status,
  };
}

function mapLegacyFrameSize(size: Omit<ApiFrameSize, "widthCm" | "heightCm">): ApiFrameSize {
  return {
    ...size,
    widthCm: null,
    heightCm: null,
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
  const [frameColor, setFrameColor] = useState<string>("");
  const [printText, setPrintText] = useState<PrintText>({ title: "", date: "", message: "" });
  const [contentValues, setContentValues] = useState<Record<string, string>>({});
  const [characterCount, setCharacterCount] = useState<number>(0);
  const CHARACTER_PRICE = 10000; // 10,000đ per character
  
  const [elements, setElements] = useState<StudioElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [customBackgroundUrl, setCustomBackgroundUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  // API State
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [templateCategories, setTemplateCategories] = useState<ApiCategory[]>([]);
  const [accessories, setAccessories] = useState<ApiAccessory[]>([]);
  const [accessoryCategories, setAccessoryCategories] = useState<ApiCategory[]>([]);
  const [frameSizes, setFrameSizes] = useState<ApiFrameSize[]>([]);
  const [frameColors, setFrameColors] = useState<ApiFrameColor[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      try {
        setDataError(null);
        const [tpls, tplCats, accs, accCats, frameOptions, fSizes, fColors, backgrounds] = await Promise.all([
          publicApiClient.products.listTemplates(),
          publicApiClient.categories.listTemplateCategories(),
          publicApiClient.products.listAccessories(),
          publicApiClient.categories.listAccessoryCategories(),
          publicApiClient.products.listFrameOptions(),
          publicApiClient.products.listFrameSizes(),
          publicApiClient.products.listFrameColors(),
          publicApiClient.products.listFrameBackgrounds(),
        ]);
        const activeTemplates: ApiTemplate[] = tpls
          .filter(t => t.status === 'active')
          .map((t, index) => ({
            ...t,
            description: null,
            instructions: null,
            imageUrl: resolveStudioImageUrl(t.imageUrl, index),
            contentFields: t.configJson?.contentFields ?? null,
            source: "template",
          }));
        const activeBackgrounds = backgrounds
          .filter(bg => bg.status === "active")
          .sort((a, b) => a.sortOrder - b.sortOrder)
          .map(mapFrameBackground);
        const studioBackgrounds = [...activeBackgrounds, ...activeTemplates];

        setTemplates(studioBackgrounds);
        setTemplateCategories(tplCats);
        setAccessories(accs
          .filter(a => a.status === 'active')
          .map((accessory, index) => ({
            ...accessory,
            imageUrl: resolveStudioImageUrl(accessory.imageUrl, index) ?? accessory.imageUrl,
            iconUrl: resolveStudioImageUrl(accessory.iconUrl, index) ?? accessory.iconUrl,
          })));
        setAccessoryCategories(accCats);

        const activeFrameOptions = frameOptions.filter(option => option.status === "active");
        const optionFrameSizes = activeFrameOptions
          .filter(option => option.type === "size")
          .map(mapFrameOptionSize);
        const optionFrameColors = activeFrameOptions
          .filter(option => option.type === "color")
          .map(mapFrameOptionColor);
        
        const activeFrameSizes = (optionFrameSizes.length > 0 ? optionFrameSizes : fSizes.map(mapLegacyFrameSize))
          .filter(f => f.status === 'active');
        const activeFrameColors = (optionFrameColors.length > 0 ? optionFrameColors : fColors.map(color => ({
          ...color,
          name: normalizeFrameColorName(color.name),
        })))
          .filter(c => c.status === 'active');
        
        setFrameSizes(activeFrameSizes);
        setFrameColors(activeFrameColors);
        
        const firstFrameSize = activeFrameSizes[0];
        const firstFrameColor = activeFrameColors[0];

        if (firstFrameSize) setFrameSize(firstFrameSize.id);
        if (firstFrameColor) setFrameColor(firstFrameColor.name);
        
        const firstTemplate = studioBackgrounds[0];
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

  // When activeTemplate changes, reload its default elements
  useEffect(() => {
    if (!activeTemplate || isLoadingData) return;
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
  const baseFramePrice = activeFrameSizeObj ? activeFrameSizeObj.price : 0;
  const accessoriesPrice = useMemo(
    () => elements.reduce((acc, el) => acc + (el.price || 0), 0),
    [elements],
  );
  const charactersTotalPrice = characterCount * CHARACTER_PRICE;
  const totalPrice = baseFramePrice + accessoriesPrice + charactersTotalPrice;
  const freeshipAmount = Math.max(0, FREESHIP_THRESHOLD - totalPrice);
  const freeshipProgress = Math.min(100, Math.round((totalPrice / FREESHIP_THRESHOLD) * 100));

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

  const addCharacter = useCallback(() => {
    setCharacterCount((count) => count + 1);
    const offset = Math.min(characterCount, 5) * 22;
    const newEl: StudioElement = {
      id: Math.random().toString(36).substring(2, 9),
      type: "character",
      x: 110 + offset,
      y: 190,
      content: `NV ${characterCount + 1}`,
      width: 46,
      height: 74,
    };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  }, [characterCount]);

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
      frameColor,
      setFrameColor,
      frameSizes,
      frameColors,
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
      freeshipAmount,
      freeshipProgress,
      elements,
      selectedId,
      activeTemplate,
      customBackgroundUrl,
      zoom,
      setZoom,
      setActiveTemplate,
      setCustomBackgroundUrl,
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
      accessoryCategories,
      isLoadingData,
      dataError,
    }),
    [
      step,
      frameSize,
      frameColor,
      frameSizes,
      frameColors,
      printText,
      contentFields,
      contentValues,
      setContentValue,
      clearContentValues,
      characterCount,
      totalPrice,
      freeshipAmount,
      freeshipProgress,
      elements,
      selectedId,
      activeTemplate,
      customBackgroundUrl,
      zoom,
      addElement,
      addCharacter,
      removeLastCharacter,
      updateElement,
      removeElement,
      clearAll,
      templates,
      templateCategories,
      accessories,
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

