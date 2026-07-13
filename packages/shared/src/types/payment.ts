import type { PaymentStatus, PaymentType } from '../constants/status';
import type { ID, ISODateString, JsonObject, Nullable, PriceInVND, Timestamped, URLString } from './common';

export type Payment = Timestamped & {
  id: ID;
  orderId: ID;
  provider: string;
  type: PaymentType;
  providerOrderCode: Nullable<string | number>;
  providerPaymentLinkId: Nullable<string>;
  amount: PriceInVND;
  status: PaymentStatus | string;
  checkoutUrl: Nullable<URLString>;
  rawResponse?: Nullable<JsonObject>;
  rawWebhook?: Nullable<JsonObject>;
  paidAt: Nullable<ISODateString>;
};

export type PaymentSettings = Timestamped & {
  id: ID;
  codEnabled: boolean;
  payosEnabled: boolean;
  codDepositEnabled: boolean;
  codDepositPercent: number;
};
