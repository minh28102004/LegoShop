"use client";

import { create } from "zustand";
import {
  createJSONStorage,
  persist,
  type StateStorage,
} from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

export type CartItemPartType =
  | "frame"
  | "background"
  | "character"
  | "character_part"
  | "accessory"
  | "product"
  | "retail";

export interface CartItemPart {
  id?: string;
  type: CartItemPartType;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  imageUrl?: string | null;
}

export interface SimpleCartItem {
  id: string;
  productId: string | null;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  note?: string;
  frameOptionId?: string;
  frameSizeId: string;
  frameSizeLabel: string;
  frameColorName: string;
  accessories?: Array<{
    id: string;
    name: string;
    price: number;
    quantity?: number;
  }>;
  parts?: CartItemPart[];
  templateId?: string | null;
  designData: Record<string, unknown>;
  previewUrl: string | null;
  addedAt: string;
}

interface CartState {
  items: SimpleCartItem[];
  isOpen: boolean;
  itemCount: number;
  totalAmount: number;
  hasHydrated: boolean;
}

interface CartActions {
  addItem: (
    item: Omit<SimpleCartItem, "id" | "addedAt" | "totalPrice">,
  ) => void;
  updateItem: (
    id: string,
    item: Omit<SimpleCartItem, "id" | "addedAt" | "totalPrice">,
  ) => void;
  removeItem: (id: string) => void;
  restoreItem: (item: SimpleCartItem, index?: number) => void;
  updateQuantity: (id: string, quantity: number) => void;
  updateItemNote: (id: string, note: string) => void;
  updateQuotedPrices: (prices: Record<string, number>) => void;
  clearCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  toggleCart: () => void;
  setHasHydrated: (hasHydrated: boolean) => void;
}

type CartStore = CartState & CartActions;

const CART_STORAGE_KEY = "legoshop-cart-v2";
const CART_BACKUP_STORAGE_KEY = `${CART_STORAGE_KEY}-backup`;
const CART_STORAGE_VERSION = 3;
const MAX_CART_QUANTITY = 10;
let hydrationPromise: Promise<void> | null = null;

function computeTotals(items: SimpleCartItem[]) {
  return {
    totalAmount: items.reduce(
      (total, item) => total + item.unitPrice * item.quantity,
      0,
    ),
    itemCount: items.reduce((total, item) => total + item.quantity, 0),
  };
}

function generateId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }

  return `${Math.random().toString(36).slice(2, 11)}${Date.now().toString(36)}`;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function readString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function readPrice(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) && value >= 0
    ? Math.round(value)
    : 0;
}

function readQuantity(value: unknown) {
  const quantity =
    typeof value === "number" && Number.isFinite(value)
      ? Math.round(value)
      : 1;
  return Math.min(MAX_CART_QUANTITY, Math.max(1, quantity));
}

function normalizeAccessory(value: unknown) {
  if (!isRecord(value)) return null;
  const id = readString(value.id).trim();
  const name = readString(value.name).trim();
  if (!id || !name) return null;
  return {
    id,
    name,
    price: readPrice(value.price),
    quantity: readQuantity(value.quantity),
  };
}

const CART_PART_TYPES = new Set<CartItemPartType>([
  "frame",
  "background",
  "character",
  "character_part",
  "accessory",
  "product",
  "retail",
]);

function normalizePart(value: unknown): CartItemPart | null {
  if (!isRecord(value)) return null;
  const type = readString(value.type) as CartItemPartType;
  const name = readString(value.name).trim();
  if (!CART_PART_TYPES.has(type) || !name) return null;
  const quantity = readQuantity(value.quantity);
  const unitPrice = readPrice(value.unitPrice);
  return {
    ...(readString(value.id).trim() ? { id: readString(value.id).trim() } : {}),
    type,
    name,
    quantity,
    unitPrice,
    totalPrice: unitPrice * quantity,
    ...(typeof value.imageUrl === "string" || value.imageUrl === null
      ? { imageUrl: value.imageUrl }
      : {}),
  };
}

