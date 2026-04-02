"use client";

import { useState } from "react";
import { BellRing, Check, ShoppingBag } from "lucide-react";

import { useCart } from "@/contexts/cart-context";
import { SIZE_ORDER } from "@/lib/constants";
import { availableSizes, clampQuantity, cn, formatCurrency } from "@/lib/utils";
import type { Neighborhood, Size } from "@/lib/types";

import { VoteForm } from "@/components/product/vote-form";

type ProductPurchasePanelProps = {
  neighborhood: Neighborhood;
};

export function ProductPurchasePanel({
  neighborhood
}: ProductPurchasePanelProps) {
  const { addItem } = useCart();
  const available = availableSizes(neighborhood.stockBySize);
  const [selectedSize, setSelectedSize] = useState<Size | null>(available[0] ?? null);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    if (!selectedSize) {
      return;
    }

    addItem({
      neighborhoodId: neighborhood.id,
      slug: neighborhood.slug,
      name: neighborhood.name,
      size: selectedSize,
      quantity: clampQuantity(quantity),
      unitPrice: neighborhood.price,
      imageUrl: neighborhood.imageUrl
    });

    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <aside className="space-y-5 rounded-[32px] border border-navy/10 bg-white/80 p-6 shadow-card backdrop-blur-xl">
      <div className="space-y-3">
        <span
          className={cn(
            "inline-flex rounded-full px-3 py-2 text-xs uppercase tracking-[0.22em]",
            neighborhood.isAvailable
              ? "bg-olive/15 text-olive"
              : "bg-terracotta/10 text-terracotta"
          )}
        >
          {neighborhood.isAvailable ? "Disponible maintenant" : "Coming soon"}
        </span>
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.22em] text-sea">
              {neighborhood.arrondissement}e arrondissement
            </p>
            <h1 className="font-display text-5xl text-navy">{neighborhood.name}</h1>
          </div>
          <p className="font-display text-4xl text-navy">
            {formatCurrency(neighborhood.price)}
          </p>
        </div>
      </div>

      {neighborhood.isAvailable ? (
        <>
          <div className="space-y-3">
            <p className="text-xs uppercase tracking-[0.22em] text-sea">Choix de taille</p>
            <div className="grid grid-cols-4 gap-2">
              {SIZE_ORDER.map((size) => {
                const enabled = neighborhood.stockBySize[size] > 0;

                return (
                  <button
                    key={size}
                    type="button"
                    disabled={!enabled}
                    onClick={() => setSelectedSize(size)}
                    className={cn(
                      "rounded-2xl border px-4 py-3 text-sm font-semibold transition",
                      selectedSize === size
                        ? "border-navy bg-navy text-white"
                        : "border-navy/10 bg-sand/40 text-navy",
                      !enabled && "cursor-not-allowed opacity-40"
                    )}
                  >
                    {size}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <label className="flex-1 space-y-2">
              <span className="text-xs uppercase tracking-[0.22em] text-sea">Quantité</span>
              <input
                type="number"
                min={1}
                max={9}
                value={quantity}
                onChange={(event) => setQuantity(clampQuantity(Number(event.target.value)))}
                className="w-full rounded-2xl border border-navy/10 bg-foam px-4 py-3 text-sm text-navy outline-none"
              />
            </label>
          </div>

          <button
            type="button"
            onClick={handleAddToCart}
            disabled={!selectedSize}
            className="flex w-full items-center justify-center gap-2 rounded-full bg-navy px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white"
          >
            {added ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
            {added ? "Ajouté au panier" : "Ajouter au panier"}
          </button>

          <div className="rounded-[24px] bg-sand/55 p-4 text-sm text-navy/70">
            Stock visible en temps réel par taille. Le checkout Stripe est déclenché directement depuis le panier.
          </div>
        </>
      ) : (
        <div className="space-y-4">
          <div className="rounded-[24px] border border-terracotta/20 bg-terracotta/5 p-4 text-sm text-navy/75">
            Design en mode grisé tant que le quartier n’est pas activé. La communauté décide du prochain lancement.
          </div>
          <VoteForm neighborhoodId={neighborhood.id} neighborhoodName={neighborhood.name} />
          <div className="inline-flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-xs uppercase tracking-[0.18em] text-navy">
            <BellRing className="h-4 w-4 text-terracotta" />
            Alerte de stock envoyée au moment du drop
          </div>
        </div>
      )}
    </aside>
  );
}
