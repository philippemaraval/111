"use client";

import Link from "next/link";
import { ArrowRight, Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";
import { useCart } from "@/contexts/cart-context";
import { formatCurrency } from "@/lib/utils";

export function CartDrawer() {
  const { items, isDrawerOpen, subtotal, closeDrawer, removeItem, updateQuantity } = useCart();
  return (
    <>
      <div className={`fixed inset-0 z-40 bg-navy/45 backdrop-blur-sm transition ${isDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"}`} onClick={closeDrawer} />
      <aside role="dialog" aria-modal="true" aria-label="Votre panier" className={`fixed right-0 top-0 z-50 h-full w-full max-w-md bg-white shadow-card transition-transform duration-300 ${isDrawerOpen ? "translate-x-0" : "translate-x-full"}`}>
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b border-navy/10 px-5 py-5">
            <div className="flex items-center gap-3"><LogoMark className="h-10 w-10 text-sea" /><div><p className="text-[10px] font-bold uppercase tracking-[0.2em] text-sea">Ta sélection</p><h2 className="text-2xl font-black tracking-tight">Panier ({items.length})</h2></div></div>
            <button type="button" onClick={closeDrawer} className="focus-ring rounded-full border border-navy/10 p-2.5 hover:bg-sand" aria-label="Fermer le panier"><X className="h-4 w-4" /></button>
          </div>
          <div className="flex-1 space-y-5 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="grid min-h-[55vh] place-items-center text-center"><div><ShoppingBag className="mx-auto h-10 w-10 text-sea" /><p className="mt-5 text-2xl font-black">C’est encore vide ici.</p><p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-navy/55">Pars à la recherche du quartier qui te ressemble.</p><Link href="/#carte" onClick={closeDrawer} className="focus-ring mt-6 inline-flex rounded-full bg-navy px-5 py-3 text-sm font-bold text-white">Explorer la carte</Link></div></div>
            ) : items.map((item) => (
              <article key={`${item.neighborhoodId}-${item.size}`} className="flex gap-4 border-b border-navy/10 pb-5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.imageUrl} alt={item.name} className="h-32 w-24 rounded-xl bg-sand object-cover" />
                <div className="flex min-w-0 flex-1 flex-col"><div className="flex items-start justify-between gap-2"><div><p className="text-lg font-black">{item.name}</p><p className="mt-1 text-xs font-semibold text-navy/45">Taille {item.size}</p></div><button type="button" onClick={() => removeItem(item.neighborhoodId, item.size)} className="focus-ring rounded-full p-2 text-navy/35 hover:text-terracotta" aria-label={`Retirer ${item.name}`}><Trash2 className="h-4 w-4" /></button></div>
                  <div className="mt-auto flex items-center justify-between"><div className="flex items-center rounded-full border border-navy/10"><button type="button" onClick={() => updateQuantity(item.neighborhoodId, item.size, item.quantity - 1)} className="focus-ring p-2.5" aria-label="Diminuer la quantité"><Minus className="h-3.5 w-3.5" /></button><span className="min-w-7 text-center text-xs font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.neighborhoodId, item.size, item.quantity + 1)} className="focus-ring p-2.5" aria-label="Augmenter la quantité"><Plus className="h-3.5 w-3.5" /></button></div><p className="font-bold">{formatCurrency(item.unitPrice * item.quantity)}</p></div>
                </div>
              </article>
            ))}
          </div>
          {items.length > 0 && <div className="border-t border-navy/10 p-5"><div className="mb-4 flex items-center justify-between"><span className="text-sm text-navy/55">Sous-total</span><span className="text-xl font-black">{formatCurrency(subtotal)}</span></div><Link href="/cart" onClick={closeDrawer} className="focus-ring flex items-center justify-between rounded-full bg-sea px-6 py-4 text-sm font-bold text-white hover:bg-navy">Voir mon panier <ArrowRight className="h-4 w-4" /></Link><p className="mt-3 text-center text-[11px] text-navy/40">Livraison calculée à l’étape suivante</p></div>}
        </div>
      </aside>
    </>
  );
}
