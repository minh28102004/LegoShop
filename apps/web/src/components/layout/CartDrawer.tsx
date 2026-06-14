'use client'

import * as React from 'react'
import Link from 'next/link'
import type { HTMLMotionProps } from 'framer-motion'
import { Trash2 } from 'lucide-react'

import { Button, Drawer, Separator } from '@/components/ui'
import { ROUTES, UI_MODAL_IDS } from '@/constants'
import { useCart } from '@/features/cart/hooks/useCart'
import { formatPrice } from '@/lib/formatters'
import { selectActiveModal, useUIStore } from '@/stores/uiStore'
import { EmptyState } from '@/components/shared/EmptyState'
import { PriceDisplay } from '@/components/shared/PriceDisplay'
import { QuantitySelector } from '@/components/shared/QuantitySelector'
import { LazyImage } from '@/components/shared/LazyImage'

export interface CartDrawerProps
  extends Omit<HTMLMotionProps<'div'>, 'children' | 'title'> {
  className?: string
}

export const CartDrawer = React.forwardRef<HTMLDivElement, CartDrawerProps>(
  ({ ...props }, ref) => {
    const activeModal = useUIStore(selectActiveModal)
    const closeModal = useUIStore((state) => state.closeModal)
    const {
      clearCart,
      isEmpty,
      itemCount,
      items,
      removeItem,
      shipping,
      subtotal,
      total,
      updateQuantity,
    } = useCart()
    const isOpen = activeModal === UI_MODAL_IDS.CART_DRAWER

    return (
      <Drawer
        ref={ref}
        isOpen={isOpen}
        onClose={closeModal}
        title={`Giỏ hàng (${itemCount})`}
        position="right"
        size="lg"
        {...props}
      >
        {isEmpty ? (
          <EmptyState
            title="Giỏ hàng đang trống"
            description="Bắt đầu tạo khung trưng bày riêng cho bộ sưu tập của bạn."
            action={{ label: 'Tạo ngay', href: ROUTES.creatorStudio }}
            className="border-none bg-transparent py-12"
          />
        ) : (
          <div className="flex min-h-[calc(100dvh-120px)] flex-col gap-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div key={item.id} className="grid grid-cols-[88px_1fr] gap-4">
                  <LazyImage
                    src={item.product.images[0] ?? '/window.svg'}
                    alt={item.product.name}
                    width={88}
                    height={88}
                    wrapperClassName="size-[88px] rounded-md"
                    className="size-full object-cover"
                  />
                  <div className="min-w-0 space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <Link
                          href={ROUTES.product(item.product.slug)}
                          className="line-clamp-2 text-body-sm font-semibold text-text-primary hover:text-primary"
                        >
                          {item.product.name}
                        </Link>
                        <p className="mt-1 text-body-xs text-text-muted">
                          {item.config.size.label} · {item.config.material.name}
                        </p>
                      </div>
                      <button
                        type="button"
                        aria-label="Xóa sản phẩm"
                        className="rounded-sm p-1 text-text-muted transition-base hover:bg-surface hover:text-error"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="size-4" aria-hidden="true" />
                      </button>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <QuantitySelector
                        value={item.config.quantity}
                        min={1}
                        max={10}
                        size="sm"
                        onChange={(quantity) => updateQuantity(item.id, quantity)}
                      />
                      <PriceDisplay price={item.totalPrice} size="sm" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-auto space-y-4">
              <Separator />
              <div className="space-y-2 text-body-sm">
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Tạm tính</span>
                  <span className="font-semibold text-text-primary">
                    {formatPrice(subtotal)}
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-text-secondary">Vận chuyển</span>
                  <span className="font-semibold text-text-primary">
                    {shipping === 0 ? 'Miễn phí' : formatPrice(shipping)}
                  </span>
                </div>
                <div className="flex justify-between gap-4 text-body-md">
                  <span className="font-semibold text-text-primary">Tổng cộng</span>
                  <span className="font-semibold text-text-primary">
                    {formatPrice(total)}
                  </span>
                </div>
              </div>
              <Button asChild className="w-full" size="lg">
                <Link href={ROUTES.checkout}>Thanh toán</Link>
              </Button>
              <Button
                variant="ghost"
                className="w-full"
                onClick={clearCart}
              >
                Xóa giỏ hàng
              </Button>
            </div>
          </div>
        )}
      </Drawer>
    )
  },
)

CartDrawer.displayName = 'CartDrawer'
