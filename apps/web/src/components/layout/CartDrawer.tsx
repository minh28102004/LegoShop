'use client'

// CartDrawer — slide-out cart panel (animated using Framer Motion)
import * as React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { X, ShoppingBag, Package, Pencil } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

import { ROUTES, UI_MODAL_IDS } from '@/constants'
import { useCart } from '@/features/cart/hooks/useCart'
import { formatPrice } from '@/lib/formatters'
import { selectActiveModal, useUIStore } from '@/stores/uiStore'
import type { SimpleCartItem } from '@/stores/cartStore'
import { FREESHIP_THRESHOLD } from '@/components/studio/StudioContext'

export interface CartDrawerProps {
  className?: string
}

function CartItemRow({ item, onRemove, onQuantityChange }: {
  item: SimpleCartItem
  onRemove: () => void
  onQuantityChange: (qty: number) => void
}) {
  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      <div className="w-16 h-16 rounded-xl bg-background shrink-0 overflow-hidden flex items-center justify-center border border-border relative">
        {item.previewUrl ? (
          <Image src={item.previewUrl} alt={item.productName} fill className="object-cover" sizes="64px" />
        ) : (
          <Package className="w-6 h-6 text-text-muted" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">{item.productName}</p>
            <p className="text-xs text-text-muted mt-0.5">{item.frameSizeLabel}</p>
          </div>
          <button type="button" aria-label="Xóa" onClick={onRemove}
            className="shrink-0 p-1 text-text-muted hover:text-error transition-colors rounded">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex items-center justify-between mt-2">
          <div className="flex items-center border border-border rounded-lg overflow-hidden">
            <button type="button" className="w-7 h-7 flex items-center justify-center text-text-secondary hover:bg-surface-hover text-sm font-bold transition-colors"
              onClick={() => onQuantityChange(item.quantity - 1)}>−</button>
            <span className="w-8 text-center text-xs font-bold text-text-primary">{item.quantity}</span>
            <button type="button" className="w-7 h-7 flex items-center justify-center text-text-secondary hover:bg-surface-hover text-sm font-bold transition-colors"
              onClick={() => onQuantityChange(item.quantity + 1)}>+</button>
          </div>
          <span className="text-sm font-black text-primary">{formatPrice(item.totalPrice)}</span>
        </div>
        <Link href={ROUTES.studio} className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-text-muted hover:text-primary transition-colors">
          <Pencil className="w-2.5 h-2.5" /> SỬA
        </Link>
      </div>
    </div>
  )
}

export const CartDrawer = React.forwardRef<HTMLDivElement, CartDrawerProps>(
  ({ ...props }, ref) => {
    const activeModal = useUIStore(selectActiveModal)
    const closeModal = useUIStore((state) => state.closeModal)
    const { isEmpty, items, removeItem, totalAmount, updateQuantity } = useCart()
    const isOpen = activeModal === UI_MODAL_IDS.CART_DRAWER

    const freeshipRemaining = Math.max(0, FREESHIP_THRESHOLD - totalAmount)
    const isFree = freeshipRemaining === 0

    return (
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
              onClick={closeModal}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            />
            {/* Drawer */}
            <motion.div
              ref={ref}
              className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-sm bg-surface flex flex-col shadow-2xl border-l border-border"
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 350, damping: 35 }}
              {...props}
            >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
            <h2 className="font-black text-lg text-text-primary">Giỏ hàng</h2>
            <button type="button" onClick={closeModal} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Freeship banner */}
          {isFree ? (
            <div className="mx-4 mt-3 px-3 py-2 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center gap-2 text-xs font-semibold text-emerald-700">
              🎉 Bạn đã được Miễn phí vận chuyển!
            </div>
          ) : (
            <div className="mx-4 mt-3 px-3 py-2 bg-background border border-border rounded-lg">
              <div className="flex justify-between text-xs mb-1.5">
                <span className="text-text-secondary">Thêm <strong className="text-text-primary">{formatPrice(freeshipRemaining)}</strong> để Freeship</span>
                <span className="text-text-muted">{Math.round((totalAmount / FREESHIP_THRESHOLD) * 100)}%</span>
              </div>
              <div className="h-1.5 bg-border rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (totalAmount / FREESHIP_THRESHOLD) * 100)}%` }} />
              </div>
            </div>
          )}

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-5">
            {isEmpty ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <ShoppingBag className="w-9 h-9 text-primary" />
                </div>
                <p className="font-black text-text-primary text-lg mb-2">Giỏ hàng trống</p>
                <p className="text-sm text-text-secondary mb-6">Thiết kế khung LEGO cá nhân hóa và thêm vào giỏ hàng ngay!</p>
                <Link href={ROUTES.studio} onClick={closeModal}
                  className="px-6 py-3 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary-hover transition-colors shadow-sm">
                  Bắt đầu thiết kế →
                </Link>
              </div>
            ) : (
              <div className="divide-y divide-border">
                {items.map(item => (
                  <CartItemRow key={item.id} item={item}
                    onRemove={() => removeItem(item.id)}
                    onQuantityChange={qty => updateQuantity(item.id, qty)} />
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          {!isEmpty && (
            <div className="px-5 py-4 border-t border-border shrink-0 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-text-secondary uppercase tracking-wide">TẠM TÍNH</span>
                <span className="text-xl font-black text-text-primary">{formatPrice(totalAmount)}</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Link href={ROUTES.cart} onClick={closeModal}
                  className="py-3 border-2 border-border rounded-xl text-sm font-bold text-text-primary hover:border-primary hover:text-primary transition-colors text-center">
                  XEM GIỎ HÀNG
                </Link>
                <Link href={ROUTES.checkout} onClick={closeModal}
                  className="py-3 bg-primary rounded-xl text-sm font-bold text-white hover:bg-primary-hover transition-colors text-center shadow-sm">
                  THANH TOÁN
                </Link>
              </div>
            </div>
          )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    )
  }
)

CartDrawer.displayName = 'CartDrawer'

