import type { PaymentSettingsContract, UpdatePaymentSettingsRequestContract } from '@lego-shop/shared';
import type { ApiRequester } from '../client';

export function createPaymentsApi(request: ApiRequester) {
  return {
    getPublicPaymentSettings(): Promise<PaymentSettingsContract> {
      return request('public/payment-settings');
    },

    getAdminPaymentSettings(): Promise<PaymentSettingsContract> {
      return request('admin/payment-settings', {
        auth: true,
      });
    },

    updateAdminPaymentSettings(payload: UpdatePaymentSettingsRequestContract): Promise<PaymentSettingsContract> {
      return request('admin/payment-settings', {
        auth: true,
        method: 'PATCH',
        body: payload,
      });
    },
  };
}
