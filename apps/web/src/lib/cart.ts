"use client";

import { useState, useEffect } from "react";
import type { JsonObject } from "@lego-shop/shared";

export interface CartItem {
  id: string; // unique cart item id
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  designData?: JsonObject;
  previewUrl?: string;
}

const CART_STORAGE_KEY = "legoshop_cart";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(CART_STORAGE_KEY);
      if (stored) {
        setItems(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load cart", e);
    }
    setIsLoaded(true);
  }, []);

  const saveCart = (newItems: CartItem[]) => {
    setItems(newItems);
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(newItems));
    
    // Dispatch event to update Header cart badge
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const addItem = (item: Omit<CartItem, "id">) => {
    const newItems = [...items, { ...item, id: Math.random().toString(36).substr(2, 9) }];
    saveCart(newItems);
  };

  const updateQuantity = (id: string, quantity: number) => {
    if (quantity <= 0) return removeItem(id);
    const newItems = items.map(item => item.id === id ? { ...item, quantity } : item);
    saveCart(newItems);
  };

  const removeItem = (id: string) => {
    const newItems = items.filter(item => item.id !== id);
    saveCart(newItems);
  };

  const clearCart = () => {
    saveCart([]);
  };

  const totalAmount = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  return {
    items,
    isLoaded,
    addItem,
    updateQuantity,
    removeItem,
    clearCart,
    totalAmount
  };
}
