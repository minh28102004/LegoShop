import {
  ADMIN_RESOURCE_PATHS,
  ApiClientError,
  type AdminCreateResourcePayloadMap,
  type AdminUpdateResourcePayloadMap,
  type QueryParams,
} from '@lego-shop/api-client';
import { apiRequest } from '@/lib/api';
import { adminApiClient } from '@/lib/api/admin-client';
import { clearAccessToken } from '@/modules/auth/services/authStorage';
import type {
  Accessory,
  AccessoryCategory,
  AdminProfile,
  Banner,
  BusinessInquiry,
  Character,
  CharacterPart,
  CharacterPreset,
  Collection,
  DashboardStats,
  FrameBackground,
  FrameColor,
  FrameOption,
  FrameSize,
  InquiryStatus,
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
  Voucher,
} from '@/modules/admin/types/admin.types';

export type ResourceKey =
  | 'products'
  | 'templates'
  | 'frame-options'
  | 'template-categories'
  | 'accessories'
  | 'characters'
  | 'character-parts'
  | 'character-presets'
  | 'accessory-categories'
  | 'banners'
  | 'frame-backgrounds'
  | 'collections'
  | 'frame-sizes'
  | 'frame-colors'
  | 'vouchers';

const ADMIN_RESOURCE_ENDPOINTS: Record<ResourceKey, string> = {
  products: ADMIN_RESOURCE_PATHS.products,
  templates: ADMIN_RESOURCE_PATHS.templates,
  'frame-options': ADMIN_RESOURCE_PATHS['frame-options'],
  'template-categories': ADMIN_RESOURCE_PATHS['template-categories'],
  accessories: ADMIN_RESOURCE_PATHS.accessories,
  characters: ADMIN_RESOURCE_PATHS.characters,
  'character-parts': ADMIN_RESOURCE_PATHS['character-parts'],
  'character-presets': ADMIN_RESOURCE_PATHS['character-presets'],
  'accessory-categories': ADMIN_RESOURCE_PATHS['accessory-categories'],
  banners: ADMIN_RESOURCE_PATHS.banners,
  'frame-backgrounds': ADMIN_RESOURCE_PATHS['frame-backgrounds'],
  collections: ADMIN_RESOURCE_PATHS.collections,
  'frame-sizes': ADMIN_RESOURCE_PATHS['frame-sizes'],
  'frame-colors': ADMIN_RESOURCE_PATHS['frame-colors'],
  vouchers: ADMIN_RESOURCE_PATHS.vouchers,
};

export type ResourceDataMap = {
  products: Product;
  templates: Template;
  'frame-options': FrameOption;
  'template-categories': TemplateCategory;
  accessories: Accessory;
  characters: Character;
  'character-parts': CharacterPart;
  'character-presets': CharacterPreset;
  'accessory-categories': AccessoryCategory;
  banners: Banner;
  'frame-backgrounds': FrameBackground;
  collections: Collection;
  'frame-sizes': FrameSize;
  'frame-colors': FrameColor;
  vouchers: Voucher;
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
  type?: string | string[];
  price_min?: number;
  price_max?: number;
  preset?: string;
  date_from?: string;
  date_to?: string;
  date_field?: string;
};

function toQueryParams(params?: ResourceListParams): QueryParams | undefined {
  if (!params) return undefined;

  const query: QueryParams = {};
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === '') return;
    query[key] = Array.isArray(value) ? value.join(',') : value;
  });
  return query;
}

function serializeListParam(value?: string | string[] | '') {
  if (Array.isArray(value)) return value.length > 0 ? value.join(',') : undefined;
  return value || undefined;
}

async function withAdminAuth<T>(request: Promise<T>): Promise<T> {
  try {
    return await request;
  } catch (error) {
    if (error instanceof ApiClientError && error.status === 401) {
      clearAccessToken();
    }
    throw error;
  }
}

export async function me() {
  return withAdminAuth(adminApiClient.auth.adminMe()) as Promise<AdminProfile>;
}

export async function uploadImage(file: File) {
  const formData = new FormData();
  formData.append('file', file);

  return apiRequest<{ url: string; fileName: string; originalName: string }>('uploads/admin/image', {
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
  return withAdminAuth(adminApiClient.admin.listResource(key, toQueryParams(params))) as Promise<
    ResourceDataMap[K][] | PaginatedResourceResponse<ResourceDataMap[K]>
  >;
}

export async function getResourceById<K extends ResourceKey>(key: K, id: string) {
  return withAdminAuth(adminApiClient.admin.getResource(key, id)) as Promise<ResourceDataMap[K]>;
}

export async function createResource<K extends ResourceKey>(
  key: K,
  payload: Partial<ResourceDataMap[K]>,
) {
  return withAdminAuth(
    adminApiClient.admin.createResource(
      key,
      payload as unknown as AdminCreateResourcePayloadMap[K],
    ),
  ) as Promise<ResourceDataMap[K]>;
}

export async function updateResource<K extends ResourceKey>(
  key: K,
  id: string,
  payload: Partial<ResourceDataMap[K]>,
) {
  return withAdminAuth(
    adminApiClient.admin.updateResource(
      key,
      id,
      payload as unknown as AdminUpdateResourcePayloadMap[K],
    ),
  ) as Promise<ResourceDataMap[K]>;
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
  const query: QueryParams = {
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
  };

  return withAdminAuth(adminApiClient.admin.listOrders(query)) as Promise<PaginatedOrders>;
}

export async function getOrderById(id: string) {
  return withAdminAuth(adminApiClient.admin.getOrder(id)) as Promise<Order>;
}

export async function updateOrderStatus(id: string, status: OrderStatus) {
  return withAdminAuth(adminApiClient.admin.updateOrderStatus(id, { status })) as Promise<Order>;
}

export async function updateOrderPaymentStatus(id: string, status: PaymentStatus) {
  return withAdminAuth(adminApiClient.admin.updateOrderPaymentStatus(id, { status })) as Promise<Order>;
}

export async function updateOrderShippingStatus(id: string, status: ShippingStatus) {
  return withAdminAuth(adminApiClient.admin.updateOrderShippingStatus(id, { status })) as Promise<Order>;
}

export async function listBusinessInquiries(): Promise<BusinessInquiry[]>;
export async function listBusinessInquiries(
  params: ResourceListParams,
): Promise<PaginatedResourceResponse<BusinessInquiry>>;
export async function listBusinessInquiries(params?: ResourceListParams) {
  return withAdminAuth(adminApiClient.admin.listBusinessInquiries(toQueryParams(params))) as Promise<
    BusinessInquiry[] | PaginatedResourceResponse<BusinessInquiry>
  >;
}

export async function getBusinessInquiryById(id: string) {
  return withAdminAuth(adminApiClient.admin.getBusinessInquiry(id)) as Promise<BusinessInquiry>;
}

export async function updateBusinessInquiryStatus(id: string, status: string) {
  return withAdminAuth(
    adminApiClient.admin.updateBusinessInquiryStatus(id, { status: status as InquiryStatus }),
  ) as Promise<BusinessInquiry>;
}

export async function getPaymentSettings() {
  return withAdminAuth(adminApiClient.admin.getPaymentSettings()) as Promise<PaymentSettings>;
}

export async function updatePaymentSettings(payload: Partial<PaymentSettings>) {
  return withAdminAuth(adminApiClient.admin.updatePaymentSettings(payload)) as Promise<PaymentSettings>;
}

export async function getDashboardStats() {
  return withAdminAuth(adminApiClient.admin.getDashboardStats()) as Promise<DashboardStats>;
}

