import React, { createContext, useContext, useEffect, useState } from "react";

import { getCart, updateCart } from "@/api/cartApi";
import type { Product } from "@/api/productApi";

import { useAuth } from "@/context/AuthContext";

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  items: CartItem[];
  isLoading: boolean;
  addToCart: (item: CartItem) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  refreshCart: () => Promise<void>;
  clearCart: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: React.ReactNode }) {
  const { isLoading: authLoading, isAuthenticated } = useAuth();

  const [items, setItems] = useState<CartItem[]>([]);

  const [isLoading, setIsLoading] = useState(true);

  // Load cart from MongoDB
  const refreshCart = async () => {
    if (!isAuthenticated) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const cart = await getCart();

      setItems(cart?.items || []);
    } catch (error) {
      console.error("REFRESH CART ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Refresh cart after authentication is restored
  useEffect(() => {
    if (authLoading) {
      return;
    }

    refreshCart();
  }, [authLoading, isAuthenticated]);

  // Save cart to MongoDB
  const saveCart = async (newItems: CartItem[]) => {
    try {
      await updateCart(newItems);

      setItems(newItems);
    } catch (error) {
      console.error("SAVE CART ERROR:", error);

      throw error;
    }
  };

  // Add product to cart
  const addToCart = async (item: CartItem) => {
    const existingItem = items.find(
      (cartItem) => cartItem.product._id === item.product._id,
    );

    let newItems: CartItem[];

    if (existingItem) {
      newItems = items.map((cartItem) =>
        cartItem.product._id === item.product._id
          ? {
              ...cartItem,
              quantity: cartItem.quantity + item.quantity,
            }
          : cartItem,
      );
    } else {
      newItems = [...items, item];
    }

    await saveCart(newItems);
  };

  // Remove product completely
  const removeFromCart = async (productId: string) => {
    const newItems = items.filter((item) => item.product._id !== productId);

    await saveCart(newItems);
  };

  // Update product quantity
  const updateQuantity = async (productId: string, quantity: number) => {
    if (quantity <= 0) {
      await removeFromCart(productId);
      return;
    }

    const newItems = items.map((item) =>
      item.product._id === productId
        ? {
            ...item,
            quantity,
          }
        : item,
    );

    await saveCart(newItems);
  };

  // Empty entire cart
  const clearCart = async () => {
    await saveCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        items,
        isLoading,
        addToCart,
        removeFromCart,
        updateQuantity,
        refreshCart,
        clearCart,
      }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used inside CartProvider");
  }

  return context;
}
