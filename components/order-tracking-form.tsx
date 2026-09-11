"use client";

import { useState, type FormEvent } from "react";

type Result = { orderNumber: string; status: string; shippingStatus: string; updatedAt: string };

export function OrderTrackingForm() {
  const [orderNumber, setOrderNumber] = useState("");
  const [email, setEmail] = useState("");
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent) {
    event.preventDefault(); setLoading(true); setError(""); setResult(null);
    try {
      const response = await fetch("/api/order-tracking", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ orderNumber, email }) });
      const payload = await response.json() as Result & { error?: string };
      if (!response.ok) throw new Error(payload.error ?? "Recherche indisponible.");
      setResult(payload);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Recherche indisponible.");
    } finally { setLoading(false); }
  }

  return <form onSubmit={submit} className="mx-auto max-w-xl rounded-[28px] bg-sand p-6 sm:p-8">
    <label className="block text-sm font-bold">Numéro de commande<input required value={orderNumber} onChange={(event) => setOrderNumber(event.target.value.toUpperCase())} placeholder="111-AB12CD34" className="focus-ring mt-2 w-full rounded-xl border border-navy/15 px-4 py-3" /></label>
    <label className="mt-5 block text-sm font-bold">E-mail de commande<input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="focus-ring mt-2 w-full rounded-xl border border-navy/15 px-4 py-3" /></label>
    <button disabled={loading} className="mt-6 w-full rounded-full bg-sea px-5 py-4 font-bold text-white disabled:opacity-50">{loading ? "Recherche…" : "Suivre ma commande"}</button>
    {error && <p role="alert" className="mt-4 text-sm font-bold text-terracotta">{error}</p>}
    {result && <div className="mt-5 rounded-2xl bg-white p-5"><p className="font-black">{result.orderNumber}</p><p className="mt-2 text-sm">Commande : <strong>{result.status}</strong></p><p className="text-sm">Livraison : <strong>{result.shippingStatus}</strong></p></div>}
  </form>;
}
