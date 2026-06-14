// ============================================================
// CART STORE - Quan ly trang thai gio hang
// Persist to localStorage tu dong qua zustand/middleware
// ============================================================

import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'

import { CART } from '@/constants'
import type { CartItem, FrameConfig, JsonRecord, Product } from '@/types'

// ------------------------------------------------------------
// STATE TYPE
// ------------------------------------------------------------

interface CartState {
  items: CartItem[]
  isOpen: boolean
  total: number
  subtotal: number
  itemCount: number
}

// ------------------------------------------------------------
// ACTIONS TYPE
// ------------------------------------------------------------

interface CartActions {
  addItem: (product: Product, config: FrameConfig) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  openCart: () => void
  closeCart: () => void
  toggleCart: () => void
}

// ------------------------------------------------------------
// STORE TYPE
// ------------------------------------------------------------

type CartStore = CartState & CartActions
type PersistedCartState = Pick<
  CartState,
  'items' | 'total' | 'subtotal' | 'itemCount'
>

// ------------------------------------------------------------
// HELPERS
// ------------------------------------------------------------

const CART_STORAGE_KEY = 'brickframes-cart'
const EMPTY_CONFIG_VALUE = 'none'

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value)
}

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`
  }

  if (isRecord(value)) {
    const entries = Object.keys(value)
      .sort()
      .map((key) => `${key}:${stableSerialize(value[key])}`)

    return `{${entries.join(',')}}`
  }

  return JSON.stringify(value)
}

function cloneDesignData(designData: JsonRecord): JsonRecord {
  return Object.fromEntries(Object.entries(designData))
}

function clampQuantity(quantity: number): number {
  return Math.min(Math.max(Math.trunc(quantity), 1), CART.MAX_QUANTITY_PER_ITEM)
}

function cloneFrameConfig(config: FrameConfig): FrameConfig {
  return {
    ...config,
    accessoryIds: [...config.accessoryIds],
    designData: cloneDesignData(config.designData),
    quantity: clampQuantity(config.quantity),
  }
}

function generateCartItemId(productId: string, config: FrameConfig): string {
  const accessoryKey =
    config.accessoryIds.length > 0
      ? [...config.accessoryIds].sort().join('-')
      : EMPTY_CONFIG_VALUE
  const designKey = encodeURIComponent(stableSerialize(config.designData))
  const configKey = [
    config.size.id,
    config.material.id,
    config.mat.id,
    config.glass.id,
    config.templateId ?? EMPTY_CONFIG_VALUE,
    accessoryKey,
    config.previewUrl ?? EMPTY_CONFIG_VALUE,
    designKey,
  ].join('-')

  return `${productId}-${configKey}`
}

function calculateUnitPrice(config: FrameConfig): number {
  const framePrice = config.size.basePrice * config.material.priceMultiplier
  const addonPrice = config.mat.priceAddon + config.glass.priceAddon

  return Math.round(framePrice + addonPrice)
}

function calculateCartTotals(
  items: CartItem[],
): Pick<CartState, 'total' | 'subtotal' | 'itemCount'> {
  const subtotal = items.reduce((acc, item) => acc + item.totalPrice, 0)
  const itemCount = items.reduce((acc, item) => acc + item.config.quantity, 0)

  return { subtotal, total: subtotal, itemCount }
}

function applyCartTotals(state: CartState): void {
  const totals = calculateCartTotals(state.items)
  state.subtotal = totals.subtotal
  state.total = totals.total
  state.itemCount = totals.itemCount
}

function createCartItem(
  product: Product,
  config: FrameConfig,
  cartItemId: string,
): CartItem {
  const normalizedConfig = cloneFrameConfig(config)
  const unitPrice = calculateUnitPrice(normalizedConfig)

  return {
    id: cartItemId,
    product,
    config: normalizedConfig,
    unitPrice,
    totalPrice: unitPrice * normalizedConfig.quantity,
    addedAt: new Date().toISOString(),
  }
}

// ------------------------------------------------------------
// INITIAL STATE
// ------------------------------------------------------------

const INITIAL_STATE: CartState = {
  items: [],
  isOpen: false,
  total: 0,
  subtotal: 0,
  itemCount: 0,
}

// ------------------------------------------------------------
// STORE
// ------------------------------------------------------------

export const useCartStore = create<CartStore>()(
  persist(
    immer((set) => ({
      ...INITIAL_STATE,

      addItem: (product, config) => {
        set((state) => {
          const normalizedConfig = cloneFrameConfig(config)
          const cartItemId = generateCartItemId(product.id, normalizedConfig)
          const existing = state.items.find((item) => item.id === cartItemId)

          if (existing) {
            const nextQuantity = clampQuantity(
              existing.config.quantity + normalizedConfig.quantity,
            )

            existing.config.quantity = nextQuantity
            existing.totalPrice = existing.unitPrice * nextQuantity
            applyCartTotals(state)
            return
          }

          if (state.items.length >= CART.MAX_ITEMS) {
            return
          }

          state.items.push(createCartItem(product, normalizedConfig, cartItemId))
          applyCartTotals(state)
        })
      },

      removeItem: (cartItemId) => {
        set((state) => {
          state.items = state.items.filter((item) => item.id !== cartItemId)
          applyCartTotals(state)
        })
      },

      updateQuantity: (cartItemId, quantity) => {
        set((state) => {
          if (quantity <= 0) {
            state.items = state.items.filter((item) => item.id !== cartItemId)
            applyCartTotals(state)
            return
          }

          const item = state.items.find((cartItem) => cartItem.id === cartItemId)

          if (item) {
            const safeQuantity = clampQuantity(quantity)
            item.config.quantity = safeQuantity
            item.totalPrice = item.unitPrice * safeQuantity
          }

          applyCartTotals(state)
        })
      },

      clearCart: () => {
        set((state) => {
          state.items = []
          state.total = 0
          state.subtotal = 0
          state.itemCount = 0
        })
      },

      openCart: () => {
        set((state) => {
          state.isOpen = true
        })
      },

      closeCart: () => {
        set((state) => {
          state.isOpen = false
        })
      },

      toggleCart: () => {
        set((state) => {
          state.isOpen = !state.isOpen
        })
      },
    })),
    {
      name: CART_STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): PersistedCartState => ({
        items: state.items,
        total: state.total,
        subtotal: state.subtotal,
        itemCount: state.itemCount,
      }),
    },
  ),
)

// ------------------------------------------------------------
// SELECTORS
// ------------------------------------------------------------

export const selectCartItems = (state: CartStore): CartItem[] => state.items
export const selectCartIsOpen = (state: CartStore): boolean => state.isOpen
export const selectCartTotal = (state: CartStore): number => state.total
export const selectCartSubtotal = (state: CartStore): number => state.subtotal
export const selectCartItemCount = (state: CartStore): number =>
  state.itemCount
