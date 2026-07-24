'use client'

// ============================================================
// useCart hook - wrapper đơn giản cho cartStore
// ============================================================

import { useCallback, useEffect } from 'react'
import {
  hydrateCartStore,
  selectCartIsOpen,
  selectCartHasHydrated,
  selectCartItemCount,
  selectCartItems,
  selectCartTotalAmount,
  useCartStore,
  type SimpleCartItem,
} from '@/features/cart/store'

export type { SimpleCartItem }

interface UseCartResult {
  items: SimpleCartItem[]
  itemCount: number
  totalAmount: number
  isOpen: boolean
  hasHydrated: boolean
  isEmpty: boolean
  addItem: (item: Omit<SimpleCartItem, 'id' | 'addedAt' | 'totalPrice'>) => void
  updateItem: (id: string, item: Omit<SimpleCartItem, 'id' | 'addedAt' | 'totalPrice'>) => void
  removeItem: (id: string) => void
  restoreItem: (item: SimpleCartItem, index?: number) => void
  updateQuantity: (id: string, quantity: number) => void
  updateItemNote: (id: string, note: string) => void
  updateQuotedPrices: (prices: Record<string, number>) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  hasItem: (productId: string) => boolean
  getItem: (id: string) => SimpleCartItem | undefined
}

export function useCart(): UseCartResult {
  const items = useCartStore(selectCartItems)
  const itemCount = useCartStore(selectCartItemCount)
  const totalAmount = useCartStore(selectCartTotalAmount)
  const isOpen = useCartStore(selectCartIsOpen)
  const hasHydrated = useCartStore(selectCartHasHydrated)
  const addItem = useCartStore((state) => state.addItem)
  const updateItem = useCartStore((state) => state.updateItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const restoreItem = useCartStore((state) => state.restoreItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const updateItemNote = useCartStore((state) => state.updateItemNote)
  const updateQuotedPrices = useCartStore((state) => state.updateQuotedPrices)
  const clearCart = useCartStore((state) => state.clearCart)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const openCart = useCartStore((state) => state.openCart)
  const closeCart = useCartStore((state) => state.closeCart)

  useEffect(() => {
    void hydrateCartStore()
  }, [])

  const isEmpty = itemCount === 0

  const hasItem = useCallback(
    (productId: string) => items.some((item) => item.productId === productId),
    [items],
  )

  const getItem = useCallback(
    (id: string) => items.find((item) => item.id === id),
    [items],
  )

  return {
    items,
    itemCount,
    totalAmount,
    isOpen,
    hasHydrated,
    isEmpty,
    addItem,
    updateItem,
    removeItem,
    restoreItem,
    updateQuantity,
    updateItemNote,
    updateQuotedPrices,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    hasItem,
    getItem,
  }
}
