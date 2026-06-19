import type { Banner, PaymentSettingsContract } from '@lego-shop/shared';
import type { ApiRequester, QueryParams } from '../client';

export function createPublicApi(request: ApiRequester) {
  return {
    listBanners(query?: QueryParams): Promise<Banner[]> {
      return request('public/banners', { query });
    },

    getPaymentSettings(): Promise<PaymentSettingsContract> {
      return request('public/payment-settings');
    },
  };
}
