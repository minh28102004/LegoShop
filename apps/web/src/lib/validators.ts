// ============================================================
// VALIDATORS - Zod schemas for external data validation
// ============================================================

import { z } from 'zod'

import { CART } from '@/constants'
import { PAYMENT_METHOD } from '@/types'

// ------------------------------------------------------------
// REUSABLE FIELD SCHEMAS
// ------------------------------------------------------------

const PHONE_PATTERN =
  /^(\+84|84|0)(3[2-9]|5[6-9]|7[0-9]|8[0-9]|9[0-9])[0-9]{7}$/

const optionalString = (schema: z.ZodString) =>
  z.preprocess(
    (value: unknown) =>
      typeof value === 'string' && value.trim() === ''
        ? undefined
        : value,
    schema.optional(),
  )

const phoneSchema = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập số điện thoại')
  .regex(PHONE_PATTERN, 'Số điện thoại không hợp lệ')

const emailSchema = z
  .string()
  .trim()
  .min(1, 'Vui lòng nhập email')
  .email('Email không hợp lệ')

const optionalEmailSchema = optionalString(emailSchema)

const optionalUrlSchema = optionalString(z.string().trim().url('URL không hợp lệ'))

const fullNameSchema = z
  .string()
  .trim()
  .min(2, 'Tên phải có ít nhất 2 ký tự')
  .max(100, 'Tên không được quá 100 ký tự')

const orderAddressSchema = z
  .string()
  .trim()
  .min(5, 'Địa chỉ phải có ít nhất 5 ký tự')
  .max(500, 'Địa chỉ không được quá 500 ký tự')

const optionalReceiveDateSchema = optionalString(
  z.string().trim().date('Ngày nhận không hợp lệ'),
)

// ------------------------------------------------------------
// ADDRESS SCHEMA
// ------------------------------------------------------------

export const addressSchema = z.object({
  fullName: fullNameSchema,
  phone: phoneSchema,
  email: emailSchema,
  addressLine1: z
    .string()
    .trim()
    .min(5, 'Địa chỉ phải có ít nhất 5 ký tự'),
  addressLine2: z.string().trim().optional(),
  ward: z.string().trim().min(1, 'Vui lòng chọn phường/xã'),
  district: z.string().trim().min(1, 'Vui lòng chọn quận/huyện'),
  province: z.string().trim().min(1, 'Vui lòng chọn tỉnh/thành phố'),
  country: z.string().trim().default('Việt Nam'),
})

export type AddressFormData = z.infer<typeof addressSchema>

// ------------------------------------------------------------
// CHECKOUT SCHEMA - Mirrors backend CreateOrderDto
// ------------------------------------------------------------

export const checkoutItemSchema = z.object({
  productId: z.string().trim().min(1, 'Sản phẩm không hợp lệ'),
  productName: z.string().trim().min(1, 'Tên sản phẩm không hợp lệ'),
  quantity: z
    .number()
    .int('Số lượng phải là số nguyên')
    .min(1, 'Số lượng tối thiểu là 1')
    .max(
      CART.MAX_QUANTITY_PER_ITEM,
      `Số lượng tối đa là ${CART.MAX_QUANTITY_PER_ITEM}`,
    ),
  price: z
    .number()
    .int('Giá phải là số nguyên')
    .min(0, 'Giá không được âm'),
  designData: z.record(z.string(), z.unknown()).optional(),
  previewUrl: optionalUrlSchema,
})

export type CheckoutItemFormData = z.infer<typeof checkoutItemSchema>

export const checkoutSchema = z.object({
  customerName: fullNameSchema,
  phone: phoneSchema,
  email: optionalEmailSchema,
  address: orderAddressSchema,
  receiveDate: optionalReceiveDateSchema,
  paymentMethod: z.enum([PAYMENT_METHOD.COD, PAYMENT_METHOD.PAYOS]),
  items: z.array(checkoutItemSchema).min(1, 'Giỏ hàng đang trống'),
})

export type CheckoutFormData = z.infer<typeof checkoutSchema>

// ------------------------------------------------------------
// CONTACT / BUSINESS INQUIRY SCHEMA
// ------------------------------------------------------------

export const contactSchema = z.object({
  fullName: fullNameSchema,
  email: emailSchema,
  phone: optionalString(phoneSchema),
  subject: z
    .string()
    .trim()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự'),
  message: z
    .string()
    .trim()
    .min(20, 'Tin nhắn phải có ít nhất 20 ký tự')
    .max(2000, 'Tin nhắn không được quá 2000 ký tự'),
})

export type ContactFormData = z.infer<typeof contactSchema>

export const businessInquirySchema = z.object({
  companyName: z
    .string()
    .trim()
    .min(2, 'Tên công ty phải có ít nhất 2 ký tự')
    .max(150, 'Tên công ty không được quá 150 ký tự'),
  contactName: fullNameSchema,
  email: emailSchema,
  phone: phoneSchema,
  message: z
    .string()
    .trim()
    .min(20, 'Nội dung phải có ít nhất 20 ký tự')
    .max(2000, 'Nội dung không được quá 2000 ký tự'),
})

export type BusinessInquiryFormData = z.infer<typeof businessInquirySchema>

// ------------------------------------------------------------
// REVIEW SCHEMA
// ------------------------------------------------------------

export const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  title: z
    .string()
    .trim()
    .min(5, 'Tiêu đề phải có ít nhất 5 ký tự')
    .max(100, 'Tiêu đề không được quá 100 ký tự'),
  body: z
    .string()
    .trim()
    .min(20, 'Đánh giá phải có ít nhất 20 ký tự')
    .max(1000, 'Đánh giá không được quá 1000 ký tự'),
})

export type ReviewFormData = z.infer<typeof reviewSchema>

// ------------------------------------------------------------
// COUPON SCHEMA
// ------------------------------------------------------------

export const couponSchema = z.object({
  code: z
    .string()
    .trim()
    .min(4, 'Mã giảm giá phải có ít nhất 4 ký tự')
    .max(20, 'Mã giảm giá không được quá 20 ký tự')
    .toUpperCase(),
})

export type CouponFormData = z.infer<typeof couponSchema>
