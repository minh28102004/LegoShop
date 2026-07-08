import type {
  BusinessInquiryContract,
  CreateBusinessInquiryRequestContract,
  UpdateBusinessInquiryStatusRequestContract,
} from '@lego-shop/shared';
import type { ApiRequester } from '../client';

export function createInquiriesApi(request: ApiRequester) {
  return {
    createBusinessInquiry(payload: CreateBusinessInquiryRequestContract): Promise<BusinessInquiryContract> {
      return request('business-inquiries', {
        method: 'POST',
        body: payload,
      });
    },

    listAdminBusinessInquiries(): Promise<BusinessInquiryContract[]> {
      return request('admin/business-inquiries', {
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
      return request(`admin/business-inquiries/${encodeURIComponent(id)}/status`, {
        auth: true,
        method: 'PATCH',
        body: payload,
      });
    },
  };
}
