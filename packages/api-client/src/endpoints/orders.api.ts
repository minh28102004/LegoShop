import type {
  CreateOrderRequestContract,
  CreateOrderResponseContract,
  CreatePaymentLinkResponseContract,
  TrackOrderResponseContract,
} from '@lego-shop/shared';
import type { ApiRequester } from '../client';

export function createOrdersApi(request: ApiRequester) {
  return {
    createOrder(payload: CreateOrderRequestContract): Promise<CreateOrderResponseContract> {
      return request('orders', {
        method: 'POST',
        body: payload,
      });
    },

    trackOrder(orderCode: string): Promise<TrackOrderResponseContract> {
      return request(`orders/track/${encodeURIComponent(orderCode)}`);
    },

    createPaymentLink(orderCode: string): Promise<CreatePaymentLinkResponseContract> {
      return request(`orders/${encodeURIComponent(orderCode)}/create-payment-link`, {
        method: 'POST',
      });
    },
  };
}
