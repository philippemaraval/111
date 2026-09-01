"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, Minus, Plus, ShieldCheck, Trash2, Truck } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { calculateShippingPrice, getShippingLabel, type ShippingMethod } from "@/lib/shipping";
import { clampQuantity, formatCurrency } from "@/lib/utils";

export function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("mondial-relay");
  const shipping = useMemo(
    () => calculateShippingPrice(subtotal),
    [subtotal]
  );
  const total = subtotal + shipping;

  async function handleCheckout() {
    setIsCheckingOut(true);
    setCheckoutError("");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, shippingMethod }), signal: controller.signal });
      const payload = (await response.json()) as { url?: string; demoMode?: boolean; error?: string };
      if (!response.ok || !payload.url) throw new Error(payload.error ?? "Le paiement ne peut pas être lancé pour le moment.");
      if (payload.demoMode) clearCart();
      window.location.assign(payload.url);
    } catch (error) {
      setCheckoutError(error instanceof DOMException && error.name === "AbortError" ? "Stripe met trop de temps à répondre. Réessaie dans quelques instants." : error instanceof Error ? error.message : "Le paiement ne peut pas être lancé pour le moment.");
    } finally {
      window.clearTimeout(timeoutId);
      setIsCheckingOut(false);
    }
  }

  if (items.length === 0) return (
    <div className="mx-auto grid min-h-[65vh] max-w-2xl place-items-center px-4 text-center"><div><p className="section-kicker">Ton panier</p><h1 className="mt-4 text-5xl font-black uppercase tracking-[-0.05em] sm:text-7xl">Un peu vide, non ?</h1><p className="mx-auto mt-5 max-w-md leading-7 text-navy/55">La carte de Marseille n’attend plus que toi. Trouve ton quartier et porte ses couleurs.</p><Link href="/#carte" className="focus-ring mt-7 inline-flex items-center gap-2 rounded-full bg-sea px-6 py-4 text-sm font-bold text-white hover:bg-navy">Explorer les quartiers <ArrowRight className="h-4 w-4" /></Link></div></div>
  );

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-8 pb-24 sm:px-6 lg:px-10 lg:py-16">
      <Link href="/#collection" className="focus-ring inline-flex items-center gap-2 text-xs font-bold uppercase tracking-[0.16em] text-navy/50 hover:text-sea"><ArrowLeft className="h-4 w-4" /> Continuer mes achats</Link>
      <h1 className="mt-8 text-5xl font-black uppercase tracking-[-0.05em] sm:text-7xl">Ton panier.</h1>
      <div className="mt-10 grid gap-12 lg:grid-cols-[1.15fr_0.85fr]">
        <section className="divide-y divide-navy/10 border-y border-navy/10">
          {items.map((item) => (
            <article key={item.id} className="flex gap-4 py-6 sm:gap-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.imageUrl} alt={item.name} className="h-40 w-28 rounded-xl bg-sand object-cover sm:h-48 sm:w-36" />
              <div className="flex min-w-0 flex-1 flex-col"><div className="flex items-start justify-between"><div><p className="text-[10px] font-bold uppercase tracking-[0.16em] text-sea">{item.kind === "individual" ? "T-shirt 111" : "Offre pack 111"}</p><h2 className="mt-1 text-2xl font-black">{item.name}</h2><div className="mt-2 space-y-1 text-sm text-navy/50">{item.selections.map((selection, index) => <p key={`${selection.neighborhoodId}-${index}`}>{selection.name} · Taille {selection.size}</p>)}</div></div><button type="button" onClick={() => removeItem(item.id)} className="focus-ring rounded-full p-2 text-navy/35 hover:text-terracotta" aria-label={`Retirer ${item.name}`}><Trash2 className="h-4 w-4" /></button></div>
                <div className="mt-auto flex items-center justify-between pt-4">{item.kind === "individual" ? <div className="flex items-center rounded-full border border-navy/10"><button type="button" onClick={() => updateQuantity(item.id, clampQuantity(item.quantity - 1))} className="focus-ring p-3" aria-label="Diminuer"><Minus className="h-4 w-4" /></button><span className="min-w-8 text-center text-sm font-bold">{item.quantity}</span><button type="button" onClick={() => updateQuantity(item.id, clampQuantity(item.quantity + 1))} className="focus-ring p-3" aria-label="Augmenter"><Plus className="h-4 w-4" /></button></div> : <span className="text-xs font-bold uppercase tracking-wider text-sea">1 pack</span>}<p className="text-lg font-black">{formatCurrency(item.unitPrice * item.quantity)}</p></div>
              </div>
            </article>
          ))}
        </section>
        <aside className="h-fit rounded-[24px] bg-sand p-6 sm:p-8 lg:sticky lg:top-32">
          <p className="section-kicker">Récapitulatif</p><h2 className="mt-2 text-3xl font-black">Prêt à rayonner ?</h2>
          <fieldset className="mt-7 space-y-3">
            <legend className="mb-3 text-xs font-bold uppercase tracking-[0.16em] text-navy/50">Mode de livraison</legend>
            {(["mondial-relay", "home"] as const).map((method) => {
              const methodPrice = calculateShippingPrice(subtotal);
              return <label key={method} className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white p-4 transition ${shippingMethod === method ? "border-sea ring-1 ring-sea" : "border-navy/10 hover:border-sea/50"}`}>
                <span className="flex items-center gap-3"><input type="radio" name="shipping-method" value={method} checked={shippingMethod === method} onChange={() => setShippingMethod(method)} className="h-4 w-4 accent-sea" /><span><span className="block text-sm font-bold">{getShippingLabel(method)}</span>{method === "mondial-relay" && <span className="mt-0.5 block text-xs text-navy/45">Choix du relais après la commande</span>}</span></span>
                <strong className="shrink-0 text-sm">{methodPrice === 0 ? "Offerte" : formatCurrency(methodPrice)}</strong>
              </label>;
            })}
          </fieldset>
          <div className="mt-6 space-y-4 border-b border-navy/10 pb-6 text-sm"><div className="flex justify-between"><span className="text-navy/55">Sous-total</span><strong>{formatCurrency(subtotal)}</strong></div><div className="flex justify-between"><span className="text-navy/55">{getShippingLabel(shippingMethod)}</span><strong>{shipping === 0 ? "Offerte" : formatCurrency(shipping)}</strong></div></div>
          <div className="flex items-center justify-between py-6"><span className="font-bold">Total</span><span className="text-2xl font-black">{formatCurrency(total)}</span></div>
          <button type="button" onClick={handleCheckout} disabled={isCheckingOut} className="focus-ring flex w-full items-center justify-between rounded-full bg-sea px-6 py-4 text-sm font-bold text-white hover:bg-navy disabled:opacity-50">{isCheckingOut ? "Redirection…" : "Passer au paiement"}<ArrowRight className="h-4 w-4" /></button>
          {checkoutError && <p role="alert" className="mt-3 text-sm font-semibold text-terracotta">{checkoutError}</p>}
          <div className="mt-6 space-y-3 text-xs font-semibold text-navy/55"><p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-olive" /> Paiement sécurisé</p><p className="flex items-center gap-2"><Truck className="h-4 w-4 text-sea" /> Livraison offerte dès 60 €</p><p className="flex items-center gap-2"><Check className="h-4 w-4 text-sea" /> Expédition suivie</p></div>
        </aside>
      </div>
    </div>
  );
}
