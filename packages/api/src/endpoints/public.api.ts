import type {
  ApplyVoucherRequestContract,
  ApplyVoucherResponseContract,
  Banner,
  CartQuoteRequestContract,
  CartQuoteResponseContract,
  CheckoutSettingsContract,
  HomepageMedia,
  PaymentSettingsContract,
} from "@lego-shop/shared";
import type { ApiRequester, QueryParams } from "../client";

export function createPublicApi(request: ApiRequester) {
  return {
    listBanners(query?: QueryParams): Promise<Banner[]> {
      return request("public/banners", { query });
    },

    listHomepageMedia(): Promise<HomepageMedia[]> {
      return request("public/homepage-media");
    },

    getPaymentSettings(): Promise<PaymentSettingsContract> {
      return request("public/payment-settings");
    },

    applyVoucher(
      payload: ApplyVoucherRequestContract,
    ): Promise<ApplyVoucherResponseContract> {
      return request("public/vouchers/apply", {
        method: "POST",
        body: payload,
      });
    },

    quoteCart(
      payload: CartQuoteRequestContract,
    ): Promise<CartQuoteResponseContract> {
      return request("public/cart/quote", {
        method: "POST",
        body: payload,
      });
    },

    getCheckoutSettings(): Promise<CheckoutSettingsContract> {
      return request("public/checkout/settings");
    },
  };
}
