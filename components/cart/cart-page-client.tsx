"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, LoaderCircle, MapPin, Minus, Plus, Search, ShieldCheck, Trash2, Truck } from "lucide-react";
import { useCart } from "@/contexts/cart-context";
import { calculateShippingPrice, getShippingLabel, type ShippingMethod } from "@/lib/shipping";
import type { ServicePoint } from "@/lib/types";
import { clampQuantity, formatCurrency } from "@/lib/utils";

export function CartPageClient() {
  const { items, subtotal, updateQuantity, removeItem, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutError, setCheckoutError] = useState("");
  const [shippingMethod, setShippingMethod] = useState<ShippingMethod>("mondial-relay");
  const [postalCode, setPostalCode] = useState("");
  const [servicePoints, setServicePoints] = useState<ServicePoint[]>([]);
  const [selectedServicePoint, setSelectedServicePoint] = useState<ServicePoint | null>(null);
  const [isSearchingServicePoints, setIsSearchingServicePoints] = useState(false);
  const [servicePointError, setServicePointError] = useState("");
  const shipping = useMemo(
    () => calculateShippingPrice(subtotal, shippingMethod),
    [shippingMethod, subtotal]
  );
  const total = subtotal + shipping;

  async function handleServicePointSearch() {
    if (!/^\d{5}$/.test(postalCode)) {
      setServicePointError("Saisis un code postal français à 5 chiffres.");
      return;
    }

    setIsSearchingServicePoints(true);
    setServicePointError("");
    setSelectedServicePoint(null);

    try {
      const response = await fetch(
        `/api/sendcloud/service-points?postalCode=${encodeURIComponent(postalCode)}`
      );
      const payload = await response.json() as {
        servicePoints?: ServicePoint[];
        error?: string;
      };

      if (!response.ok) {
        throw new Error(payload.error ?? "Impossible de charger les points relais.");
      }

      const points = payload.servicePoints ?? [];
      setServicePoints(points);
      if (points.length === 0) {
        setServicePointError("Aucun point relais trouvé autour de ce code postal.");
      }
    } catch (error) {
      setServicePoints([]);
      setServicePointError(
        error instanceof Error ? error.message : "Impossible de charger les points relais."
      );
    } finally {
      setIsSearchingServicePoints(false);
    }
  }

  async function handleCheckout() {
    if (shippingMethod === "mondial-relay" && !selectedServicePoint) {
      setCheckoutError("Choisis un point relais avant de passer au paiement.");
      return;
    }

    setIsCheckingOut(true);
    setCheckoutError("");
    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 15_000);
    try {
      const response = await fetch("/api/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ items, shippingMethod, servicePointId: shippingMethod === "mondial-relay" ? selectedServicePoint?.id : undefined }), signal: controller.signal });
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
              const methodPrice = calculateShippingPrice(subtotal, method);
              return <label key={method} className={`flex cursor-pointer items-center justify-between gap-3 rounded-2xl border bg-white p-4 transition ${shippingMethod === method ? "border-sea ring-1 ring-sea" : "border-navy/10 hover:border-sea/50"}`}>
                <span className="flex items-center gap-3"><input type="radio" name="shipping-method" value={method} checked={shippingMethod === method} onChange={() => { setShippingMethod(method); setCheckoutError(""); }} className="h-4 w-4 accent-sea" /><span><span className="block text-sm font-bold">{getShippingLabel(method)}</span>{method === "mondial-relay" && <span className="mt-0.5 block text-xs text-navy/45">À choisir avant le paiement</span>}</span></span>
                <strong className="shrink-0 text-sm">{methodPrice === 0 ? "Offerte" : formatCurrency(methodPrice)}</strong>
              </label>;
            })}
          </fieldset>
          {shippingMethod === "mondial-relay" && (
            <section className="mt-5 rounded-2xl border border-navy/10 bg-white p-4" aria-labelledby="service-point-title">
              <h3 id="service-point-title" className="text-sm font-black">Choisis ton point relais</h3>
              <p className="mt-1 text-xs leading-5 text-navy/50">Recherche les Points Relais et Lockers disponibles autour de ton code postal.</p>
              <div className="mt-4 flex gap-2">
                <label className="sr-only" htmlFor="service-point-postal-code">Code postal</label>
                <input
                  id="service-point-postal-code"
                  inputMode="numeric"
                  autoComplete="postal-code"
                  maxLength={5}
                  value={postalCode}
                  onChange={(event) => {
                    setPostalCode(event.target.value.replace(/\D/g, "").slice(0, 5));
                    setSelectedServicePoint(null);
                    setServicePoints([]);
                    setServicePointError("");
                    setCheckoutError("");
                  }}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      void handleServicePointSearch();
                    }
                  }}
                  placeholder="13001"
                  className="focus-ring min-w-0 flex-1 rounded-xl border border-navy/15 px-4 py-3 text-sm"
                />
                <button
                  type="button"
                  onClick={() => void handleServicePointSearch()}
                  disabled={isSearchingServicePoints}
                  className="focus-ring inline-flex items-center gap-2 rounded-xl bg-navy px-4 py-3 text-xs font-bold text-white disabled:opacity-50"
                >
                  {isSearchingServicePoints ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                  <span className="hidden sm:inline">Rechercher</span>
                </button>
              </div>
              {servicePointError && <p role="alert" className="mt-3 text-xs font-semibold text-terracotta">{servicePointError}</p>}
              {servicePoints.length > 0 && (
                <div className="mt-4 max-h-72 space-y-2 overflow-y-auto pr-1">
                  {servicePoints.map((point) => {
                    const isSelected = selectedServicePoint?.id === point.id;
                    return (
                      <button
                        type="button"
                        key={point.id}
                        onClick={() => { setSelectedServicePoint(point); setCheckoutError(""); }}
                        className={`focus-ring flex w-full items-start gap-3 rounded-xl border p-3 text-left transition ${isSelected ? "border-sea bg-sea/5 ring-1 ring-sea" : "border-navy/10 hover:border-sea/50"}`}
                        aria-pressed={isSelected}
                      >
                        <MapPin className={`mt-0.5 h-4 w-4 shrink-0 ${isSelected ? "text-sea" : "text-navy/35"}`} />
                        <span className="min-w-0 flex-1">
                          <span className="block text-xs font-black">{point.name}</span>
                          <span className="mt-1 block text-[11px] leading-4 text-navy/50">{point.street} {point.houseNumber}, {point.postalCode} {point.city}</span>
                        </span>
                        {point.distance !== null && <span className="shrink-0 text-[10px] font-bold text-navy/40">{point.distance < 1000 ? `${Math.round(point.distance)} m` : `${(point.distance / 1000).toFixed(1)} km`}</span>}
                        {isSelected && <Check className="h-4 w-4 shrink-0 text-sea" />}
                      </button>
                    );
                  })}
                </div>
              )}
              {selectedServicePoint && (
                <div className="mt-3 rounded-xl bg-olive/10 px-3 py-2 text-xs text-olive">
                  <p className="flex items-center gap-2 font-bold">
                    <Check className="h-4 w-4" /> {selectedServicePoint.name} sélectionné
                  </p>
                  <p className="mt-1 leading-4 text-navy/55">Tes coordonnées et ton téléphone seront demandés sur la page de paiement.</p>
                </div>
              )}
            </section>
          )}
          <div className="mt-6 space-y-4 border-b border-navy/10 pb-6 text-sm"><div className="flex justify-between"><span className="text-navy/55">Sous-total</span><strong>{formatCurrency(subtotal)}</strong></div><div className="flex justify-between"><span className="text-navy/55">{getShippingLabel(shippingMethod)}</span><strong>{shipping === 0 ? "Offerte" : formatCurrency(shipping)}</strong></div></div>
          <div className="flex items-center justify-between py-6"><span className="font-bold">Total</span><span className="text-2xl font-black">{formatCurrency(total)}</span></div>
          <button type="button" onClick={handleCheckout} disabled={isCheckingOut} className="focus-ring flex w-full items-center justify-between rounded-full bg-sea px-6 py-4 text-sm font-bold text-white hover:bg-navy disabled:opacity-50">{isCheckingOut ? "Redirection…" : shippingMethod === "mondial-relay" && !selectedServicePoint ? "Choisir un relais pour continuer" : "Passer au paiement"}<ArrowRight className="h-4 w-4" /></button>
          {checkoutError && <p role="alert" className="mt-3 text-sm font-semibold text-terracotta">{checkoutError}</p>}
          <div className="mt-6 space-y-3 text-xs font-semibold text-navy/55"><p className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-olive" /> Paiement sécurisé</p><p className="flex items-center gap-2"><Truck className="h-4 w-4 text-sea" /> Point relais offert dès 60 €</p><p className="flex items-center gap-2"><Check className="h-4 w-4 text-sea" /> Expédition suivie</p></div>
        </aside>
      </div>
    </div>
  );
}
