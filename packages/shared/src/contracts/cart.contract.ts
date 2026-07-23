import type { Cart, CartItem, CartLineItem } from "../types/cart";
import type { JsonObject, PriceInVND } from "../types/common";

export type CartContract = Cart;
export type CartItemContract = CartItem;
export type CartLineItemContract = CartLineItem;

export type AddCartItemRequestContract = Omit<
  CartLineItem,
  "id" | "totalPrice"
>;
export type UpdateCartItemQuantityRequestContract = {
  id: string;
  quantity: number;
};

export type CartQuoteItemRequestContract = {
  cartItemId: string;
  productId?: string;
  productName: string;
  quantity: number;
  priceSnapshot: PriceInVND;
  frameOptionId?: string;
  backgroundId?: string;
  frameSizeId?: string;
  frameSizeLabel?: string;
  frameColorName?: string;
  accessories?: Array<{
    id: string;
    name?: string;
    price?: PriceInVND;
    quantity?: number;
  }>;
  designData?: JsonObject;
  previewUrl?: string;
};

export type CartQuoteRequestContract = {
  items: CartQuoteItemRequestContract[];
  shippingMethod?: "shop_support" | "self";
  paymentMethod?: "COD" | "PAYOS";
  giftPackage?: boolean;
  polaroidOption?: "none" | "2" | "4";
  voucherCode?: string;
};

export type CartQuoteWarningCode =
  "PRICE_CHANGED" | "ITEM_UNAVAILABLE" | "INVALID_CONFIGURATION";

export type CartQuoteWarningContract = {
  code: CartQuoteWarningCode;
  message: string;
};

export type CartQuoteItemResponseContract = {
  cartItemId: string;
  valid: boolean;
  unitPrice: PriceInVND;
  previousUnitPrice: PriceInVND;
  quantity: number;
  lineTotal: PriceInVND;
  productName?: string;
  warnings: CartQuoteWarningContract[];
};

export type CartQuoteResponseContract = {
  items: CartQuoteItemResponseContract[];
  subtotal: PriceInVND;
  giftFee: PriceInVND;
  polaroidFee: PriceInVND;
  addOnTotal: PriceInVND;
  discount: PriceInVND;
  shipping: PriceInVND | null;
  total: PriceInVND;
  valid: boolean;
  quotedAt: string;
};

export type CheckoutSettingsContract = {
  payment: {
    codEnabled: boolean;
    payosEnabled: boolean;
    codDepositEnabled: boolean;
    codDepositPercent: number;
  };
  shippingMethods: Array<"shop_support" | "self">;
  giftPackage: {
    enabled: boolean;
    pricePerItem: PriceInVND;
  };
  polaroidOptions: Array<{
    id: "none" | "2" | "4";
    enabled: boolean;
    price: PriceInVND;
  }>;
  minimumReceiveDateDays: number;
  orderNoteMaxLength: number;
};
