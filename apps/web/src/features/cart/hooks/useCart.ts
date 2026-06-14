'use client'

import { useCallback, useMemo } from 'react'

import {
  selectCartIsOpen,
  selectCartItemCount,
  selectCartItems,
  selectCartSubtotal,
  useCartStore,
} from '@/stores/cartStore'
import {
  calculateOrderTotal,
  calculateShipping,
} from '@/services/cartService'
import type { CartItem, FrameConfig, Product } from '@/types'

interface UseCartResult {
  items: CartItem[]
  itemCount: number
  subtotal: number
  shipping: number
  total: number
  isOpen: boolean
  addItem: (product: Product, config: FrameConfig) => void
  removeItem: (cartItemId: string) => void
  updateQuantity: (cartItemId: string, quantity: number) => void
  clearCart: () => void
  toggleCart: () => void
  openCart: () => void
  closeCart: () => void
  isEmpty: boolean
  hasItem: (productId: string) => boolean
  getItem: (cartItemId: string) => CartItem | undefined
}

const DEFAULT_DISCOUNT_AMOUNT = 0

export function useCart(): UseCartResult {
  const items = useCartStore(selectCartItems)
  const itemCount = useCartStore(selectCartItemCount)
  const subtotal = useCartStore(selectCartSubtotal)
  const isOpen = useCartStore(selectCartIsOpen)
  const addItem = useCartStore((state) => state.addItem)
  const removeItem = useCartStore((state) => state.removeItem)
  const updateQuantity = useCartStore((state) => state.updateQuantity)
  const clearCart = useCartStore((state) => state.clearCart)
  const toggleCart = useCartStore((state) => state.toggleCart)
  const openCart = useCartStore((state) => state.openCart)
  const closeCart = useCartStore((state) => state.closeCart)
  const shipping = useMemo<number>(() => calculateShipping(subtotal), [subtotal])
  const total = useMemo<number>(
    () => calculateOrderTotal(items, shipping, DEFAULT_DISCOUNT_AMOUNT),
    [items, shipping],
  )
  const isEmpty = itemCount === 0
  const hasItem = useCallback(
    (productId: string): boolean =>
      items.some((item) => item.product.id === productId),
    [items],
  )
  const getItem = useCallback(
    (cartItemId: string): CartItem | undefined =>
      items.find((item) => item.id === cartItemId),
    [items],
  )

  return {
    items,
    itemCount,
    subtotal,
    shipping,
    total,
    isOpen,
    addItem,
    removeItem,
    updateQuantity,
    clearCart,
    toggleCart,
    openCart,
    closeCart,
    isEmpty,
    hasItem,
    getItem,
  }
}
