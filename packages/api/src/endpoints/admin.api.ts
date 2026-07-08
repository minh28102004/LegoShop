import type {
  Accessory,
  AccessoryCategory,
  Banner,
  BusinessInquiryContract,
  Character,
  Collection,
  CreateAccessoryRequestContract,
  CreateBannerRequestContract,
  CreateCategoryRequestContract,
  CreateCharacterRequestContract,
  CreateCollectionRequestContract,
  CreateFrameBackgroundRequestContract,
  CreateFrameColorRequestContract,
  CreateFrameOptionRequestContract,
  CreateFrameSizeRequestContract,
  CreateProductRequestContract,
  CreateTemplateRequestContract,
  CreateVoucherRequestContract,
  FrameBackground,
  FrameColor,
  FrameOption,
  FrameSize,
  Order,
  PaginatedResponse,
  PaymentSettingsContract,
  Product,
  Template,
  TemplateCategory,
  UpdateAccessoryRequestContract,
  UpdateBannerRequestContract,
  UpdateBusinessInquiryStatusRequestContract,
  UpdateCategoryRequestContract,
  UpdateCharacterRequestContract,
  UpdateCollectionRequestContract,
  UpdateFrameBackgroundRequestContract,
  UpdateFrameColorRequestContract,
  UpdateFrameOptionRequestContract,
  UpdateFrameSizeRequestContract,
  UpdateOrderStatusRequestContract,
  UpdatePaymentSettingsRequestContract,
  UpdatePaymentStatusRequestContract,
  UpdateProductRequestContract,
  UpdateShippingStatusRequestContract,
  UpdateTemplateRequestContract,
  UpdateVoucherRequestContract,
  Voucher,
} from '@lego-shop/shared';
import type { ApiRequester, QueryParams } from '../client';

export const ADMIN_RESOURCE_PATHS = {
  products: 'admin/products',
  templates: 'admin/templates',
  'frame-options': 'admin/frame-options',
  'template-categories': 'admin/template-categories',
  accessories: 'admin/accessories',
  characters: 'admin/characters',
  'accessory-categories': 'admin/accessory-categories',
  banners: 'admin/banners',
  'frame-backgrounds': 'admin/frame-backgrounds',
  collections: 'admin/collections',
  'frame-sizes': 'admin/frame-sizes',
  'frame-colors': 'admin/frame-colors',
  vouchers: 'admin/vouchers',
} as const;

export type AdminResourceKey = keyof typeof ADMIN_RESOURCE_PATHS;

export type AdminResourceMap = {
  products: Product;
  templates: Template;
  'frame-options': FrameOption;
  'template-categories': TemplateCategory;
  accessories: Accessory;
  characters: Character;
  'accessory-categories': AccessoryCategory;
  banners: Banner;
  'frame-backgrounds': FrameBackground;
  collections: Collection;
  'frame-sizes': FrameSize;
  'frame-colors': FrameColor;
  vouchers: Voucher;
};

export type AdminCreateResourcePayloadMap = {
  products: CreateProductRequestContract;
  templates: CreateTemplateRequestContract;
  'frame-options': CreateFrameOptionRequestContract;
  'template-categories': CreateCategoryRequestContract;
  accessories: CreateAccessoryRequestContract;
  characters: CreateCharacterRequestContract;
  'accessory-categories': CreateCategoryRequestContract;
  banners: CreateBannerRequestContract;
  'frame-backgrounds': CreateFrameBackgroundRequestContract;
  collections: CreateCollectionRequestContract;
  'frame-sizes': CreateFrameSizeRequestContract;
  'frame-colors': CreateFrameColorRequestContract;
  vouchers: CreateVoucherRequestContract;
};

export type AdminUpdateResourcePayloadMap = {
  products: UpdateProductRequestContract;
  templates: UpdateTemplateRequestContract;
  'frame-options': UpdateFrameOptionRequestContract;
  'template-categories': UpdateCategoryRequestContract;
  accessories: UpdateAccessoryRequestContract;
  characters: UpdateCharacterRequestContract;
  'accessory-categories': UpdateCategoryRequestContract;
  banners: UpdateBannerRequestContract;
  'frame-backgrounds': UpdateFrameBackgroundRequestContract;
  collections: UpdateCollectionRequestContract;
  'frame-sizes': UpdateFrameSizeRequestContract;
  'frame-colors': UpdateFrameColorRequestContract;
  vouchers: UpdateVoucherRequestContract;
};

