// ============================================================
// CART SERVICE - Business logic cho cart operations
// Pure functions - khong access store truc tiep
// ============================================================

import { CART } from '@/constants'
import type { Address, CartItem, Coupon, DiscountResult } from '@/types'
import { PRODUCT_STATUS } from '@/types'

// ------------------------------------------------------------
// PRICE CALCULATION
// ------------------------------------------------------------

/**
 * Tinh subtotal tu cart items.
 */
export function calculateSubtotal(items: CartItem[]): number {
  return items.reduce((total, item) => total + item.totalPrice, 0)
}

/**
 * Tinh phi van chuyen.
 */
export function calculateShipping(
  subtotal: number,
  address?: Address,
): number {
  if (subtotal >= CART.FREE_SHIPPING_THRESHOLD) {
    return 0
  }

  if (address?.province) {
    const normalizedProvince = address.province
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
    const majorCities = ['ho chi minh', 'ha noi']

    if (majorCities.some((city) => normalizedProvince.includes(city))) {
      return CART.BASE_SHIPPING_FEE
    }

    return CART.BASE_SHIPPING_FEE * 2
  }

  return CART.BASE_SHIPPING_FEE
}

/**
 * Apply discount coupon va tinh lai total.
 */
export function applyDiscount(
  subtotal: number,
  coupon: Coupon,
): DiscountResult {
  const rawDiscountAmount =
    coupon.type === 'percentage'
      ? Math.round(subtotal * (coupon.value / 100))
      : coupon.value
  const discountAmount = Math.max(0, Math.min(rawDiscountAmount, subtotal))
  const finalTotal = Math.max(0, subtotal - discountAmount)

  return {
    discountAmount,
    finalTotal,
    appliedCoupon: coupon,
  }
}

/**
 * Tinh total cuoi cung voi shipping va discount.
 */
export function calculateOrderTotal(
  items: CartItem[],
  shippingCost: number,
  discountAmount: number,
): number {
  const subtotal = calculateSubtotal(items)

  return Math.max(0, subtotal + shippingCost - discountAmount)
}

// ------------------------------------------------------------
// VALIDATION
// ------------------------------------------------------------

export interface CartValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
}

/**
 * Validate toan bo cart truoc khi checkout.
 */
export function validateCart(items: CartItem[]): CartValidationResult {
  const errors: string[] = []
  const warnings: string[] = []

  if (items.length === 0) {
    errors.push('Giỏ hàng trống. Vui lòng thêm sản phẩm.')

    return { isValid: false, errors, warnings }
  }

  if (items.length > CART.MAX_ITEMS) {
    errors.push(`Giỏ hàng chỉ được chứa tối đa ${CART.MAX_ITEMS} sản phẩm.`)
  }

  for (const item of items) {
    if (item.product.status !== PRODUCT_STATUS.ACTIVE) {
      errors.push(`"${item.product.name}" hiện không còn mở bán.`)
    }

    if (item.config.productId !== item.product.id) {
      errors.push(`"${item.product.name}" có cấu hình không khớp sản phẩm.`)
    }

    if (item.config.quantity < 1) {
      errors.push(`"${item.product.name}": số lượng tối thiểu là 1.`)
    }

    if (item.config.quantity > CART.MAX_QUANTITY_PER_ITEM) {
      errors.push(
        `"${item.product.name}": số lượng tối đa là ${CART.MAX_QUANTITY_PER_ITEM}.`,
      )
    }

    if (item.unitPrice < 0 || item.totalPrice < 0) {
      errors.push(`"${item.product.name}" có giá không hợp lệ.`)
    }

    if (item.totalPrice !== item.unitPrice * item.config.quantity) {
      warnings.push(`"${item.product.name}" cần được cập nhật lại giá.`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  }
}

/**
 * Validate coupon code.
 */
export function validateCoupon(
  coupon: Coupon,
  subtotal: number,
  referenceDate: string | Date,
): { isValid: boolean; error?: string } {
  if (!coupon.isValid) {
    return { isValid: false, error: 'Mã giảm giá không hợp lệ hoặc đã hết hạn.' }
  }

  if (subtotal < coupon.minOrderAmount) {
    return {
      isValid: false,
      error: `Đơn hàng tối thiểu ${coupon.minOrderAmount.toLocaleString(
        'vi-VN',
      )} ₫ để sử dụng mã này.`,
    }
  }

  if (coupon.expiresAt !== null) {
    const expiresAt = new Date(coupon.expiresAt).getTime()
    const currentTime =
      typeof referenceDate === 'string'
        ? new Date(referenceDate).getTime()
        : referenceDate.getTime()

    if (Number.isNaN(expiresAt) || expiresAt < currentTime) {
      return { isValid: false, error: 'Mã giảm giá đã hết hạn.' }
    }
  }

  return { isValid: true }
}

// ------------------------------------------------------------
// CART ITEM HELPERS
// ------------------------------------------------------------

/**
 * Dem tong so luong items.
 */
export function getCartItemCount(items: CartItem[]): number {
  return items.reduce((count, item) => count + item.config.quantity, 0)
}

/**
 * Kiem tra xem cart item id da co trong cart chua.
 */
export function isItemInCart(
  items: CartItem[],
  cartItemId: string,
): boolean {
  return items.some((item) => item.id === cartItemId)
}

/**
 * Group cart items theo product id vi backend Product chua co collectionId.
 */
export function groupItemsByProduct(
  items: CartItem[],
): Record<string, CartItem[]> {
  return items.reduce<Record<string, CartItem[]>>((groups, item) => {
    const groupKey = item.product.id
    const existingGroup = groups[groupKey]

    if (existingGroup !== undefined) {
      existingGroup.push(item)
    } else {
      groups[groupKey] = [item]
    }

    return groups
  }, {})
}

/**
 * Convert cart items sang backend CreateOrderItemDto-compatible payload.
 */
export function toOrderItemsPayload(
  items: CartItem[],
): Array<{
  productId: string
  productName: string
  quantity: number
  price: number
  designData?: Record<string, unknown>
  previewUrl?: string
}> {
  return items.map((item) => {
    const payload: {
      productId: string
      productName: string
      quantity: number
      price: number
      designData?: Record<string, unknown>
      previewUrl?: string
    } = {
      productId: item.product.id,
      productName: item.product.name,
      quantity: item.config.quantity,
      price: item.unitPrice,
    }

    if (Object.keys(item.config.designData).length > 0) {
      payload.designData = item.config.designData
    }

    if (item.config.previewUrl !== null) {
      payload.previewUrl = item.config.previewUrl
    }

    return payload
  })
}
