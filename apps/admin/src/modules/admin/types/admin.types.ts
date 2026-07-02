import type {
  Accessory as SharedAccessory,
  AccessoryCategory as SharedAccessoryCategory,
  AdminProfile as SharedAdminProfile,
  Banner as SharedBanner,
  BusinessInquiry as SharedBusinessInquiry,
  Character as SharedCharacter,
  Collection as SharedCollection,
  FrameBackground as SharedFrameBackground,
  FrameColor as SharedFrameColor,
  FrameOption as SharedFrameOption,
  FrameOptionType,
  FrameSize as SharedFrameSize,
  InquiryStatus,
  Order as SharedOrder,
  OrderItem as SharedOrderItem,
  OrderStatus,
  PaginatedResponse,
  PaymentSettings as SharedPaymentSettings,
  PaymentStatus,
  Product as SharedProduct,
  ProductStatus,
  ShippingStatus,
  Template as SharedTemplate,
  TemplateCategory as SharedTemplateCategory,
  Voucher as SharedVoucher,
  VoucherDiscountType,
} from '@lego-shop/shared';

export type {
  FrameOptionType,
  InquiryStatus,
  OrderStatus,
  PaymentStatus,
  ProductStatus,
  ShippingStatus,
  VoucherDiscountType,
};

export type AdminProfile = SharedAdminProfile;
export type Product = SharedProduct;
export type TemplateCategory = SharedTemplateCategory;
export type AccessoryCategory = SharedAccessoryCategory;
export type Template = SharedTemplate;
export type FrameOption = SharedFrameOption;
export type FrameSize = SharedFrameSize;
export type FrameColor = SharedFrameColor;
export type Accessory = SharedAccessory;
export type Character = SharedCharacter;
export type Banner = SharedBanner;
export type FrameBackground = SharedFrameBackground;
export type Collection = SharedCollection;
export type OrderItem = SharedOrderItem;
export type PaymentSettings = SharedPaymentSettings;
export type BusinessInquiry = SharedBusinessInquiry & { status: InquiryStatus };
export type Voucher = SharedVoucher;

export interface PaymentLog {
  id: string;
  provider: string;
  type: string;
  amount: number;
  status: string;
  checkoutUrl?: string | null;
  paidAt?: string | null;
}

export type Order = Omit<SharedOrder, 'payments'> & {
  payments?: PaymentLog[];
};

export type PaginatedOrders = PaginatedResponse<Order> & {
  summary?: {
    total_amount?: number;
    average_order_value?: number;
  };
};

export type PaginatedResourceResponse<T> = PaginatedResponse<T>;

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  paidOrders: number;
  processingOrders: number;
  recentOrders: Array<{
    id: string;
    orderCode: string;
    customerName: string;
    totalAmount: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
  }>;
  topProducts: Array<{
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}