export type AdminListResourceResponse<TResource> = TResource[] | PaginatedResponse<TResource>;

export type AdminDashboardStats = {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  paidOrders: number;
  processingOrders: number;
  recentOrders: Array<
    Pick<Order, 'id' | 'orderCode' | 'customerName' | 'totalAmount' | 'orderStatus' | 'paymentStatus' | 'createdAt'>
  >;
  topProducts: Array<{
    productName: string;
    quantity: number;
    revenue: number;
  }>;
};

export function createAdminApi(request: ApiRequester) {
  return {
    listResource<TKey extends AdminResourceKey>(
      key: TKey,
      query?: QueryParams,
    ): Promise<AdminListResourceResponse<AdminResourceMap[TKey]>> {
      return request(ADMIN_RESOURCE_PATHS[key], {
        auth: true,
        query,
      });
    },

    getResource<TKey extends AdminResourceKey>(key: TKey, id: string): Promise<AdminResourceMap[TKey]> {
      return request(`${ADMIN_RESOURCE_PATHS[key]}/${encodeURIComponent(id)}`, {
        auth: true,
      });
    },

    createResource<TKey extends AdminResourceKey>(
      key: TKey,
      payload: AdminCreateResourcePayloadMap[TKey],
    ): Promise<AdminResourceMap[TKey]> {
      return request(ADMIN_RESOURCE_PATHS[key], {
        auth: true,
        method: 'POST',
        body: payload,
      });
    },

    updateResource<TKey extends AdminResourceKey>(
      key: TKey,
      id: string,
      payload: AdminUpdateResourcePayloadMap[TKey],
    ): Promise<AdminResourceMap[TKey]> {
      return request(`${ADMIN_RESOURCE_PATHS[key]}/${encodeURIComponent(id)}`, {
        auth: true,
        method: 'PATCH',
        body: payload,
      });
    },

    deleteResource(key: AdminResourceKey, id: string): Promise<unknown> {
      return request(`${ADMIN_RESOURCE_PATHS[key]}/${encodeURIComponent(id)}`, {
        auth: true,
        method: 'DELETE',
      });
    },

    listOrders(query?: QueryParams): Promise<AdminListResourceResponse<Order>> {
      return request('admin/orders', {
        auth: true,
        query,
      });
    },

    getOrder(id: string): Promise<Order> {
      return request(`admin/orders/${encodeURIComponent(id)}`, {
        auth: true,
      });
    },

    updateOrderStatus(id: string, payload: UpdateOrderStatusRequestContract): Promise<Order> {
      return request(`admin/orders/${encodeURIComponent(id)}/status`, {
        auth: true,
        method: 'PATCH',
        body: payload,
      });
    },

    updateOrderPaymentStatus(id: string, payload: UpdatePaymentStatusRequestContract): Promise<Order> {
      return request(`admin/orders/${encodeURIComponent(id)}/payment-status`, {
        auth: true,
        method: 'PATCH',
        body: payload,
      });
    },

    updateOrderShippingStatus(id: string, payload: UpdateShippingStatusRequestContract): Promise<Order> {
      return request(`admin/orders/${encodeURIComponent(id)}/shipping-status`, {
        auth: true,
        method: 'PATCH',
        body: payload,
      });
    },

    listBusinessInquiries(query?: QueryParams): Promise<AdminListResourceResponse<BusinessInquiryContract>> {
      return request('admin/business-inquiries', {
        auth: true,
        query,
      });
    },

    getBusinessInquiry(id: string): Promise<BusinessInquiryContract> {
      return request(`admin/business-inquiries/${encodeURIComponent(id)}`, {
        auth: true,
      });
    },

    updateBusinessInquiryStatus(
      id: string,
      payload: UpdateBusinessInquiryStatusRequestContract,
    ): Promise<BusinessInquiryContract> {
      return request(`admin/business-inquiries/${encodeURIComponent(id)}/status`, {
        auth: true,
        method: 'PATCH',
        body: payload,
      });
    },

    getPaymentSettings(): Promise<PaymentSettingsContract> {
      return request('admin/payment-settings', {
        auth: true,
      });
    },

    updatePaymentSettings(payload: UpdatePaymentSettingsRequestContract): Promise<PaymentSettingsContract> {
      return request('admin/payment-settings', {
        auth: true,
        method: 'PATCH',
        body: payload,
      });
    },

    getDashboardStats(): Promise<AdminDashboardStats> {
      return request('admin-dashboard/stats', {
        auth: true,
      });
    },
  };
}
