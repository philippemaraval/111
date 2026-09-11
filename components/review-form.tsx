"use client";

import { useState } from "react";

export function ReviewForm({ neighborhoods }: { neighborhoods: Array<{ id: string; name: string }> }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("sending"); setError("");
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/reviews", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({
      orderNumber: form.get("orderNumber"), email: form.get("email"), neighborhoodId: form.get("neighborhoodId"),
      authorName: form.get("authorName"), rating: Number(form.get("rating")), body: form.get("body")
    }) });
    const result = await response.json() as { error?: string };
    if (!response.ok) { setError(result.error ?? "Envoi impossible."); setState("idle"); return; }
    setState("sent"); event.currentTarget.reset();
  }
  return <form onSubmit={submit} className="mx-auto grid max-w-2xl gap-4 rounded-3xl bg-sand p-6 text-left sm:grid-cols-2 sm:p-8">
    <label className="text-sm font-bold">Référence de commande<input required name="orderNumber" placeholder="111-XXXXXXXX" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
    <label className="text-sm font-bold">E-mail de commande<input required type="email" name="email" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
    <label className="text-sm font-bold">Prénom ou pseudonyme<input required name="authorName" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
    <label className="text-sm font-bold">Note<select required name="rating" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal">{[5,4,3,2,1].map((n) => <option key={n} value={n}>{n} / 5</option>)}</select></label>
    <label className="text-sm font-bold sm:col-span-2">Quartier<select required name="neighborhoodId" className="mt-2 w-full rounded-xl border px-4 py-3 font-normal">{neighborhoods.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
    <label className="text-sm font-bold sm:col-span-2">Votre avis<textarea required minLength={10} maxLength={1200} name="body" rows={5} className="mt-2 w-full rounded-xl border px-4 py-3 font-normal" /></label>
    <button disabled={state === "sending"} className="rounded-full bg-sea px-5 py-4 font-bold text-white sm:col-span-2">{state === "sending" ? "Envoi…" : "Envoyer mon avis"}</button>
    {state === "sent" && <p role="status" className="text-sm font-bold text-olive sm:col-span-2">Merci. Votre avis sera visible après modération.</p>}
    {error && <p role="alert" className="text-sm font-bold text-terracotta sm:col-span-2">{error}</p>}
  </form>;
}
