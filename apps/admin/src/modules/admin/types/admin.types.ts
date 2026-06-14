export type ProductStatus = 'active' | 'inactive';

export type OrderStatus =
  | 'pending'
  | 'confirmed'
  | 'processing'
  | 'shipping'
  | 'completed'
  | 'cancelled';

export type PaymentStatus =
  | 'unpaid'
  | 'pending'
  | 'deposit_pending'
  | 'deposit_paid'
  | 'paid'
  | 'failed'
  | 'cancelled'
  | 'refunded';

export type ShippingStatus =
  | 'pending'
  | 'preparing'
  | 'shipping'
  | 'delivered'
  | 'cancelled';

export type InquiryStatus =
  | 'new'
  | 'contacted'
  | 'processing'
  | 'done'
  | 'cancelled';

export interface AdminProfile {
  id: string;
  email: string;
  name: string | null;
  role: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  basePrice: number;
  images: string[];
  status: ProductStatus;
  featured: boolean;
  createdAt: string;
}

export interface TemplateCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { templates: number };
}

export interface AccessoryCategory {
  id: string;
  name: string;
  slug: string;
  _count?: { accessories: number };
}

export interface Template {
  id: string;
  name: string;
  imageUrl?: string | null;
  configJson?: Record<string, unknown> | null;
  status: ProductStatus;
  categoryId?: string | null;
  category?: TemplateCategory | null;
}

export interface Accessory {
  id: string;
  name: string;
  imageUrl?: string | null;
  iconUrl?: string | null;
  status: ProductStatus;
  categoryId?: string | null;
  category?: AccessoryCategory | null;
}

export interface Banner {
  id: string;
  title?: string | null;
  imageUrl: string;
  linkUrl?: string | null;
  sortOrder: number;
  status: ProductStatus;
}

export interface Collection {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  imageUrl?: string | null;
  status: ProductStatus;
}

export interface OrderItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  previewUrl?: string | null;
  designData?: Record<string, unknown> | null;
}

export interface PaymentLog {
  id: string;
  provider: string;
  type: string;
  amount: number;
  status: string;
  checkoutUrl?: string | null;
  paidAt?: string | null;
}

export interface Order {
  id: string;
  orderCode: string;
  customerName: string;
  phone: string;
  email?: string | null;
  address: string;
  receiveDate?: string | null;
  paymentMethod: 'COD' | 'PAYOS';
  paymentStatus: PaymentStatus;
  orderStatus: OrderStatus;
  shippingStatus: ShippingStatus;
  totalAmount: number;
  depositRequired: boolean;
  depositPercent: number;
  depositAmount: number;
  remainingAmount: number;
  depositStatus: string;
  depositPaidAt?: string | null;
  createdAt: string;
  items: OrderItem[];
  payments?: PaymentLog[];
}

export interface PaginatedOrders {
  data: Order[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    total_pages?: number;
    sort_by?: string;
    sort_dir?: string;
    filters_applied?: Record<string, unknown>;
  };
  summary?: {
    total_amount?: number;
    average_order_value?: number;
  };
}

export interface PaginatedResourceResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    total_pages?: number;
    sort_by?: string;
    sort_dir?: string;
    filters_applied?: Record<string, unknown>;
  };
}

export interface BusinessInquiry {
  id: string;
  companyName: string;
  contactName: string;
  email: string;
  phone: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
}

export interface PaymentSettings {
  id: string;
  codEnabled: boolean;
  payosEnabled: boolean;
  codDepositEnabled: boolean;
  codDepositPercent: number;
}

export interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  totalCustomers: number;
  pendingOrders: number;
  paidOrders: number;
  processingOrders: number;
  recentOrders: Array<{
    id: string;
    orderCode: string;
    customerName: string;
    totalAmount: number;
    orderStatus: OrderStatus;
    paymentStatus: PaymentStatus;
    createdAt: string;
  }>;
  topProducts: Array<{
    productName: string;
    quantity: number;
    revenue: number;
  }>;
}
