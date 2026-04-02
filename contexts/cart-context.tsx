"use client";

import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren
} from "react";

import { clampQuantity } from "@/lib/utils";
import type { CartItem, Size } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  isDrawerOpen: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (neighborhoodId: string, size: Size) => void;
  updateQuantity: (neighborhoodId: string, size: Size, quantity: number) => void;
  clearCart: () => void;
  openDrawer: () => void;
  closeDrawer: () => void;
};

const STORAGE_KEY = "marseille-111-cart";

const CartContext = createContext<CartContextValue | null>(null);

export function CartProvider({ children }: PropsWithChildren) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    if (raw) {
      try {
        setItems(JSON.parse(raw) as CartItem[]);
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) {
      return;
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  }, [hydrated, items]);

  const value = useMemo<CartContextValue>(() => {
    const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0
    );

    return {
      items,
      isDrawerOpen,
      itemCount,
      subtotal,
      addItem(item) {
        setItems((current) => {
          const existing = current.find(
            (entry) =>
              entry.neighborhoodId === item.neighborhoodId && entry.size === item.size
          );

          if (!existing) {
            return [...current, item];
          }

          return current.map((entry) =>
            entry.neighborhoodId === item.neighborhoodId && entry.size === item.size
              ? {
                  ...entry,
                  quantity: clampQuantity(entry.quantity + item.quantity)
                }
              : entry
          );
        });
        setIsDrawerOpen(true);
      },
      removeItem(neighborhoodId, size) {
        setItems((current) =>
          current.filter(
            (entry) =>
              !(entry.neighborhoodId === neighborhoodId && entry.size === size)
          )
        );
      },
      updateQuantity(neighborhoodId, size, quantity) {
        setItems((current) =>
          current.map((entry) =>
            entry.neighborhoodId === neighborhoodId && entry.size === size
              ? { ...entry, quantity: clampQuantity(quantity) }
              : entry
          )
        );
      },
      clearCart() {
        setItems([]);
      },
      openDrawer() {
        setIsDrawerOpen(true);
      },
      closeDrawer() {
        setIsDrawerOpen(false);
      }
    };
  }, [isDrawerOpen, items]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const context = useContext(CartContext);

  if (!context) {
    throw new Error("useCart must be used within CartProvider");
  }

  return context;
}
