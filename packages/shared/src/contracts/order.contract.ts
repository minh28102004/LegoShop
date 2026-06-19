import type { OrderStatus, PaymentMethod, PaymentStatus, ShippingStatus } from '../constants/status';
import type { ID, ISODateString, JsonObject, PriceInVND, URLString } from '../types/common';
import type { Order } from '../types/order';

export type CreateOrderItemRequest = {
  productId?: ID;
  productName: string;
  quantity: number;
  price: PriceInVND;
  designData?: JsonObject;
  previewUrl?: URLString;
};

export type CreateOrderRequest = {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  receiveDate?: ISODateString;
  paymentMethod: PaymentMethod;
  items: CreateOrderItemRequest[];
};

export type CreateOrderResponse = {
  orderId: ID;
  orderCode: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus | string;
  totalAmount: PriceInVND;
  depositRequired: boolean;
  depositPercent: number;
  depositAmount: PriceInVND;
  remainingAmount: PriceInVND;
  depositStatus: string;
  checkoutUrl?: URLString;
};

export type CreateOrderItemRequestContract = CreateOrderItemRequest;
export type CreateOrderRequestContract = CreateOrderRequest;
export type CreateOrderResponseContract = CreateOrderResponse;
export type TrackOrderResponseContract = Omit<Order, 'id'>;

export type UpdateOrderStatusRequestContract = {
  status: OrderStatus;
};

export type UpdateShippingStatusRequestContract = {
  status: ShippingStatus;
};
