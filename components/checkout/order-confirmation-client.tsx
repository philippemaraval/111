"use client";

import { useEffect, useRef } from "react";

import { useCart } from "@/contexts/cart-context";

type OrderConfirmationClientProps = {
  paymentConfirmed: boolean;
};

export function OrderConfirmationClient({
  paymentConfirmed
}: OrderConfirmationClientProps) {
  const { clearCart, closeDrawer } = useCart();
  const hasClearedCart = useRef(false);

  useEffect(() => {
    if (!paymentConfirmed || hasClearedCart.current) return;

    hasClearedCart.current = true;
    clearCart();
    closeDrawer();
  }, [clearCart, closeDrawer, paymentConfirmed]);

  return null;
}
