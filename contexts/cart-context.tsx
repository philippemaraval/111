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
import { PRODUCT_PRICE_EUROS } from "@/lib/constants";
import type { CartItem } from "@/lib/types";

type CartContextValue = {
  items: CartItem[];
  isDrawerOpen: boolean;
  itemCount: number;
  subtotal: number;
  addItem: (item: CartItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
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
        const storedItems = JSON.parse(raw) as Array<CartItem & {
          neighborhoodId?: string;
          slug?: string;
          size?: "S" | "M" | "L" | "XL";
        }>;
        setItems(storedItems.flatMap((item) => {
          if (item.kind && item.id && item.selections) {
            return [{
              ...item,
              unitPrice: item.kind === "individual" ? PRODUCT_PRICE_EUROS : item.unitPrice
            }];
          }

          if (!item.neighborhoodId || !item.slug || !item.size) return [];
          return [{
            id: `individual-${item.neighborhoodId}-${item.size}`,
            kind: "individual" as const,
            name: item.name,
            quantity: item.quantity,
            unitPrice: PRODUCT_PRICE_EUROS,
            imageUrl: item.imageUrl,
            selections: [{
              neighborhoodId: item.neighborhoodId,
              slug: item.slug,
              name: item.name,
              size: item.size,
              imageUrl: item.imageUrl
            }]
          }];
        }));
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
          const existing = current.find((entry) => entry.id === item.id);

          if (!existing) {
            return [...current, item];
          }

          return current.map((entry) =>
            entry.id === item.id
              ? {
                  ...entry,
                  quantity: clampQuantity(entry.quantity + item.quantity)
                }
              : entry
          );
        });
        setIsDrawerOpen(true);
      },
      removeItem(id) {
        setItems((current) => current.filter((entry) => entry.id !== id));
      },
      updateQuantity(id, quantity) {
        setItems((current) =>
          current.map((entry) =>
            entry.id === id
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
