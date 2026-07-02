import type { ProductStatus, VoucherDiscountType } from "../constants/status";
import type { ID, ISODateString, PriceInVND } from "../types/common";
import type { Voucher } from "../types/voucher";

export type VoucherContract = Voucher;

export type CreateVoucherRequestContract = {
  code: string;
  description?: string;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderAmount?: PriceInVND;
  maxDiscountAmount?: PriceInVND | null;
  usageLimit?: number | null;
  startsAt?: ISODateString | null;
  expiresAt?: ISODateString | null;
  status?: ProductStatus;
};

export type UpdateVoucherRequestContract =
  Partial<CreateVoucherRequestContract>;

export type ApplyVoucherRequestContract = {
  code: string;
  orderAmount: PriceInVND;
};

export type ApplyVoucherResponseContract = {
  id: ID;
  code: string;
  description?: string | null;
  discountType: VoucherDiscountType;
  discountValue: number;
  minOrderAmount: PriceInVND;
  maxDiscountAmount?: PriceInVND | null;
  discountAmount: PriceInVND;
  orderAmount: PriceInVND;
  finalAmount: PriceInVND;
};
