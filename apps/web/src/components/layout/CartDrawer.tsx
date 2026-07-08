'use client'

// CartDrawer — slide-out cart panel (animated using Framer Motion)
import * as React from 'react'
import Link from 'next/link'
import { createPortal } from 'react-dom'
import { X, ShoppingBag, Package, Pencil } from 'lucide-react'
import { formatCurrency as formatPrice } from '@lego-shop/shared'
// Framer motion removed temporarily for debugging
import { ROUTES, UI_MODAL_IDS } from '@/config/routes'
import { useCart } from '@/features/cart/hooks/useCart'
import { getCartItemParts } from '@/features/cart/cart-parts'
import { resolveApiAssetUrl } from '@/lib/api/assets'
import { selectActiveModal, useUIStore } from '@/features/ui/store'
import type { SimpleCartItem } from '@/features/cart/store'
import { getDesignCharacterCount, getDesignTemplateName } from '@/features/studio/design-data'

export interface CartDrawerProps {
  className?: string
}

function readCartDesignText(item: SimpleCartItem, key: string) {
  const value = item.designData?.[key]
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function readCartCharacterCount(item: SimpleCartItem) {
  const value = item.designData?.characterCount
  return typeof value === 'number' && value > 0 ? value : 0
}

function CartItemRow({ item, onRemove, onQuantityChange }: {
  item: SimpleCartItem
  onRemove: () => void
  onQuantityChange: (qty: number) => void
}) {
  const previewUrl = resolveApiAssetUrl(item.previewUrl)
  const parts = getCartItemParts(item)
  const canEditDesign = item.designData?.type === 'CUSTOM_FRAME'
  const templateName = getDesignTemplateName(item.designData) ?? readCartDesignText(item, 'templateName')
  const characterCount = getDesignCharacterCount(item.designData) || readCartCharacterCount(item)
  const accessoryNames = item.accessories?.map((accessory) => accessory.name).filter(Boolean) ?? []

  return (
    <div className="flex gap-3 py-4 border-b border-border last:border-0">
      <div className="w-16 h-16 rounded-xl bg-background shrink-0 overflow-hidden flex items-center justify-center border border-border relative">
        {previewUrl ? (
          <img src={previewUrl} alt={item.productName} className="h-full w-full object-cover" />
        ) : (
          <Package className="w-6 h-6 text-text-muted" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-1">
          <div className="min-w-0">
            <p className="text-sm font-bold text-text-primary truncate">{item.productName}</p>
            <div className="mt-2 space-y-1.5">
              {parts.map((part, index) => {
                const partImage = resolveApiAssetUrl(part.imageUrl)
                return (
                  <div key={`${part.type}-${part.id ?? index}`} className="flex items-center gap-2 rounded-lg bg-background/70 px-2 py-1.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-md border border-border bg-white">
                      {partImage ? (
                        <img src={partImage} alt={part.name} className="h-full w-full object-cover" />
                      ) : (
                        <Package className="h-3.5 w-3.5 text-text-muted" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-[11px] font-semibold text-text-primary">{part.name}</p>
                      <p className="text-[10px] text-text-muted">x{part.quantity}</p>
                    </div>
                    <span className="shrink-0 text-[11px] font-bold text-text-primary">{formatPrice(part.totalPrice)}</span>
                  </div>
                )
              })}
            </div>
            <p className="hidden">
              {[item.frameSizeLabel, item.frameColorName].filter(Boolean).join(' · ')}
            </p>
            <div className="hidden">
            {templateName ? (
              <p className="text-xs text-text-muted mt-0.5 truncate">Nền: {templateName}</p>
            ) : null}
            {characterCount > 0 ? (
              <p className="text-xs text-text-muted mt-0.5">{characterCount} nhân vật</p>
            ) : null}
            {accessoryNames.length ? (
              <p className="text-xs text-text-muted mt-0.5 truncate">
                Phụ kiện: {accessoryNames.join(', ')}
              </p>
            ) : null}
            </div>
            {item.note ? (
              <p className="text-xs text-text-muted mt-0.5 line-clamp-2">Ghi chú: {item.note}</p>
            ) : null}
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
        {canEditDesign ? (
        <Link href={`${ROUTES.studio}?editCartItemId=${encodeURIComponent(item.id)}`} className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-semibold text-text-muted hover:text-primary transition-colors">
          <Pencil className="w-2.5 h-2.5" /> Chỉnh sửa thiết kế
        </Link>
        ) : null}
      </div>
    </div>
  )
}

export const CartDrawer = React.forwardRef<HTMLDivElement, CartDrawerProps>(
  ({ ...props }, ref) => {
    const activeModal = useUIStore(selectActiveModal)
    const closeModal = useUIStore((state) => state.closeModal)
    const { isEmpty, items, removeItem, totalAmount, updateQuantity, isOpen: isCartOpen, closeCart } = useCart()
    const [mounted, setMounted] = React.useState(false)
    const [isEventOpen, setIsEventOpen] = React.useState(false)
    const openedAtRef = React.useRef(0)
    const isOpen = activeModal === UI_MODAL_IDS.CART_DRAWER || isCartOpen || isEventOpen
    const handleClose = React.useCallback(() => {
      setIsEventOpen(false)
      closeCart()
      closeModal()
    }, [closeCart, closeModal])
    const handleBackdropClick = React.useCallback(() => {
      if (Date.now() - openedAtRef.current < 300) {
        return
      }
      handleClose()
    }, [handleClose])

    React.useEffect(() => {
      setMounted(true)
    }, [])

    React.useEffect(() => {
      const openDrawer = () => {
        openedAtRef.current = Date.now()
        setIsEventOpen(true)
      }

      window.addEventListener('legoshop:open-cart', openDrawer)
      return () => {
        window.removeEventListener('legoshop:open-cart', openDrawer)
      }
    }, [])

    React.useEffect(() => {
      if (isOpen) {
        openedAtRef.current = Date.now()
      }
    }, [isOpen])

    if (!mounted) {
      return null
    }

    return createPortal(
      <>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div
              data-cart-drawer-backdrop="true"
              className="fixed inset-0 bg-black/40 backdrop-blur-[2px]"
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 1200,
                background: 'rgba(0, 0, 0, 0.4)',
                backdropFilter: 'blur(2px)',
              }}
              onClick={handleBackdropClick}
            />
            {/* Drawer */}
            <div
              ref={ref}
              data-cart-drawer-panel="true"
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-surface flex flex-col shadow-2xl border-l border-border"
              style={{
                position: 'fixed',
                top: 0,
                right: 0,
                bottom: 0,
                zIndex: 1210,
                display: 'flex',
                flexDirection: 'column',
                width: '100%',
                maxWidth: '28rem',
                background: 'hsl(var(--color-surface))',
                borderLeft: '1px solid hsl(var(--color-border))',
                boxShadow: 'var(--shadow-2xl)',
              }}
              {...props}
            >
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
                <h2 className="font-black text-lg text-text-primary">Giỏ hàng</h2>
                <button type="button" onClick={handleClose} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mx-4 mt-3 px-3 py-2 bg-background border border-border rounded-lg text-xs font-semibold leading-5 text-text-secondary">
                Phí ship không cộng vào đơn. Shop báo phí trước khi giao, khách trả trực tiếp cho tài xế.
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto px-5">
                {isEmpty ? (
                  <div className="flex flex-col items-center justify-center py-16 text-center">
                    <div className="w-20 h-20 rounded-2xl bg-[#fff4f7] flex items-center justify-center mb-5">
                      <ShoppingBag className="w-9 h-9 text-[#ef9ab3]" />
                    </div>
                    <p className="font-black text-text-primary text-lg mb-2">Giỏ hàng trống</p>
                    <p className="text-sm text-text-secondary mb-6">Thiết kế khung LEGO cá nhân hóa và thêm vào giỏ hàng ngay!</p>
                    <Link href={ROUTES.studio} onClick={handleClose}
                      className="px-6 py-3 bg-[#ef9ab3] text-white rounded-xl text-sm font-bold hover:bg-[#e77f9f] transition-colors shadow-sm">
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
                    <Link href={ROUTES.cart} onClick={handleClose}
                      className="py-3 border-2 border-border rounded-xl text-sm font-bold text-text-primary hover:border-[#ef9ab3] hover:text-[#d94f77] transition-colors text-center">
                      XEM GIỎ HÀNG
                    </Link>
                    <Link href={ROUTES.checkout} onClick={handleClose}
                      className="py-3 bg-[#ef9ab3] rounded-xl text-sm font-bold text-white hover:bg-[#e77f9f] transition-colors text-center shadow-sm">
                      THANH TOÁN
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </>,
      document.body,
    )
  }
)

CartDrawer.displayName = 'CartDrawer'

