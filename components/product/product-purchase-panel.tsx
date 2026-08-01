"use client";

import { useState } from "react";
import { Check, ChevronDown, ShoppingBag, Sparkles } from "lucide-react";

import { VoteForm } from "@/components/product/vote-form";
import { useCart } from "@/contexts/cart-context";
import { SIZE_ORDER } from "@/lib/constants";
import { availableSizes, cn, formatCurrency } from "@/lib/utils";
import type { Neighborhood, Size } from "@/lib/types";

export function ProductPurchasePanel({ neighborhood }: { neighborhood: Neighborhood }) {
  const { addItem } = useCart();
  const available = availableSizes(neighborhood.stockBySize);
  const [selectedSize, setSelectedSize] = useState<Size | null>(available[0] ?? null);
  const [added, setAdded] = useState(false);

  function handleAddToCart() {
    if (!selectedSize) return;
    addItem({ neighborhoodId: neighborhood.id, slug: neighborhood.slug, name: neighborhood.name, size: selectedSize, quantity: 1, unitPrice: neighborhood.price, imageUrl: neighborhood.imageUrl });
    setAdded(true);
    window.setTimeout(() => setAdded(false), 1800);
  }

  return (
    <aside className="sticky top-32 py-5 lg:py-8">
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-sea">111 · {neighborhood.arrondissement}<sup>e</sup> arrondissement</p>
      <h1 className="mt-3 text-5xl font-black uppercase leading-[0.9] tracking-[-0.05em] text-navy sm:text-6xl">{neighborhood.name}</h1>
      <div className="mt-5 flex items-center justify-between border-b border-navy/10 pb-5">
        <p className="text-xl font-bold">{formatCurrency(neighborhood.price)}</p>
        <span className={cn("rounded-full px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em]", neighborhood.isAvailable ? "bg-olive/10 text-olive" : "bg-terracotta/10 text-terracotta")}>{neighborhood.isAvailable ? "En stock" : "Prochainement"}</span>
      </div>
      <p className="mt-6 text-base leading-7 text-navy/65">Un morceau de Marseille à porter, inspiré par l’énergie et les détails qui rendent {neighborhood.name} unique.</p>

      {neighborhood.isAvailable ? (
        <div className="mt-8">
          <div className="flex items-center justify-between"><p className="text-xs font-bold uppercase tracking-[0.16em]">Choisir une taille</p><button type="button" className="text-xs font-semibold text-navy/50 underline underline-offset-4">Guide des tailles</button></div>
          <div className="mt-3 grid grid-cols-4 gap-2">
            {SIZE_ORDER.map((size) => {
              const enabled = neighborhood.stockBySize[size] > 0;
              return <button key={size} type="button" disabled={!enabled} onClick={() => setSelectedSize(size)} className={cn("focus-ring rounded-xl border py-3 text-sm font-bold transition", selectedSize === size ? "border-navy bg-navy text-white" : "border-navy/15 hover:border-sea", !enabled && "cursor-not-allowed bg-sand text-navy/25 line-through")}>{size}</button>;
            })}
          </div>
          <button type="button" onClick={handleAddToCart} disabled={!selectedSize} className="focus-ring mt-4 flex w-full items-center justify-center gap-3 rounded-full bg-sea px-6 py-4 text-sm font-bold text-white transition hover:bg-navy disabled:opacity-40">
            {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}{added ? "Ajouté au panier" : "Ajouter au panier"}
          </button>
          <div className="mt-5 flex items-center justify-center gap-2 text-xs font-semibold text-navy/50"><Sparkles className="h-4 w-4 text-sun" /> Série courte · Expédition suivie</div>
          <details className="mt-8 border-t border-navy/10 py-4"><summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold">Coupe & entretien <ChevronDown className="h-4 w-4" /></summary><p className="pt-3 text-sm leading-6 text-navy/55">Coupe unisexe droite. Lavage à 30 °C sur l’envers pour préserver le dessin.</p></details>
          <details className="border-y border-navy/10 py-4"><summary className="flex cursor-pointer list-none items-center justify-between text-sm font-bold">Fabrication & démarche <ChevronDown className="h-4 w-4" /></summary><p className="pt-3 text-sm leading-6 text-navy/55">Un visuel imaginé à Marseille et produit en série courte. Les informations de fabrication accompagnent chaque édition.</p></details>
        </div>
      ) : (
        <div className="mt-8"><VoteForm neighborhoodId={neighborhood.id} neighborhoodName={neighborhood.name} /></div>
      )}
    </aside>
  );
}
