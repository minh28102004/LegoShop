// Cart store — Zustand state riêng cho web cart UI
// Includes: items, open/close drawer, quantity management
'use client'

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// ── Types ──────────────────────────────────────────────────────
export type CartItemPartType =
  | 'frame'
  | 'background'
  | 'character'
  | 'accessory'
  | 'product'
  | 'retail'

export interface CartItemPart {
  id?: string
  type: CartItemPartType
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
  imageUrl?: string | null
}

export interface SimpleCartItem {
  id: string
  productId: string | null
  productName: string
  quantity: number
  unitPrice: number
  totalPrice: number
  note?: string
  frameOptionId?: string
  frameSizeId: string
  frameSizeLabel: string
  frameColorName: string
  accessories?: Array<{ id: string; name: string; price: number; quantity?: number }>
  parts?: CartItemPart[]
  templateId?: string | null
  designData: Record<string, unknown>
  previewUrl: string | null
  addedAt: string
}

interface CartState {
  items: SimpleCartItem[]
  isOpen: boolean
  itemCount: number
  totalAmount: number
}

interface CartActions {
  addItem: (item: Omit<SimpleCartItem, 'id' | 'addedAt' | 'totalPrice'>) => void
  updateItem: (id: string, item: Omit<SimpleCartItem, 'id' | 'addedAt' | 'totalPrice'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  updateItemNote: (id: string, note: string) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

type CartStore = CartState & CartActions

// ── Helpers ───────────────────────────────────────────────────
const CART_STORAGE_KEY = 'legoshop-cart-v2'

function computeTotals(items: SimpleCartItem[]) {
  return {
    totalAmount: items.reduce((acc, item) => acc + item.totalPrice, 0),
    itemCount: items.reduce((acc, item) => acc + item.quantity, 0),
  }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}

// ── Store ─────────────────────────────────────────────────────
export const useCartStore = create<CartStore>()(
  persist(
    immer((set) => ({
      items: [],
      isOpen: false,
      itemCount: 0,
      totalAmount: 0,

      addItem: (itemData) => {
        set((state) => {
          const existingIndex = itemData.productId
            ? state.items.findIndex(
                (i) =>
                  i.productId === itemData.productId &&
                  i.frameSizeId === itemData.frameSizeId &&
                  i.frameColorName === itemData.frameColorName,
              )
            : -1

          if (existingIndex !== -1) {
            const existing = state.items[existingIndex]
            if (existing) {
              const newQty = Math.min(existing.quantity + itemData.quantity, 10)
              existing.quantity = newQty
              existing.totalPrice = existing.unitPrice * newQty
            }
          } else {
            state.items.push({
              ...itemData,
              id: generateId(),
              totalPrice: itemData.unitPrice * itemData.quantity,
              addedAt: new Date().toISOString(),
            })
          }

          const totals = computeTotals(state.items)
          state.totalAmount = totals.totalAmount
          state.itemCount = totals.itemCount
        })
      },

      updateItem: (id, itemData) => {
        set((state) => {
          const existing = state.items.find((item) => item.id === id)
          if (!existing) return
          Object.assign(existing, {
            ...itemData,
            id,
            totalPrice: itemData.unitPrice * itemData.quantity,
          })
          const totals = computeTotals(state.items)
          state.totalAmount = totals.totalAmount
          state.itemCount = totals.itemCount
        })
      },

      removeItem: (id) => {
        set((state) => {
          state.items = state.items.filter((item) => item.id !== id)
          const totals = computeTotals(state.items)
          state.totalAmount = totals.totalAmount
          state.itemCount = totals.itemCount
        })
      },

      updateQuantity: (id, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            state.items = state.items.filter((item) => item.id !== id)
          } else {
            const item = state.items.find((i) => i.id === id)
            if (item) {
              item.quantity = Math.min(quantity, 10)
              item.totalPrice = item.unitPrice * item.quantity
            }
          }
          const totals = computeTotals(state.items)
          state.totalAmount = totals.totalAmount
          state.itemCount = totals.itemCount
        })
      },

      updateItemNote: (id, note) => {
        set((state) => {
          const item = state.items.find((i) => i.id === id)
          if (item) item.note = note
        })
      },

      clearCart: () => {
        set((state) => {
          state.items = []
          state.totalAmount = 0
          state.itemCount = 0
        })
      },

      openCart: () => { set((s) => { s.isOpen = true }) },
      closeCart: () => { set((s) => { s.isOpen = false }) },
      toggleCart: () => { set((s) => { s.isOpen = !s.isOpen }) },
    })),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        items: state.items,
        totalAmount: state.totalAmount,
        itemCount: state.itemCount,
      }),
    },
  ),
)

// Selectors
export const selectCartItems = (s: CartStore) => s.items
export const selectCartIsOpen = (s: CartStore) => s.isOpen
export const selectCartItemCount = (s: CartStore) => s.itemCount
export const selectCartTotalAmount = (s: CartStore) => s.totalAmount
