import React, { createContext, useContext, useEffect, useState } from "react";

import { getWishlist, updateWishlist } from "@/api/wishlistApi";
import { useAuth } from "@/context/AuthContext";
import type { Product } from "@/api/productApi";

interface WishlistContextType {
  items: Product[];
  isLoading: boolean;
  addToWishlist: (product: Product) => Promise<void>;
  removeFromWishlist: (productId: string) => Promise<void>;
  isInWishlist: (productId: string) => boolean;
  refreshWishlist: () => Promise<void>;
}

const WishlistContext = createContext<WishlistContextType | undefined>(
  undefined,
);

export function WishlistProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  const [items, setItems] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const refreshWishlist = async () => {
    if (!isAuthenticated) {
      setItems([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);

      const wishlist = await getWishlist();

      setItems(wishlist?.items || []);
    } catch (error) {
      console.error("REFRESH WISHLIST ERROR:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (authLoading) return;

    refreshWishlist();
  }, [authLoading, isAuthenticated]);

  const saveWishlist = async (newItems: Product[]) => {
    await updateWishlist(newItems);

    setItems(newItems);
  };

  const addToWishlist = async (product: Product) => {
    if (items.some((item) => item._id === product._id)) {
      return;
    }

    await saveWishlist([...items, product]);
  };

  const removeFromWishlist = async (productId: string) => {
    await saveWishlist(items.filter((item) => item._id !== productId));
  };

  const isInWishlist = (productId: string) => {
    return items.some((item) => item._id === productId);
  };

  return (
    <WishlistContext.Provider
      value={{
        items,
        isLoading,
        addToWishlist,
        removeFromWishlist,
        isInWishlist,
        refreshWishlist,
      }}
    >
      {children}
    </WishlistContext.Provider>
  );
}

export function useWishlist() {
  const context = useContext(WishlistContext);

  if (!context) {
    throw new Error("useWishlist must be used inside WishlistProvider");
  }

  return context;
}
