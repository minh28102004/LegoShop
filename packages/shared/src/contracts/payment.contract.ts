import type { PaymentMethod, PaymentStatus } from '../constants/status';
import type { ID, PriceInVND, URLString } from '../types/common';
import type { Payment, PaymentSettings } from '../types/payment';

export type PaymentContract = Payment;
export type PaymentSettingsContract = PaymentSettings;

export type UpdatePaymentSettingsRequestContract = Partial<
  Pick<
    PaymentSettings,
    'codEnabled' | 'payosEnabled' | 'codDepositEnabled' | 'codDepositPercent'
  >
>;

export type CreatePaymentLinkResponseContract = {
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

export type UpdatePaymentStatusRequestContract = {
  status: PaymentStatus;
};
