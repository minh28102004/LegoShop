import type {
  DepositStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  ShippingStatus,
} from '../constants/status';
import type { ID, ISODateString, JsonObject, Nullable, PriceInVND, Timestamped, URLString } from './common';
import type { Payment } from './payment';

export type OrderItem = {
  id: ID;
  orderId?: ID;
  productId: Nullable<ID>;
  productName: string;
  quantity: number;
  price: PriceInVND;
  note: Nullable<string>;
  frameOptionId?: Nullable<ID>;
  backgroundId?: Nullable<ID>;
  frameSizeId: Nullable<ID>;
  frameSizeLabel: Nullable<string>;
  frameColorName: Nullable<string>;
  accessories: Nullable<Array<{ id: ID; name: string; price: PriceInVND; quantity?: number }>>;
  designData: Nullable<JsonObject>;
  previewUrl: Nullable<URLString>;
  createdAt?: ISODateString;
};

export type OrderStatusHistoryType =
  | 'ORDER_STATUS'
  | 'PAYMENT_STATUS'
  | 'SHIPPING_STATUS'
  | 'NOTE';

export type OrderStatusHistory = {
  id: ID;
  orderId: ID;
  type: OrderStatusHistoryType;
  fromValue: Nullable<string>;
  toValue: Nullable<string>;
  note: Nullable<string>;
  changedByAdminId: Nullable<ID>;
  changedByAdmin?: Nullable<{
    id: ID;
    email: string;
    name: Nullable<string>;
  }>;
  createdAt: ISODateString;
};

export type Order = Timestamped & {
  id: ID;
  orderCode: string;
  customerName: string;
  phone: string;
  email: Nullable<string>;
  zalo?: Nullable<string>;
  address: string;
  addressLine?: Nullable<string>;
  province: Nullable<string>;
  district: Nullable<string>;
  ward: Nullable<string>;
  receiveDate: Nullable<ISODateString>;
  note: Nullable<string>;
  shippingMethod: Nullable<string>;
  shippingFee: PriceInVND;
  voucherCode: Nullable<string>;
  voucherDiscountType: Nullable<string>;
  voucherDiscountValue: Nullable<number>;
  discountAmount: PriceInVND;
  giftPackage: boolean;
  giftFee: PriceInVND;
  polaroidOption: string;
  polaroidFee: PriceInVND;
  itemsAmount: PriceInVND;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingStatus: ShippingStatus;
  totalAmount: PriceInVND;
  depositRequired: boolean;
  depositPercent: number;
  depositAmount: PriceInVND;
  remainingAmount: PriceInVND;
  depositStatus: DepositStatus | string;
  depositPaidAt: Nullable<ISODateString>;
  paymentProvider?: Nullable<string>;
  payosOrderCode?: Nullable<string | number>;
  payosPaymentLinkId?: Nullable<string>;
  payosCheckoutUrl?: Nullable<URLString>;
  paidAt?: Nullable<ISODateString>;
  cancelledAt?: Nullable<ISODateString>;
  expiresAt?: Nullable<ISODateString>;
  cancelReason?: Nullable<string>;
  items: OrderItem[];
  payments?: Payment[];
  statusHistories?: OrderStatusHistory[];
};
