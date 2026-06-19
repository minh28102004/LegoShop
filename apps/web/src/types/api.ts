// ============================================================
// API TYPES - Request/Response shapes
// ============================================================

import type {
  BusinessInquiryStatus,
  ID,
  ISODateString,
  Order,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  PriceInVND,
  ProductStatus,
  ShippingStatus,
  URLString,
} from './domain'
import type {
  CreateBusinessInquiryRequestContract,
  CreateOrderItemRequestContract,
  CreateOrderRequestContract,
  CreateOrderResponseContract,
  UpdateBusinessInquiryStatusRequestContract,
} from '@lego-shop/shared'

// ------------------------------------------------------------
// BASE RESPONSE WRAPPERS
// ------------------------------------------------------------

export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  timestamp: ISODateString
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: PaginationMeta
  success: boolean
}

export interface PaginationMeta {
  page: number
  pageSize: number
  totalCount: number
  totalPages: number
  hasNextPage: boolean
  hasPreviousPage: boolean
}

// ------------------------------------------------------------
// ERROR
// ------------------------------------------------------------

export interface ApiError {
  code: string
  message: string
  field?: string
  details?: Record<string, unknown>
}

export interface ApiErrorResponse {
  success: false
  error: ApiError
  errors?: ApiError[]
  timestamp: ISODateString
}

// ------------------------------------------------------------
// REQUEST FILTERS
// ------------------------------------------------------------

export interface ProductFilters {
  search?: string
  status?: ProductStatus
  featured?: boolean
  minPrice?: PriceInVND
  maxPrice?: PriceInVND
  sortBy?: 'price_asc' | 'price_desc' | 'newest' | 'popular'
  page?: number
  pageSize?: number
}

export interface CollectionFilters {
  search?: string
  status?: ProductStatus
  page?: number
  pageSize?: number
}

export interface OrderFilters {
  search?: string
  orderStatus?: OrderStatus
  paymentStatus?: PaymentStatus
  shippingStatus?: ShippingStatus
  page?: number
  limit?: number
}

export interface BusinessInquiryFilters {
  search?: string
  status?: BusinessInquiryStatus
  page?: number
  limit?: number
}

// ------------------------------------------------------------
// CHECKOUT / ORDERS - Mirrors backend DTOs
// ------------------------------------------------------------

export type CreateOrderItemRequest = CreateOrderItemRequestContract
export type CreateOrderRequest = CreateOrderRequestContract
export type CreateOrderResponse = CreateOrderResponseContract

export type TrackOrderResponse = Omit<Order, 'id'>

export interface CreatePaymentLinkResponse {
  orderId: ID
  orderCode: string
  paymentMethod: PaymentMethod
  paymentStatus: PaymentStatus
  totalAmount: PriceInVND
  depositRequired: boolean
  depositPercent: number
  depositAmount: PriceInVND
  remainingAmount: PriceInVND
  depositStatus: string
  checkoutUrl?: URLString
}

// ------------------------------------------------------------
// BUSINESS INQUIRY
// ------------------------------------------------------------

export type CreateBusinessInquiryRequest = CreateBusinessInquiryRequestContract
export type UpdateBusinessInquiryStatusRequest = UpdateBusinessInquiryStatusRequestContract
