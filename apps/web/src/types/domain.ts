// ============================================================
// DOMAIN TYPES - Business entities cua BrickFrames
// ============================================================

// ------------------------------------------------------------
// PRIMITIVES
// ------------------------------------------------------------

export type ID = string
export type ISODateString = string
export type PriceInVND = number
export type URLString = string
export type JsonRecord = Record<string, unknown>

// ------------------------------------------------------------
// SHARED STATUS VALUES - Mirror Prisma enums without TS enum
// ------------------------------------------------------------

export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const

export type ProductStatus =
  (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS]

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const

export type OrderStatus = typeof ORDER_STATUS[keyof typeof ORDER_STATUS]

export const PAYMENT_METHOD = {
  COD: 'COD',
  PAYOS: 'PAYOS',
} as const

export type PaymentMethod =
  (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD]

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PENDING: 'pending',
  DEPOSIT_PENDING: 'deposit_pending',
  DEPOSIT_PAID: 'deposit_paid',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const

export type PaymentStatus =
  (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS]

export const SHIPPING_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const

export type ShippingStatus =
  (typeof SHIPPING_STATUS)[keyof typeof SHIPPING_STATUS]

export const PAYMENT_TYPE = {
  FULL_PAYMENT: 'full_payment',
  COD_DEPOSIT: 'cod_deposit',
} as const

export type PaymentType = typeof PAYMENT_TYPE[keyof typeof PAYMENT_TYPE]

export const DEPOSIT_STATUS = {
  NOT_REQUIRED: 'not_required',
  PENDING: 'pending',
  PAID: 'paid',
} as const

export type DepositStatus =
  (typeof DEPOSIT_STATUS)[keyof typeof DEPOSIT_STATUS]

export const BUSINESS_INQUIRY_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  PROCESSING: 'processing',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const

export type BusinessInquiryStatus =
  (typeof BUSINESS_INQUIRY_STATUS)[keyof typeof BUSINESS_INQUIRY_STATUS]

// ------------------------------------------------------------
// PRODUCT / FRAME
// ------------------------------------------------------------

export interface ProductImage {
  url: URLString
  alt: string
  width: number
  height: number
  isPrimary: boolean
}

export interface Product {
  id: ID
  name: string
  slug: string
  description: string | null
  basePrice: PriceInVND
  images: URLString[]
  status: ProductStatus
  featured: boolean
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface FrameMaterial {
  id: ID
  name: string
  description: string
  priceMultiplier: number
  availableFinishes: string[]
}

export interface FrameSize {
  id: ID
  label: string
  widthCm: number
  heightCm: number
  basePrice: PriceInVND
}

export interface MatColor {
  id: ID
  name: string
  colorHex: string
  priceAddon: PriceInVND
}

export interface GlassType {
  id: ID
  name: string
  description: string
  uvProtection: boolean
  antiReflective: boolean
  priceAddon: PriceInVND
}

export interface FrameConfig {
  productId: ID
  size: FrameSize
  material: FrameMaterial
  mat: MatColor
  glass: GlassType
  templateId: ID | null
  accessoryIds: ID[]
  designData: JsonRecord
  previewUrl: URLString | null
  quantity: number
}

export interface FramePreview {
  configId: ID
  previewImageUrl: URLString
  generatedAt: ISODateString
}

// ------------------------------------------------------------
// COLLECTION / TEMPLATE / ACCESSORY / BANNER
// ------------------------------------------------------------

export interface Collection {
  id: ID
  name: string
  slug: string
  description: string | null
  imageUrl: URLString | null
  status: ProductStatus
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface TemplateCategory {
  id: ID
  name: string
  slug: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface Template {
  id: ID
  name: string
  imageUrl: URLString | null
  configJson: JsonRecord | null
  status: ProductStatus
  categoryId: ID | null
  category: TemplateCategory | null
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface AccessoryCategory {
  id: ID
  name: string
  slug: string
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface Accessory {
  id: ID
  name: string
  imageUrl: URLString | null
  iconUrl: URLString | null
  status: ProductStatus
  categoryId: ID | null
  category: AccessoryCategory | null
  createdAt: ISODateString
  updatedAt: ISODateString
}

export interface Banner {
  id: ID
  title: string | null
  imageUrl: URLString
  linkUrl: URLString | null
  sortOrder: number
  status: ProductStatus
  createdAt: ISODateString
  updatedAt: ISODateString
}

// ------------------------------------------------------------
// CART / DISCOUNT
// ------------------------------------------------------------

export interface CartItem {
  id: ID
  product: Product
  config: FrameConfig
  unitPrice: PriceInVND
  totalPrice: PriceInVND
  addedAt: ISODateString
}

export interface Coupon {
  code: string
  type: 'percentage' | 'fixed'
  value: number
  minOrderAmount: PriceInVND
  expiresAt: ISODateString | null
  isValid: boolean
}

export interface Cart {
  items: CartItem[]
  subtotal: PriceInVND
  shippingCost: PriceInVND
  discountAmount: PriceInVND
  total: PriceInVND
  itemCount: number
  appliedCoupon: Coupon | null
}

export interface DiscountResult {
  discountAmount: PriceInVND
  finalTotal: PriceInVND
  appliedCoupon: Coupon
}

// ------------------------------------------------------------
// ORDER / CHECKOUT
// ------------------------------------------------------------

export interface Address {
  fullName: string
  phone: string
  email: string
  addressLine1: string
  addressLine2: string | null
  ward: string
  district: string
  province: string
  country: string
}

export interface CheckoutCustomer {
  customerName: string
  phone: string
  email: string | null
  address: string
}

export interface OrderItem {
  id: ID
  productId: ID | null
  productName: string
  quantity: number
  price: PriceInVND
  designData: JsonRecord | null
  previewUrl: URLString | null
}

export interface Payment {
  id: ID
  provider: string
  type: PaymentType
  amount: PriceInVND
  status: string
  checkoutUrl: URLString | null
  paidAt: ISODateString | null
  createdAt: ISODateString
}

export interface Order {
  id: ID
  orderCode: string
  customerName: string
  phone: string
  email: string | null
  address: string
  receiveDate: ISODateString | null
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  orderStatus: OrderStatus
  shippingStatus: ShippingStatus
  totalAmount: PriceInVND
  depositRequired: boolean
  depositPercent: number
  depositAmount: PriceInVND
  remainingAmount: PriceInVND
  depositStatus: DepositStatus | string
  depositPaidAt: ISODateString | null
  paymentProvider: string | null
  paymentLinkId: string | null
  checkoutUrl: URLString | null
  items: OrderItem[]
  payments: Payment[]
  createdAt: ISODateString
  updatedAt: ISODateString
}

// ------------------------------------------------------------
// REVIEW / BUSINESS INQUIRY
// ------------------------------------------------------------

export interface Review {
  id: ID
  productId: ID
  authorName: string
  authorAvatar: URLString | null
  rating: number
  title: string
  body: string
  images: URLString[]
  isVerifiedPurchase: boolean
  helpfulCount: number
  createdAt: ISODateString
}

export interface BusinessInquiry {
  id: ID
  companyName: string
  contactName: string
  email: string
  phone: string
  message: string
  status: BusinessInquiryStatus
  createdAt: ISODateString
  updatedAt: ISODateString
}
