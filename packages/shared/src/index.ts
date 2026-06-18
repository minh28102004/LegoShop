export type ProductStatus = "active" | "inactive";

export const SHARED_IMAGE_PATHS = {
  banner: {
    desktop: "/shared/images/banner/desktop.png",
  },
  bgTemplate: [
    "/shared/images/bg_template/1.png",
    "/shared/images/bg_template/2.png",
    "/shared/images/bg_template/3.png",
    "/shared/images/bg_template/4.png",
  ],
} as const;

export type PaymentMethod = "COD" | "PAYOS";

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "processing"
  | "shipping"
  | "completed"
  | "cancelled";

export type PaymentStatus =
  | "unpaid"
  | "pending"
  | "deposit_pending"
  | "deposit_paid"
  | "paid"
  | "failed"
  | "cancelled"
  | "refunded";

export type ShippingStatus =
  | "pending"
  | "preparing"
  | "shipping"
  | "delivered"
  | "cancelled";

export type Product = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  basePrice: number;
  images: string[];
  status: ProductStatus;
  featured?: boolean;
};

export type DesignData = {
  productId: string;
  templateId?: string;
  canvasJson: object;
  previewUrl?: string;
};

export type CartItem = {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  designData?: object;
  previewUrl?: string;
};

export type CreateOrderRequest = {
  customerName: string;
  phone: string;
  email?: string;
  address: string;
  receiveDate?: string;
  paymentMethod: PaymentMethod;
  items: CartItem[];
};

export type CreateOrderResponse = {
  orderId: string;
  orderCode: string;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus | string;

  totalAmount: number;
  depositRequired: boolean;
  depositPercent: number;
  depositAmount: number;
  remainingAmount: number;
  depositStatus: string;

  checkoutUrl?: string;
};
