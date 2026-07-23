import type {
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingStatus,
} from "../constants/status";
import type {
  ID,
  ISODateString,
  JsonObject,
  PriceInVND,
  URLString,
} from "../types/common";
import type { Order } from "../types/order";

export type CreateOrderItemRequest = {
  productId?: ID;
  productName: string;
  quantity: number;
  price: PriceInVND;
  frameOptionId?: ID;
  backgroundId?: ID;
  frameSizeId?: ID;
  frameSizeLabel?: string;
  frameColorName?: string;
  accessories?: Array<{
    id: ID;
    name?: string;
    price?: PriceInVND;
    quantity?: number;
  }>;
  note?: string;
  designData?: JsonObject;
  previewUrl?: URLString;
};

export type CreateOrderRequest = {
  checkoutAttemptId: ID;
  customerName: string;
  customerPhone?: string;
  customerEmail?: string;
  customerZalo?: string;
  phone: string;
  email?: string;
  city?: string;
  addressLine?: string;
  address: string;
  province?: string;
  district?: string;
  ward?: string;
  receiveDate?: ISODateString;
  note?: string;
  shippingMethod?: "shop_support" | "self" | "standard" | "fast";
  voucherCode?: string;
  giftPackage?: boolean;
  polaroidOption?: "none" | "2" | "4";
  paymentMethod: PaymentMethod;
  items: CreateOrderItemRequest[];
};

export type CreateOrderResponse = {
  orderId: ID;
  orderCode: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus | string;
  itemsAmount: PriceInVND;
  shippingMethod?: string;
  shippingFee: PriceInVND;
  voucherCode?: string | null;
  voucherDiscountType?: string | null;
  voucherDiscountValue?: number | null;
  discountAmount: PriceInVND;
  giftPackage: boolean;
  giftFee: PriceInVND;
  polaroidOption: string;
  polaroidFee: PriceInVND;
  totalAmount: PriceInVND;
  depositRequired: boolean;
  depositPercent: number;
  depositAmount: PriceInVND;
  remainingAmount: PriceInVND;
  depositStatus: string;
  amountToPay: PriceInVND;
  paymentUrl?: URLString;
  checkoutUrl?: URLString;
  tracking?: TrackOrderResponseContract;
};

export type TrackOrderRequestContract = {
  orderCode: string;
  phone: string;
};

export type TrackOrderItemSummaryContract = {
  productName: string;
  quantity: number;
  price: PriceInVND;
  note?: string | null;
  frameSizeLabel?: string | null;
  frameColorName?: string | null;
  accessories?: Array<{ id: ID; name: string; quantity?: number }>;
  designData?: JsonObject | null;
  previewUrl?: URLString | null;
};

export type TrackOrderStatusHistoryContract = {
  type: string;
  fromValue?: string | null;
  toValue?: string | null;
  note?: string | null;
  createdAt: ISODateString;
};

export type TrackOrderResponseContract = {
  orderCode: string;
  customerName?: string | null;
  orderStatus: OrderStatus;
  paymentStatus: PaymentStatus | string;
  shippingStatus: ShippingStatus;
  paymentMethod: PaymentMethod;
  shippingMethod?: string | null;
  items: TrackOrderItemSummaryContract[];
  itemsAmount: PriceInVND;
  discountAmount: PriceInVND;
  voucherCode?: string | null;
  totalAmount: PriceInVND;
  paidAmount: PriceInVND;
  depositRequired: boolean;
  depositPercent: number;
  depositAmount: PriceInVND;
  remainingAmount: PriceInVND;
  createdAt: ISODateString;
  updatedAt?: ISODateString;
  expiresAt?: ISODateString | null;
  receiveDate?: ISODateString | null;
  estimatedDelivery?: ISODateString | null;
  trackingCode?: string | null;
  shippingProvider?: string | null;
  notes?: string | null;
  statusHistory?: TrackOrderStatusHistoryContract[];
  maskedPhone?: string | null;
  maskedEmail?: string | null;
  maskedAddress?: string | null;
  checkoutUrl?: URLString | null;
};

export type CreateOrderItemRequestContract = CreateOrderItemRequest;
export type CreateOrderRequestContract = CreateOrderRequest;
export type CreateOrderResponseContract = CreateOrderResponse;
export type TrackOrderLegacyResponseContract = Omit<Order, "id">;

export type UpdateOrderStatusRequestContract = {
  status: OrderStatus;
};

export type UpdateShippingStatusRequestContract = {
  status: ShippingStatus;
};
