export const PRODUCT_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
} as const;

export const PRODUCT_TYPE = {
  RETAIL: 'retail',
  FINISHED: 'finished',
  PREMADE_CHARACTER: 'premade_character',
  DIY_KIT: 'diy_kit',
} as const;

export const FRAME_OPTION_TYPE = {
  SIZE: 'size',
  COLOR: 'color',
  TEMPLATE: 'template',
  MATERIAL: 'material',
  GLASS: 'glass',
  MAT: 'mat',
  ACCESSORY: 'accessory',
} as const;

export const CHARACTER_PART_TYPE = {
  FACE: 'FACE',
  HAIR: 'HAIR',
  TORSO: 'TORSO',
  LEGS: 'LEGS',
  HAT: 'HAT',
  ACCESSORY: 'ACCESSORY',
} as const;

export const ORDER_STATUS = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PROCESSING: 'processing',
  SHIPPING: 'shipping',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_METHOD = {
  COD: 'COD',
  PAYOS: 'PAYOS',
} as const;

export const PAYMENT_STATUS = {
  UNPAID: 'unpaid',
  PENDING: 'pending',
  DEPOSIT_PENDING: 'deposit_pending',
  DEPOSIT_PAID: 'deposit_paid',
  PAID: 'paid',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const SHIPPING_STATUS = {
  PENDING: 'pending',
  PREPARING: 'preparing',
  SHIPPING: 'shipping',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
} as const;

export const PAYMENT_TYPE = {
  FULL_PAYMENT: 'full_payment',
  COD_DEPOSIT: 'cod_deposit',
} as const;

export const VOUCHER_DISCOUNT_TYPE = {
  PERCENTAGE: 'percentage',
  FIXED: 'fixed',
} as const;

export const DEPOSIT_STATUS = {
  NOT_REQUIRED: 'not_required',
  PENDING: 'pending',
  PAID: 'paid',
} as const;

export const INQUIRY_STATUS = {
  NEW: 'new',
  CONTACTED: 'contacted',
  PROCESSING: 'processing',
  DONE: 'done',
  CANCELLED: 'cancelled',
} as const;

export const PRODUCT_STATUS_VALUES = Object.values(PRODUCT_STATUS);
export const PRODUCT_TYPE_VALUES = Object.values(PRODUCT_TYPE);
export const FRAME_OPTION_TYPE_VALUES = Object.values(FRAME_OPTION_TYPE);
export const CHARACTER_PART_TYPE_VALUES = Object.values(CHARACTER_PART_TYPE);
export const ORDER_STATUS_VALUES = Object.values(ORDER_STATUS);
export const PAYMENT_METHOD_VALUES = Object.values(PAYMENT_METHOD);
export const PAYMENT_STATUS_VALUES = Object.values(PAYMENT_STATUS);
export const SHIPPING_STATUS_VALUES = Object.values(SHIPPING_STATUS);
export const PAYMENT_TYPE_VALUES = Object.values(PAYMENT_TYPE);
export const VOUCHER_DISCOUNT_TYPE_VALUES = Object.values(VOUCHER_DISCOUNT_TYPE);
export const DEPOSIT_STATUS_VALUES = Object.values(DEPOSIT_STATUS);
export const INQUIRY_STATUS_VALUES = Object.values(INQUIRY_STATUS);

export type ProductStatus = (typeof PRODUCT_STATUS)[keyof typeof PRODUCT_STATUS];
export type ProductType = (typeof PRODUCT_TYPE)[keyof typeof PRODUCT_TYPE];
export type FrameOptionType = (typeof FRAME_OPTION_TYPE)[keyof typeof FRAME_OPTION_TYPE];
export type CharacterPartType = (typeof CHARACTER_PART_TYPE)[keyof typeof CHARACTER_PART_TYPE];
export type OrderStatus = (typeof ORDER_STATUS)[keyof typeof ORDER_STATUS];
export type PaymentMethod = (typeof PAYMENT_METHOD)[keyof typeof PAYMENT_METHOD];
export type PaymentStatus = (typeof PAYMENT_STATUS)[keyof typeof PAYMENT_STATUS];
export type ShippingStatus = (typeof SHIPPING_STATUS)[keyof typeof SHIPPING_STATUS];
export type PaymentType = (typeof PAYMENT_TYPE)[keyof typeof PAYMENT_TYPE];
export type VoucherDiscountType = (typeof VOUCHER_DISCOUNT_TYPE)[keyof typeof VOUCHER_DISCOUNT_TYPE];
export type DepositStatus = (typeof DEPOSIT_STATUS)[keyof typeof DEPOSIT_STATUS];
export type InquiryStatus = (typeof INQUIRY_STATUS)[keyof typeof INQUIRY_STATUS];
