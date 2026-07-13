import type { Cart, CartItem, CartLineItem } from '../types/cart';

export type CartContract = Cart;
export type CartItemContract = CartItem;
export type CartLineItemContract = CartLineItem;

export type AddCartItemRequestContract = Omit<CartLineItem, 'id' | 'totalPrice'>;
export type UpdateCartItemQuantityRequestContract = {
  id: string;
  quantity: number;
};
