'use client'

// ============================================================
// useCart hook - wrapper đơn giản cho cartStore
// ============================================================

import { useCallback } from 'react'
import {
  selectCartIsOpen,
  selectCartItemCount,
  selectCartItems,
  selectCartTotalAmount,
  useCartStore,
  type SimpleCartItem,
} from '@/stores/cartStore'

export type { SimpleCartItem }

interface UseCartResult {
  items: SimpleCartItem[]
  itemCount: number
  totalAmount: number
  isOpen: boolean
  isEmpty: boolean
  addItem: (item: Omit<SimpleCartItem, 'id' | 'addedAt' | 'totalPrice'>) => void
  removeItem: (id: string) => void
  updateQuantity: (id: string, quantity: number) => void
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
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const openCart = useCartStore((state) => state.openCart)
  const closeCart = useCartStore((state) => state.closeCart)

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
    isEmpty,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    hasItem,
    getItem,
  }
}
