// ============================================================
// FRAME SERVICE - Business logic cho frame customization
// ============================================================

import { CART, FRAME_SIZES } from '@/constants'
import type { FrameConfig, FramePreview, FrameSize, ISODateString } from '@/types'

// ------------------------------------------------------------
// PRICE CALCULATION
// ------------------------------------------------------------

export interface FramePriceBreakdown {
  basePrice: number
  materialAddon: number
  matAddon: number
  glassAddon: number
  subtotal: number
  totalWithQty: number
}

/**
 * Tinh gia frame voi day du breakdown.
 */
export function calculateFramePrice(
  config: FrameConfig,
): FramePriceBreakdown {
  const basePrice = config.size.basePrice
  const materialAddon = Math.round(
    basePrice * (config.material.priceMultiplier - 1),
  )
  const matAddon = config.mat.priceAddon
  const glassAddon = config.glass.priceAddon
  const subtotal = basePrice + materialAddon + matAddon + glassAddon
  const totalWithQty = subtotal * config.quantity

  return {
    basePrice,
    materialAddon,
    matAddon,
    glassAddon,
    subtotal,
    totalWithQty,
  }
}

/**
 * Tinh gia don gian.
 */
export function getFrameUnitPrice(config: FrameConfig): number {
  return calculateFramePrice(config).subtotal
}

// ------------------------------------------------------------
// SIZE COMPATIBILITY
// ------------------------------------------------------------

export interface LegoSetDimensions {
  widthStuds: number
  heightStuds: number
}

export interface ActualSize {
  widthCm: number
  heightCm: number
}

const STUD_TO_CM = 0.8
const DEFAULT_MIN_PADDING_CM = 2
const DEFAULT_PREVIEW_GENERATED_AT = '1970-01-01T00:00:00.000Z'

/**
 * Tinh kich thuoc thuc te cua LEGO set.
 */
export function legoSetToActualSize(
  dimensions: LegoSetDimensions,
): ActualSize {
  return {
    widthCm: dimensions.widthStuds * STUD_TO_CM,
    heightCm: dimensions.heightStuds * STUD_TO_CM,
  }
}

/**
 * Lay cac frame sizes phu hop voi LEGO set.
 */
export function getCompatibleSizes(
  legoWidthCm: number,
  legoHeightCm: number,
  minPaddingCm: number = DEFAULT_MIN_PADDING_CM,
): FrameSize[] {
  const requiredWidth = legoWidthCm + minPaddingCm * 2
  const requiredHeight = legoHeightCm + minPaddingCm * 2

  return Object.values(FRAME_SIZES).filter(
    (size) =>
      size.widthCm >= requiredWidth && size.heightCm >= requiredHeight,
  )
}

/**
 * Recommend size tot nhat.
 */
export function recommendFrameSize(
  legoWidthCm: number,
  legoHeightCm: number,
): FrameSize | null {
  const compatibleSizes = getCompatibleSizes(legoWidthCm, legoHeightCm)

  if (compatibleSizes.length === 0) {
    return null
  }

  return compatibleSizes.reduce((best, current) => {
    const bestArea = best.widthCm * best.heightCm
    const currentArea = current.widthCm * current.heightCm

    return currentArea < bestArea ? current : best
  })
}

// ------------------------------------------------------------
// PREVIEW
// ------------------------------------------------------------

function stableSerialize(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map(stableSerialize).join(',')}]`
  }

  if (typeof value === 'object' && value !== null) {
    const record = value as Record<string, unknown>
    const entries = Object.keys(record)
      .sort()
      .map((key) => `${key}:${stableSerialize(record[key])}`)

    return `{${entries.join(',')}}`
  }

  return JSON.stringify(value)
}

/**
 * Generate preview config ID dung lam cache key.
 */
export function generatePreviewConfigId(config: FrameConfig): string {
  return [
    config.productId,
    config.size.id,
    config.material.id,
    config.mat.id,
    config.glass.id,
    config.templateId ?? 'no-template',
    [...config.accessoryIds].sort().join('-') || 'no-accessories',
    stableSerialize(config.designData),
  ].join('_')
}

/**
 * Generate preview metadata thuan tuy. Timestamp duoc truyen vao de giu pure.
 */
export function generateFramePreview(
  config: FrameConfig,
  generatedAt: ISODateString = DEFAULT_PREVIEW_GENERATED_AT,
): FramePreview {
  const configId = generatePreviewConfigId(config)

  return {
    configId,
    previewImageUrl: `/api/preview/${encodeURIComponent(configId)}.jpg`,
    generatedAt,
  }
}

// ------------------------------------------------------------
// VALIDATION
// ------------------------------------------------------------

export interface FrameConfigValidationResult {
  isValid: boolean
  errors: string[]
}

/**
 * Kiem tra config hop le truoc khi add to cart.
 */
export function validateFrameConfig(
  config: FrameConfig,
): FrameConfigValidationResult {
  const errors: string[] = []

  if (config.productId.trim().length === 0) {
    errors.push('Sản phẩm không hợp lệ.')
  }

  if (config.quantity < 1) {
    errors.push('Số lượng phải ít nhất là 1.')
  }

  if (config.quantity > CART.MAX_QUANTITY_PER_ITEM) {
    errors.push(`Số lượng tối đa là ${CART.MAX_QUANTITY_PER_ITEM}.`)
  }

  if (config.size.id.trim().length === 0) {
    errors.push('Vui lòng chọn kích thước khung.')
  }

  if (config.material.id.trim().length === 0) {
    errors.push('Vui lòng chọn chất liệu khung.')
  }

  if (config.mat.id.trim().length === 0) {
    errors.push('Vui lòng chọn màu mat.')
  }

  if (config.glass.id.trim().length === 0) {
    errors.push('Vui lòng chọn loại kính.')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
