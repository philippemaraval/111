"use client";

import { useState, type FormEvent } from "react";
import type { Size } from "@/lib/types";

export function StockAlertForm({ neighborhoodId, unavailableSizes }: { neighborhoodId: string; unavailableSizes: Size[] }) {
  const [email, setEmail] = useState(""); const [size, setSize] = useState<Size>(unavailableSizes[0]); const [sent, setSent] = useState(false);
  if (unavailableSizes.length === 0) return null;
  async function submit(event: FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/stock-alerts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ neighborhoodId, size, email }) });
    if (response.ok) setSent(true);
  }
  if (sent) return <p className="mt-4 rounded-xl bg-olive/10 p-3 text-xs font-bold text-olive">Alerte enregistrée pour la taille {size}.</p>;
  return <details className="mt-4"><summary className="cursor-pointer text-xs font-bold text-sea underline">Une taille est épuisée ?</summary><form onSubmit={submit} className="mt-3 grid grid-cols-[auto_1fr_auto] gap-2"><select value={size} onChange={(event) => setSize(event.target.value as Size)} className="rounded-lg border px-2 text-xs">{unavailableSizes.map((item) => <option key={item}>{item}</option>)}</select><input required type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="Votre e-mail" className="min-w-0 rounded-lg border px-3 py-2 text-xs" /><button className="rounded-lg bg-navy px-3 text-xs font-bold text-white">Prévenir</button></form></details>;
}
