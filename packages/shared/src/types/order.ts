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
  designData: Nullable<JsonObject>;
  previewUrl: Nullable<URLString>;
  createdAt?: ISODateString;
};

export type Order = Timestamped & {
  id: ID;
  orderCode: string;
  customerName: string;
  phone: string;
  email: Nullable<string>;
  address: string;
  receiveDate: Nullable<ISODateString>;
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
  items: OrderItem[];
  payments?: Payment[];
};