function normalizeCartItem(value: unknown): SimpleCartItem | null {
  if (!isRecord(value)) return null;

  const productName = readString(value.productName).trim();
  if (!productName) return null;

  const quantity = readQuantity(value.quantity);
  const unitPrice = readPrice(value.unitPrice);
  const normalized: SimpleCartItem = {
    ...(value as unknown as SimpleCartItem),
    id: readString(value.id).trim() || generateId(),
    productId:
      typeof value.productId === "string" && value.productId.trim()
        ? value.productId.trim()
        : null,
    productName,
    quantity,
    unitPrice,
    totalPrice: unitPrice * quantity,
    frameSizeId: readString(value.frameSizeId),
    frameSizeLabel: readString(value.frameSizeLabel),
    frameColorName: readString(value.frameColorName),
    designData: isRecord(value.designData) ? value.designData : {},
    previewUrl:
      typeof value.previewUrl === "string" && value.previewUrl.trim()
        ? value.previewUrl.trim()
        : null,
    addedAt:
      readString(value.addedAt).trim() || new Date().toISOString(),
  };

  if (typeof value.note !== "string") delete normalized.note;
  if (typeof value.frameOptionId !== "string") {
    delete normalized.frameOptionId;
  }
  if (typeof value.templateId !== "string" && value.templateId !== null) {
    delete normalized.templateId;
  }
  if (Array.isArray(value.accessories)) {
    normalized.accessories = value.accessories
      .map(normalizeAccessory)
      .filter((accessory): accessory is NonNullable<typeof accessory> =>
        Boolean(accessory),
      );
  } else {
    delete normalized.accessories;
  }
  if (Array.isArray(value.parts)) {
    normalized.parts = value.parts
      .map(normalizePart)
      .filter((part): part is CartItemPart => Boolean(part));
  } else {
    delete normalized.parts;
  }

  return normalized;
}

function normalizePersistedState(value: unknown) {
  const state = isRecord(value) ? value : {};
  const items = Array.isArray(state.items)
    ? state.items
        .map(normalizeCartItem)
        .filter((item): item is SimpleCartItem => Boolean(item))
    : [];

  return {
    items,
    ...computeTotals(items),
  };
}

function getItemSignature(
  item: Omit<SimpleCartItem, "id" | "addedAt" | "totalPrice">,
) {
  try {
    return JSON.stringify({
      productId: item.productId,
      frameSizeId: item.frameSizeId,
      frameColorName: item.frameColorName,
      templateId: item.templateId,
      designData: item.designData,
      accessories: item.accessories,
    });
  } catch {
    return null;
  }
}

const safeStorage: StateStorage = {
  getItem: (name) => {
    const value = window.localStorage.getItem(name);
    if (!value) return value;
    try {
      JSON.parse(value);
      return value;
    } catch {
      const backup = window.localStorage.getItem(CART_BACKUP_STORAGE_KEY);
      if (!backup) return null;
      try {
        JSON.parse(backup);
        return backup;
      } catch {
        return null;
      }
    }
  },
  setItem: (name, value) => {
    const previousValue = window.localStorage.getItem(name);
    if (previousValue && previousValue !== value) {
      try {
        JSON.parse(previousValue);
        window.localStorage.setItem(CART_BACKUP_STORAGE_KEY, previousValue);
      } catch {
        // Keep the last known-good backup when the primary value is corrupt.
      }
    }
    window.localStorage.setItem(name, value);
  },
  removeItem: (name) => window.localStorage.removeItem(name),
};

