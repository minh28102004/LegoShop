// ============================================================
// DOMAIN TYPES - Business entities cua BrickFrames
// ============================================================

import {
  DEPOSIT_STATUS,
  INQUIRY_STATUS as BUSINESS_INQUIRY_STATUS,
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  PRODUCT_STATUS,
  SHIPPING_STATUS,
} from '@lego-shop/shared'
import type {
  DepositStatus,
  ID,
  InquiryStatus,
  ISODateString,
  JsonObject,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  PriceInVND,
  ProductStatus,
  ShippingStatus,
  URLString,
} from '@lego-shop/shared'

export {
  BUSINESS_INQUIRY_STATUS,
  DEPOSIT_STATUS,
  ORDER_STATUS,
  PAYMENT_METHOD,
  PAYMENT_STATUS,
  PAYMENT_TYPE,
  PRODUCT_STATUS,
  SHIPPING_STATUS,
}

export type {
  DepositStatus,
  ID,
  ISODateString,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PaymentType,
  PriceInVND,
  ProductStatus,
  ShippingStatus,
  URLString,
}

export type JsonRecord = JsonObject
export type BusinessInquiryStatus = InquiryStatus

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
