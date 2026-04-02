"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowRight, Minus, Plus, Trash2 } from "lucide-react";

import { useCart } from "@/contexts/cart-context";
import { clampQuantity, formatCurrency } from "@/lib/utils";

export function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const shipping = useMemo(() => (subtotal > 90 ? 0 : 6), [subtotal]);
  const total = subtotal + shipping;

  async function handleCheckout() {
    setIsCheckingOut(true);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ items })
      });

      const payload = (await response.json()) as { url?: string; demoMode?: boolean };

      if (!response.ok || !payload.url) {
        throw new Error("checkout_failed");
      }

      if (payload.demoMode) {
        clearCart();
      }

      window.location.assign(payload.url);
    } finally {
      setIsCheckingOut(false);
    }
  }

  if (items.length === 0) {
    return (
      <div className="grid min-h-[55vh] place-items-center">
        <div className="max-w-lg rounded-[32px] border border-navy/10 bg-white/75 p-8 text-center shadow-card backdrop-blur-xl">
          <h1 className="font-display text-5xl text-navy">Panier vide</h1>
          <p className="mt-4 text-navy/70">
            Retournez sur la carte pour ajouter vos quartiers favoris.
          </p>
          <Link
            href="/"
            className="mt-6 inline-flex rounded-full bg-navy px-6 py-3 text-sm font-medium text-white"
          >
            Revenir au catalogue
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
      <section className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-sea">Tunnel d’achat</p>
          <h1 className="font-display text-5xl text-navy">Panier quartier</h1>
        </div>

        <div className="space-y-4">
          {items.map((item) => (
            <article key={`${item.neighborhoodId}-${item.size}`} className="rounded-[30px] border border-navy/10 bg-white p-5 shadow-soft">
              <div className="flex flex-col gap-4 sm:flex-row">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="h-32 w-28 rounded-[22px] object-cover"
                />
                <div className="flex flex-1 flex-col">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="text-xl font-semibold text-navy">{item.name}</h2>
                      <p className="text-xs uppercase tracking-[0.2em] text-sea">
                        Taille {item.size}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem(item.neighborhoodId, item.size)}
                      className="rounded-full border border-navy/10 p-2 text-navy/60"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="mt-auto flex flex-wrap items-center justify-between gap-3 pt-5">
                    <div className="flex items-center rounded-full border border-navy/10">
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.neighborhoodId,
                            item.size,
                            clampQuantity(item.quantity - 1)
                          )
                        }
                        className="px-3 py-2 text-navy"
                      >
                        <Minus className="h-4 w-4" />
                      </button>
                      <span className="min-w-10 text-center text-sm font-medium text-navy">
                        {item.quantity}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          updateQuantity(
                            item.neighborhoodId,
                            item.size,
                            clampQuantity(item.quantity + 1)
                          )
                        }
                        className="px-3 py-2 text-navy"
                      >
                        <Plus className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="font-semibold text-navy">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      </section>

      <aside className="space-y-4 rounded-[32px] border border-navy/10 bg-white/75 p-6 shadow-card backdrop-blur-xl">
        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-sea">Résumé</p>
          <h2 className="font-display text-4xl text-navy">Paiement Stripe</h2>
        </div>
        <div className="space-y-3 text-sm text-navy/70">
          <div className="flex items-center justify-between">
            <span>Sous-total</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Livraison</span>
            <span>{shipping === 0 ? "Offerte" : formatCurrency(shipping)}</span>
          </div>
          <div className="flex items-center justify-between border-t border-navy/10 pt-3 text-base font-semibold text-navy">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>
        </div>
        <button
          type="button"
          onClick={handleCheckout}
          disabled={isCheckingOut}
          className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white"
        >
          {isCheckingOut ? "Redirection..." : "Checkout sécurisé"}
          <ArrowRight className="h-4 w-4" />
        </button>
        <p className="text-sm text-navy/55">
          Le paiement s’effectue sur Stripe. Les ventes mettent ensuite à jour les compteurs communautaires côté Supabase.
        </p>
      </aside>
    </div>
  );
}
