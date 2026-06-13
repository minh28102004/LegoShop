import { apiRequest, toQueryString } from '@/lib/api';
import type {
  Accessory,
  AccessoryCategory,
  AdminProfile,
  Banner,
  BusinessInquiry,
  Collection,
  DashboardStats,
  Order,
  OrderStatus,
  PaginatedOrders,
  PaymentSettings,
  PaymentStatus,
  Product,
  ShippingStatus,
  Template,
  TemplateCategory,
} from '@/modules/admin/types/admin.types';

export type ResourceKey =
  | 'products'
  | 'templates'
  | 'template-categories'
  | 'accessories'
  | 'accessory-categories'
  | 'banners'
  | 'collections'
  | 'frame-sizes'
  | 'frame-colors';

const ADMIN_RESOURCE_ENDPOINTS: Record<ResourceKey, string> = {
  products: 'admin/products',
  templates: 'admin/templates',
  'template-categories': 'admin/template-categories',
  accessories: 'admin/accessories',
  'accessory-categories': 'admin/accessory-categories',
  banners: 'admin/banners',
  collections: 'admin/collections',
  'frame-sizes': 'admin/frame-sizes',
  'frame-colors': 'admin/frame-colors',
};

export type ResourceDataMap = {
  products: Product;
  templates: Template;
  'template-categories': TemplateCategory;
  accessories: Accessory;
  'accessory-categories': AccessoryCategory;
  banners: Banner;
  collections: Collection;
  'frame-sizes': any;
  'frame-colors': any;
};

export async function me() {
  return apiRequest<AdminProfile>('auth/me');
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<{ url: string; fileName: string; originalName: string }>('uploads/image', {
    method: 'POST',
    body: formData,
  });
}

export async function listResource<K extends ResourceKey>(key: K) {
  return apiRequest<ResourceDataMap[K][]>(ADMIN_RESOURCE_ENDPOINTS[key]);
}

export async function getResourceById<K extends ResourceKey>(key: K, id: string) {
  return apiRequest<ResourceDataMap[K]>(`${ADMIN_RESOURCE_ENDPOINTS[key]}/${id}`);
}

export async function createResource<K extends ResourceKey>(
  key: K,
  payload: Partial<ResourceDataMap[K]>,
) {
  return apiRequest<ResourceDataMap[K]>(ADMIN_RESOURCE_ENDPOINTS[key], {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export async function updateResource<K extends ResourceKey>(
  key: K,
  id: string,
  payload: Partial<ResourceDataMap[K]>,
) {
  return apiRequest<ResourceDataMap[K]>(`${ADMIN_RESOURCE_ENDPOINTS[key]}/${id}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function deleteResource(key: ResourceKey, id: string) {
  return apiRequest<{ success: boolean; message: string }>(
    `${ADMIN_RESOURCE_ENDPOINTS[key]}/${id}`,
    {
      method: 'DELETE',
    },
  );
}

export async function listOrders(params: {
  search?: string;
  orderStatus?: OrderStatus | '';
  paymentStatus?: PaymentStatus | '';
  shippingStatus?: ShippingStatus | '';
  page?: number;
  limit?: number;
}) {
  const query = toQueryString({
    search: params.search,
    orderStatus: params.orderStatus,
    paymentStatus: params.paymentStatus,
    shippingStatus: params.shippingStatus,
    page: params.page,
    limit: params.limit,
  });

  return apiRequest<PaginatedOrders>(`admin/orders${query}`);
}

export async function getOrderById(id: string) {
  return apiRequest<Order>(`admin/orders/${id}`);
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return apiRequest<Order>(`admin/orders/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function updateOrderPaymentStatus(id: string, status: PaymentStatus) {
  return apiRequest<Order>(`admin/orders/${id}/payment-status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function updateOrderShippingStatus(id: string, status: ShippingStatus) {
  return apiRequest<Order>(`admin/orders/${id}/shipping-status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function listBusinessInquiries() {
  return apiRequest<BusinessInquiry[]>('admin/business-inquiries');
}

export async function getBusinessInquiryById(id: string) {
  return apiRequest<BusinessInquiry>(`admin/business-inquiries/${id}`);
}

export async function updateBusinessInquiryStatus(id: string, status: string) {
  return apiRequest<BusinessInquiry>(`admin/business-inquiries/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function getPaymentSettings() {
  return apiRequest<PaymentSettings>('admin/payment-settings');
}

export async function updatePaymentSettings(payload: Partial<PaymentSettings>) {
  return apiRequest<PaymentSettings>('admin/payment-settings', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  });
}

export async function getDashboardStats() {
  return apiRequest<DashboardStats>('admin-dashboard/stats');
}

