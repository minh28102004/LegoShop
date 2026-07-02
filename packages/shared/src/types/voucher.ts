import type { ProductStatus, VoucherDiscountType } from "../constants/status";
import type {
  ID,
  ISODateString,
  Nullable,
  PriceInVND,
  Timestamped,
} from "./common";

export type Voucher = Timestamped & {
  id: ID;
  code: string;
  description: Nullable<string>;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderAmount: PriceInVND;
  maxDiscountAmount: Nullable<PriceInVND>;
  usageLimit: Nullable<number>;
  usedCount: number;
  startsAt: Nullable<ISODateString>;
  expiresAt: Nullable<ISODateString>;
  status: ProductStatus;
};
