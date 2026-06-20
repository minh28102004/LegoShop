'use client'

// ============================================================
// CART STORE - Giỏ hàng đơn giản khớp với Studio
// Lưu vào localStorage qua zustand/middleware
// ============================================================

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

// ------------------------------------------------------------
// TYPES
// ------------------------------------------------------------

export interface SimpleCartItem {
  id: string               // generated UUID
  productId: string | null
  productName: string
  quantity: number
  unitPrice: number        // giá per unit (từ frameSize.price)
  totalPrice: number       // unitPrice * quantity
  frameSizeId: string
  frameSizeLabel: string
  frameColorName: string
  accessories?: Array<{ id: string; name: string; price: number }>
  templateId?: string | null
  designData: Record<string, unknown>   // { elements, printText, templateId, ... }
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
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

type CartStore = CartState & CartActions

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const CART_STORAGE_KEY = 'legoshop-cart-v2'

function computeTotals(items: SimpleCartItem[]) {
  const totalAmount = items.reduce((acc, item) => acc + item.totalPrice, 0)
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0)
  return { totalAmount, itemCount }
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 11) + Date.now().toString(36)
}

// ------------------------------------------------------------
// STORE
// ------------------------------------------------------------

export const useCartStore = create<CartStore>()(
  persist(
    immer((set) => ({
      items: [],
      isOpen: false,
      itemCount: 0,
      totalAmount: 0,

      addItem: (itemData) => {
        set((state) => {
          // Kiểm tra xem item đã tồn tại chưa (same product + same frameSizeId + same frameColorName)
          const existingIndex = itemData.productId
            ? state.items.findIndex(
                (i) =>
                  i.productId === itemData.productId &&
                  i.frameSizeId === itemData.frameSizeId &&
                  i.frameColorName === itemData.frameColorName,
              )
            : -1

          if (existingIndex !== -1) {
            // Cộng dồn số lượng
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

      clearCart: () => {
        set((state) => {
          state.items = []
          state.totalAmount = 0
          state.itemCount = 0
        })
      },

      openCart: () => {
        set((state) => { state.isOpen = true })
      },

      closeCart: () => {
        set((state) => { state.isOpen = false })
      },

      toggleCart: () => {
        set((state) => { state.isOpen = !state.isOpen })
      },
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

// ------------------------------------------------------------
// SELECTORS
// ------------------------------------------------------------

export const selectCartItems = (state: CartStore) => state.items
export const selectCartIsOpen = (state: CartStore) => state.isOpen
export const selectCartItemCount = (state: CartStore) => state.itemCount
export const selectCartTotalAmount = (state: CartStore) => state.totalAmount
