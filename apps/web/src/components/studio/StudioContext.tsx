"use client";

import { createContext, useContext, useState, ReactNode, useEffect } from "react";
import { fetchApi } from "@/lib/api";

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
  imageUrl: string;
  categoryId: string | null;
  configJson: any;
}

export interface ApiAccessory {
  id: string;
  name: string;
  price: number;
  imageUrl: string;
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
          fetchApi("/public/templates"),
          fetchApi("/public/template-categories"),
          fetchApi("/public/accessories"),
          fetchApi("/public/accessory-categories"),
          fetchApi("/public/frame-sizes"),
          fetchApi("/public/frame-colors"),
        ]);
        // Filter active only
        setTemplates((tpls as any[]).filter(t => t.status === 'active'));
        setTemplateCategories(tplCats);
        setAccessories((accs as any[]).filter(a => a.status === 'active'));
        setAccessoryCategories(accCats);
        
        const activeFrameSizes = (fSizes as any[]).filter(f => f.status === 'active');
        const activeFrameColors = (fColors as any[]).filter(c => c.status === 'active');
        
        setFrameSizes(activeFrameSizes);
        setFrameColors(activeFrameColors);
        
        if (activeFrameSizes.length > 0) setFrameSize(activeFrameSizes[0].id);
        if (activeFrameColors.length > 0) setFrameColor(activeFrameColors[0].name);
        
        // Set first template as active if available
        const activeTpls = (tpls as any[]).filter(t => t.status === 'active');
        if (activeTpls.length > 0) {
          setActiveTemplate(activeTpls[0].id);
          
          // Try to load initial elements if configJson exists
          if (activeTpls[0].configJson?.elements) {
            setElements(activeTpls[0].configJson.elements.map((el: any) => ({
              ...el,
              id: Math.random().toString(36).substring(2, 9)
            })));
          }
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
    if (tpl && tpl.configJson?.elements) {
      setElements(tpl.configJson.elements.map((el: any) => ({
        ...el,
        id: Math.random().toString(36).substring(2, 9)
      })));
    } else {
      setElements([]); // Clear if no default elements
    }
    setSelectedId(null);
  }, [activeTemplate, templates, isLoadingData]);

  const activeFrameSizeObj = frameSizes.find(s => s.id === frameSize);
  const baseFramePrice = activeFrameSizeObj ? activeFrameSizeObj.price : 0;
  const accessoriesPrice = elements.reduce((acc, el) => acc + (el.price || 0), 0);
  const charactersTotalPrice = characterCount * CHARACTER_PRICE;
  const totalPrice = baseFramePrice + accessoriesPrice + charactersTotalPrice;
  const freeshipAmount = Math.max(0, FREESHIP_THRESHOLD - totalPrice);
  const freeshipProgress = Math.min(100, Math.round((totalPrice / FREESHIP_THRESHOLD) * 100));

  const addElement = (el: Omit<StudioElement, "id">) => {
    const newEl = { ...el, id: Math.random().toString(36).substring(2, 9) };
    setElements(prev => [...prev, newEl]);
    setSelectedId(newEl.id);
  };

  const updateElement = (id: string, updates: Partial<StudioElement>) => {
    setElements(prev => prev.map(el => (el.id === id ? { ...el, ...updates } : el)));
  };

  const removeElement = (id: string) => {
    setElements(prev => prev.filter(el => el.id !== id));
    if (selectedId === id) setSelectedId(null);
  };

  const clearAll = () => {
    setElements([]);
    setSelectedId(null);
  };

  return (
    <StudioContext.Provider
      value={{
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
      }}
    >
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

