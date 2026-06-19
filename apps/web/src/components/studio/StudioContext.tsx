"use client";

import { createContext, useCallback, useContext, useMemo, useState, ReactNode, useEffect } from "react";
import { publicApiClient } from "@/lib/api/public-client";
import type { JsonObject } from "@lego-shop/shared";

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

export interface ApiTemplate {
  id: string;
  name: string;
  imageUrl: string | null;
  categoryId: string | null;
  configJson: JsonObject | null;
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
}

export interface ApiFrameColor {
  id: string;
  name: string;
  colorHex: string | null;
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
  
  elements: StudioElement[];
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  activeTemplate: string | null;
  setActiveTemplate: (id: string | null) => void;
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
}

const StudioContext = createContext<StudioContextType | undefined>(undefined);

type TemplateElement = Omit<StudioElement, "id">;

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

function readNumber(value: unknown, fallback?: number): number | undefined {
  return typeof value === "number" ? value : fallback;
}

export function StudioProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<number>(1);
  const [frameSize, setFrameSize] = useState<string>("");
  const [frameColor, setFrameColor] = useState<string>("");
  const [printText, setPrintText] = useState<PrintText>({ title: "", date: "", message: "" });
  const [characterCount, setCharacterCount] = useState<number>(0);
  const CHARACTER_PRICE = 10000; // 10,000đ per character
  
  const [elements, setElements] = useState<StudioElement[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [activeTemplate, setActiveTemplate] = useState<string | null>(null);
  const [zoom, setZoom] = useState<number>(1);

  // API State
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [templateCategories, setTemplateCategories] = useState<ApiCategory[]>([]);
  const [accessories, setAccessories] = useState<ApiAccessory[]>([]);
  const [accessoryCategories, setAccessoryCategories] = useState<ApiCategory[]>([]);
  const [frameSizes, setFrameSizes] = useState<ApiFrameSize[]>([]);
  const [frameColors, setFrameColors] = useState<ApiFrameColor[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [tpls, tplCats, accs, accCats, fSizes, fColors] = await Promise.all([
          publicApiClient.products.listTemplates(),
          publicApiClient.categories.listTemplateCategories(),
          publicApiClient.products.listAccessories(),
          publicApiClient.categories.listAccessoryCategories(),
          publicApiClient.products.listFrameSizes(),
          publicApiClient.products.listFrameColors(),
        ]);
        // Filter active only
        setTemplates(tpls.filter(t => t.status === 'active'));
        setTemplateCategories(tplCats);
        setAccessories(accs.filter(a => a.status === 'active'));
        setAccessoryCategories(accCats);
        
        const activeFrameSizes = fSizes.filter(f => f.status === 'active');
        const activeFrameColors = fColors.filter(c => c.status === 'active');
        
        setFrameSizes(activeFrameSizes);
        setFrameColors(activeFrameColors);
        
        const firstFrameSize = activeFrameSizes[0];
        const firstFrameColor = activeFrameColors[0];

        if (firstFrameSize) setFrameSize(firstFrameSize.id);
        if (firstFrameColor) setFrameColor(firstFrameColor.name);
        
        // Set first template as active if available
        const activeTpls = tpls.filter(t => t.status === 'active');
        const firstTemplate = activeTpls[0];
        if (firstTemplate) {
          setActiveTemplate(firstTemplate.id);
        }
      } catch (err) {
        console.error("Failed to load studio data:", err);
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
  }, [activeTemplate, templates, isLoadingData]);

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

  const updateElement = useCallback((id: string, updates: Partial<StudioElement>) => {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } : el)));
  }, []);

  const removeElement = useCallback((id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    setSelectedId(current => (current === id ? null : current));
  }, []);

  const clearAll = useCallback(() => {
    setElements([]);
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
      characterCount,
      setCharacterCount,
      characterPrice: CHARACTER_PRICE,
      totalPrice,
      freeshipAmount,
      freeshipProgress,
      elements,
      selectedId,
      activeTemplate,
      zoom,
      setZoom,
      setActiveTemplate,
      setSelectedId,
      addElement,
      updateElement,
      removeElement,
      clearAll,
      templates,
      templateCategories,
      accessories,
      accessoryCategories,
      isLoadingData,
    }),
    [
      step,
      frameSize,
      frameColor,
      frameSizes,
      frameColors,
      printText,
      characterCount,
      totalPrice,
      freeshipAmount,
      freeshipProgress,
      elements,
      selectedId,
      activeTemplate,
      zoom,
      addElement,
      updateElement,
      removeElement,
      clearAll,
      templates,
      templateCategories,
      accessories,
      accessoryCategories,
      isLoadingData,
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

