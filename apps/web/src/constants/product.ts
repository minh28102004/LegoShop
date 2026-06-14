// ============================================================
// PRODUCT CONSTANTS - Frame configuration options
// ============================================================

import type { FrameMaterial, FrameSize, GlassType, MatColor } from '@/types'

// ------------------------------------------------------------
// FRAME MATERIALS
// ------------------------------------------------------------

export const FRAME_MATERIALS: Record<string, FrameMaterial> = {
  OAK: {
    id: 'mat-oak',
    name: 'Soi Tu Nhien',
    description: 'Go soi nguyen khoi, van go noi bat, hoan thien matte.',
    priceMultiplier: 1,
    availableFinishes: ['natural', 'walnut-stain', 'white-wash'],
  },
  WALNUT: {
    id: 'mat-walnut',
    name: 'Oc Cho Den',
    description: 'Go oc cho den cao cap, mau sac tram am, sang trong.',
    priceMultiplier: 1.4,
    availableFinishes: ['natural', 'ebony'],
  },
  BAMBOO: {
    id: 'mat-bamboo',
    name: 'Tre Ep',
    description: 'Vat lieu ben vung, nhe, than thien moi truong.',
    priceMultiplier: 0.85,
    availableFinishes: ['natural', 'carbonized'],
  },
  METAL_BLACK: {
    id: 'mat-metal-black',
    name: 'Kim Loai Den',
    description: 'Nhom anodized, finish matte industrial.',
    priceMultiplier: 1.2,
    availableFinishes: ['matte-black'],
  },
  METAL_GOLD: {
    id: 'mat-metal-gold',
    name: 'Kim Loai Vang',
    description: 'Nhom anodized, finish brushed gold cao cap.',
    priceMultiplier: 1.5,
    availableFinishes: ['brushed-gold'],
  },
}

// ------------------------------------------------------------
// FRAME SIZES
// ------------------------------------------------------------

export const FRAME_SIZES: Record<string, FrameSize> = {
  S_20X20: {
    id: 'size-20x20',
    label: '20 x 20 cm',
    widthCm: 20,
    heightCm: 20,
    basePrice: 450000,
  },
  S_30X30: {
    id: 'size-30x30',
    label: '30 x 30 cm',
    widthCm: 30,
    heightCm: 30,
    basePrice: 650000,
  },
  S_40X30: {
    id: 'size-40x30',
    label: '40 x 30 cm',
    widthCm: 40,
    heightCm: 30,
    basePrice: 750000,
  },
  S_50X40: {
    id: 'size-50x40',
    label: '50 x 40 cm',
    widthCm: 50,
    heightCm: 40,
    basePrice: 950000,
  },
  S_60X50: {
    id: 'size-60x50',
    label: '60 x 50 cm',
    widthCm: 60,
    heightCm: 50,
    basePrice: 1250000,
  },
  S_80X60: {
    id: 'size-80x60',
    label: '80 x 60 cm',
    widthCm: 80,
    heightCm: 60,
    basePrice: 1650000,
  },
}

// ------------------------------------------------------------
// MAT COLORS
// ------------------------------------------------------------

export const MAT_COLORS: Record<string, MatColor> = {
  WHITE: {
    id: 'mat-white',
    name: 'Trang Tinh',
    colorHex: '#FFFFFF',
    priceAddon: 0,
  },
  CREAM: {
    id: 'mat-cream',
    name: 'Kem Nhat',
    colorHex: '#F5F0E8',
    priceAddon: 0,
  },
  LIGHT_GRAY: {
    id: 'mat-light-gray',
    name: 'Xam Nhe',
    colorHex: '#E8E8E8',
    priceAddon: 50000,
  },
  CHARCOAL: {
    id: 'mat-charcoal',
    name: 'Than Chi',
    colorHex: '#3A3A3A',
    priceAddon: 50000,
  },
  MIDNIGHT: {
    id: 'mat-midnight',
    name: 'Den Tuyen',
    colorHex: '#1A1A1A',
    priceAddon: 50000,
  },
  NAVY: {
    id: 'mat-navy',
    name: 'Xanh Navy',
    colorHex: '#1B2A4A',
    priceAddon: 80000,
  },
  FOREST: {
    id: 'mat-forest',
    name: 'Xanh Rung',
    colorHex: '#2D4A3E',
    priceAddon: 80000,
  },
}

// ------------------------------------------------------------
// GLASS TYPES
// ------------------------------------------------------------

export const GLASS_TYPES: Record<string, GlassType> = {
  STANDARD: {
    id: 'glass-standard',
    name: 'Kinh Thuong',
    description: 'Kinh trong suot co ban, bao ve khoi bui va va cham.',
    uvProtection: false,
    antiReflective: false,
    priceAddon: 0,
  },
  UV_PROTECTION: {
    id: 'glass-uv',
    name: 'Kinh Chong UV',
    description: 'Loc 99% tia UV, bao ve mau sac lau dai.',
    uvProtection: true,
    antiReflective: false,
    priceAddon: 150000,
  },
  ANTI_REFLECTIVE: {
    id: 'glass-ar',
    name: 'Kinh Chong Phan Chieu',
    description: 'Giam choi sang, hien thi mau sac trung thuc nhat.',
    uvProtection: false,
    antiReflective: true,
    priceAddon: 200000,
  },
  MUSEUM: {
    id: 'glass-museum',
    name: 'Kinh Bao Tang',
    description:
      'Chong UV va chong phan chieu. Tieu chuan gallery chuyen nghiep.',
    uvProtection: true,
    antiReflective: true,
    priceAddon: 350000,
  },
}

// ------------------------------------------------------------
// BACKEND CONTRACT VALUES
// ------------------------------------------------------------

export const PRODUCT_STATUS_VALUES = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export const PAYMENT_METHOD_VALUES = {
  COD: 'COD',
  PAYOS: 'PAYOS',
} as const

export const ORDER_STATUS_VALUES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export const PAYMENT_STATUS_VALUES = {
  UNPAID: 'unpaid',
  PENDING: 'pending',
  DEPOSIT_PENDING: 'deposit_pending',
  DEPOSIT_PAID: 'deposit_paid',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

export const SHIPPING_STATUS_VALUES = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

// ------------------------------------------------------------
// PAGINATION
// ------------------------------------------------------------

export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 12,
  MAX_PAGE_SIZE: 48,
  ADMIN_PAGE_SIZE: 20,
} as const

// ------------------------------------------------------------
// CART LIMITS
// ------------------------------------------------------------

export const CART = {
  MAX_ITEMS: 20,
  MAX_QUANTITY_PER_ITEM: 10,
  FREE_SHIPPING_THRESHOLD: 2000000,
  BASE_SHIPPING_FEE: 45000,
} as const

// ------------------------------------------------------------
// CREATOR STUDIO LIMITS
// ------------------------------------------------------------

export const CREATOR_STUDIO = {
  MIN_QUANTITY: 1,
  MAX_QUANTITY: CART.MAX_QUANTITY_PER_ITEM,
  PREVIEW_SIZE_PX: 1024,
  THUMBNAIL_SIZE_PX: 320,
} as const

// ------------------------------------------------------------
// ANIMATION DELAYS (ms)
// ------------------------------------------------------------

export const ANIMATION_DELAY = {
  NONE: 0,
  XS: 50,
  SM: 100,
  MD: 150,
  LG: 200,
  XL: 300,
  STAGGER: 75,
} as const
