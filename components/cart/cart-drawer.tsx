"use client";

import Link from "next/link";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";

import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const {
    items,
    isDrawerOpen,
    subtotal,
    closeDrawer,
    removeItem,
    updateQuantity
  } = useCart();

  return (
    <>
      <div
        className={`fixed inset-0 z-40 bg-navy/35 transition ${isDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`}
        onClick={closeDrawer}
      />
      <aside
        className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-card transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-navy/10 px-5 py-4">
            <div>
              <p className="text-xs uppercase tracking-[0.24em] text-sea">Panier</p>
              <h2 className="font-display text-3xl text-navy">Sélection quartier</h2>
            </div>
            <button
              type="button"
              onClick={closeDrawer}
              className="rounded-full border border-navy/10 p-2 text-navy"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
            {items.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-navy/15 bg-sand/40 p-6 text-center">
                <ShoppingBag className="mx-auto h-10 w-10 text-sea" />
                <p className="mt-4 text-lg font-semibold text-navy">Votre panier est vide.</p>
                <p className="mt-2 text-sm text-navy/60">
                  Explorez la carte et ajoutez vos quartiers favoris.
                </p>
              </div>
            ) : (
              items.map((item) => (
                <div key={`${item.neighborhoodId}-${item.size}`} className="rounded-[28px] border border-navy/10 p-4 shadow-soft">
                  <div className="flex gap-4">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="h-24 w-20 rounded-2xl object-cover"
                    />
                    <div className="flex flex-1 flex-col">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-navy">{item.name}</p>
                          <p className="text-xs uppercase tracking-[0.18em] text-sea">
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
                      <div className="mt-auto flex items-center justify-between pt-4">
                        <div className="flex items-center rounded-full border border-navy/10">
                          <button
                            type="button"
                            onClick={() =>
                              updateQuantity(
                                item.neighborhoodId,
                                item.size,
                                item.quantity - 1
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
                                item.quantity + 1
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
                </div>
              ))
            )}
          </div>

          <div className="border-t border-navy/10 px-5 py-5">
            <div className="mb-4 flex items-center justify-between text-sm">
              <span className="text-navy/60">Sous-total</span>
              <span className="font-semibold text-navy">{formatCurrency(subtotal)}</span>
            </div>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="mb-3 block rounded-full bg-sand px-5 py-3 text-center text-sm font-medium text-navy"
            >
              Voir le panier détaillé
            </Link>
            <Link
              href="/cart"
              onClick={closeDrawer}
              className="block rounded-full bg-navy px-5 py-3 text-center text-sm font-medium text-white"
            >
              Passer au paiement
            </Link>
          </div>
        </div>
      </aside>
    </>
  );
}
