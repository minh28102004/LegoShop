import type { ID, JsonObject, PriceInVND, URLString } from './common';
import type { Product } from './product';

export type CartLineItemType =
  | 'frame'
  | 'standalone_character'
  | 'custom_character'
  | 'retail_part';

export type DesignData = {
  productId?: ID;
  templateId?: ID;
  canvasJson?: JsonObject;
  previewUrl?: URLString;
  [key: string]: unknown;
};

export type CartItem = {
  productId?: ID;
  lineItemType?: CartLineItemType;
  productType?: string;
  customName?: string;
  productName: string;
  quantity: number;
  price: PriceInVND;
  designData?: JsonObject;
  previewUrl?: URLString;
};

export type CartLineItem = {
  id: ID;
  product: Product;
  lineItemType?: CartLineItemType;
  productType?: string;
  customName?: string;
  quantity: number;
  unitPrice: PriceInVND;
  totalPrice: PriceInVND;
  designData?: JsonObject;
  previewUrl?: URLString;
};

export type Cart = {
  items: CartLineItem[];
  subtotal: PriceInVND;
  shippingCost: PriceInVND;
  discountAmount: PriceInVND;
  total: PriceInVND;
  itemCount: number;
};
