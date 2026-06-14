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
  PaginatedResourceResponse,
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

export type ResourceListParams = {
  page?: number;
  limit?: number;
  search?: string;
  search_fields?: string;
  sort_by?: string;
  sort_dir?: string;
  status?: string | string[];
  category_id?: string | string[];
  price_min?: number;
  price_max?: number;
  preset?: string;
  date_from?: string;
  date_to?: string;
  date_field?: string;
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

export async function listResource<K extends ResourceKey>(
  key: K,
): Promise<ResourceDataMap[K][]>;
export async function listResource<K extends ResourceKey>(
  key: K,
  params: ResourceListParams,
): Promise<PaginatedResourceResponse<ResourceDataMap[K]>>;
export async function listResource<K extends ResourceKey>(
  key: K,
  params?: ResourceListParams,
) {
  const query = params ? toQueryString(params) : '';
  return apiRequest<ResourceDataMap[K][] | PaginatedResourceResponse<ResourceDataMap[K]>>(
    `${ADMIN_RESOURCE_ENDPOINTS[key]}${query}`,
  );
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
  search_fields?: string;
  orderStatus?: OrderStatus | OrderStatus[] | '';
  paymentStatus?: PaymentStatus | PaymentStatus[] | '';
  shippingStatus?: ShippingStatus | ShippingStatus[] | '';
  paymentMethod?: 'COD' | 'PAYOS' | '';
  sort_by?: string;
  sort_dir?: string;
  amount_min?: number;
  amount_max?: number;
  preset?: string;
  date_from?: string;
  date_to?: string;
  date_field?: string;
  page?: number;
  limit?: number;
}) {
  const serializeListParam = (value?: string | string[] | '') => {
    if (Array.isArray(value)) return value.length > 0 ? value.join(',') : undefined;
    return value || undefined;
  };

  const query = toQueryString({
    search: params.search,
    search_fields: params.search_fields,
    orderStatus: serializeListParam(params.orderStatus),
    paymentStatus: serializeListParam(params.paymentStatus),
    shippingStatus: serializeListParam(params.shippingStatus),
    paymentMethod: params.paymentMethod,
    sort_by: params.sort_by,
    sort_dir: params.sort_dir,
    amount_min: params.amount_min,
    amount_max: params.amount_max,
    preset: params.preset,
    date_from: params.date_from,
    date_to: params.date_to,
    date_field: params.date_field,
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

export async function listBusinessInquiries(): Promise<BusinessInquiry[]>;
export async function listBusinessInquiries(
  params: ResourceListParams,
): Promise<PaginatedResourceResponse<BusinessInquiry>>;
export async function listBusinessInquiries(params?: ResourceListParams) {
  const query = params ? toQueryString(params) : '';
  return apiRequest<BusinessInquiry[] | PaginatedResourceResponse<BusinessInquiry>>(
    `admin/business-inquiries${query}`,
  );
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