export const useCartStore = create<CartStore>()(
  persist(
    immer((set) => ({
      items: [],
      isOpen: false,
      itemCount: 0,
      totalAmount: 0,
      hasHydrated: false,

      addItem: (itemData) => {
        set((state) => {
          const signature = getItemSignature(itemData);
          const existing = signature
            ? state.items.find(
                (item) => getItemSignature(item) === signature,
              )
            : undefined;

          if (existing) {
            existing.quantity = Math.min(
              MAX_CART_QUANTITY,
              existing.quantity + readQuantity(itemData.quantity),
            );
            existing.totalPrice = existing.unitPrice * existing.quantity;
          } else {
            const quantity = readQuantity(itemData.quantity);
            const unitPrice = readPrice(itemData.unitPrice);
            state.items.push({
              ...itemData,
              id: generateId(),
              quantity,
              unitPrice,
              totalPrice: unitPrice * quantity,
              addedAt: new Date().toISOString(),
            });
          }

          Object.assign(state, computeTotals(state.items));
        });
      },

      updateItem: (id, itemData) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === id);
          if (!existing) return;
          const quantity = readQuantity(itemData.quantity);
          const unitPrice = readPrice(itemData.unitPrice);
          Object.assign(existing, {
            ...itemData,
            id,
            addedAt: existing.addedAt,
            quantity,
            unitPrice,
            totalPrice: unitPrice * quantity,
          });
          Object.assign(state, computeTotals(state.items));
        });
      },

      removeItem: (id) => {
        set((state) => {
          state.items = state.items.filter((item) => item.id !== id);
          Object.assign(state, computeTotals(state.items));
        });
      },

      restoreItem: (item, index) => {
        set((state) => {
          if (state.items.some((candidate) => candidate.id === item.id)) return;
          const normalized = normalizeCartItem(item);
          if (!normalized) return;
          const safeIndex = Math.min(
            state.items.length,
            Math.max(0, index ?? state.items.length),
          );
          state.items.splice(safeIndex, 0, normalized);
          Object.assign(state, computeTotals(state.items));
        });
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          const item = state.items.find((candidate) => candidate.id === id);
          if (!item) return;
          item.quantity = readQuantity(quantity);
          item.totalPrice = item.unitPrice * item.quantity;
          Object.assign(state, computeTotals(state.items));
        });
      },

      updateItemNote: (id, note) => {
        set((state) => {
          const item = state.items.find((candidate) => candidate.id === id);
          if (item) item.note = note;
        });
      },

      updateQuotedPrices: (prices) => {
        set((state) => {
          let changed = false;
          state.items.forEach((item) => {
            const price = prices[item.id];
            if (price === undefined || !Number.isFinite(price) || price < 0) {
              return;
            }
            const nextPrice = Math.round(price);
            if (item.unitPrice === nextPrice) return;
            item.unitPrice = nextPrice;
            item.totalPrice = item.unitPrice * item.quantity;
            changed = true;
          });
          if (!changed) return;
          Object.assign(state, computeTotals(state.items));
        });
      },

      clearCart: () => {
        set((state) => {
          state.items = [];
          state.totalAmount = 0;
          state.itemCount = 0;
        });
      },

      openCart: () => set((state) => void (state.isOpen = true)),
      closeCart: () => set((state) => void (state.isOpen = false)),
      toggleCart: () => set((state) => void (state.isOpen = !state.isOpen)),
      setHasHydrated: (hasHydrated) =>
        set((state) => void (state.hasHydrated = hasHydrated)),
    })),
    {
      name: CART_STORAGE_KEY,
      version: CART_STORAGE_VERSION,
      skipHydration: true,
      storage: createJSONStorage(() => {
        if (typeof window === "undefined") {
          throw new Error("Cart storage is only available in the browser");
        }
        return safeStorage;
      }),
      migrate: (persistedState) => normalizePersistedState(persistedState),
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...normalizePersistedState(persistedState),
      }),
      partialize: (state) => ({
        items: state.items,
        totalAmount: state.totalAmount,
        itemCount: state.itemCount,
      }),
    },
  ),
);

export function hydrateCartStore() {
  if (typeof window === "undefined") return Promise.resolve();
  if (useCartStore.persist.hasHydrated()) {
    useCartStore.getState().setHasHydrated(true);
    return Promise.resolve();
  }
  if (!hydrationPromise) {
    hydrationPromise = Promise.resolve(useCartStore.persist.rehydrate())
      .catch(() => undefined)
      .then(() => {
        useCartStore.getState().setHasHydrated(true);
      });
  }
  return hydrationPromise;
}

export const selectCartItems = (state: CartStore) => state.items;
export const selectCartIsOpen = (state: CartStore) => state.isOpen;
export const selectCartItemCount = (state: CartStore) => state.itemCount;
export const selectCartTotalAmount = (state: CartStore) => state.totalAmount;
export const selectCartHasHydrated = (state: CartStore) => state.hasHydrated;
