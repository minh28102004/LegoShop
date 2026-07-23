import type {
  BusinessQuoteRequestContract,
  BusinessQuoteResponseContract,
  BusinessInquiryContract,
  CreateBusinessInquiryRequestContract,
  CreateBusinessInquiryResponseContract,
  UpdateBusinessInquiryStatusRequestContract,
} from "@lego-shop/shared";
import type { ApiRequester } from "../client";

export function createInquiriesApi(request: ApiRequester) {
  return {
    quoteBusinessGift(
      payload: BusinessQuoteRequestContract,
    ): Promise<BusinessQuoteResponseContract> {
      return request("business-inquiries/quote", {
        method: "POST",
        body: payload,
      });
    },

    createBusinessInquiry(
      payload: CreateBusinessInquiryRequestContract,
    ): Promise<CreateBusinessInquiryResponseContract> {
      return request("business-inquiries", {
        method: "POST",
        body: payload,
      });
    },

    listAdminBusinessInquiries(): Promise<BusinessInquiryContract[]> {
      return request("admin/business-inquiries", {
        auth: true,
      });
    },

    getAdminBusinessInquiry(id: string): Promise<BusinessInquiryContract> {
      return request(`admin/business-inquiries/${encodeURIComponent(id)}`, {
        auth: true,
      });
    },

    updateAdminBusinessInquiryStatus(
      id: string,
      payload: UpdateBusinessInquiryStatusRequestContract,
    ): Promise<BusinessInquiryContract> {
      return request(
        `admin/business-inquiries/${encodeURIComponent(id)}/status`,
        {
          auth: true,
          method: "PATCH",
          body: payload,
        },
      );
    },
  };
}
