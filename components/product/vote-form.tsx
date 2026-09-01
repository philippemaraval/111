"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";

export function VoteForm({
  neighborhoodId,
  neighborhoodName,
  voteCount
}: {
  neighborhoodId: string;
  neighborhoodName: string;
  voteCount: number;
}) {
  const [email, setEmail] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading");
    try {
      const response = await fetch("/api/votes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, neighborhoodId, newsletterConsent }) });
      const payload = (await response.json()) as { duplicate?: boolean };
      if (!response.ok) throw new Error("vote_failed");
      setState(payload.duplicate ? "duplicate" : "success"); setEmail("");
    } catch { setState("error"); }
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-sand p-5 sm:p-6">
      <div className="flex items-center justify-between gap-4">
        <Heart className="h-6 w-6 text-terracotta" />
        <p className="rounded-full bg-white px-3 py-2 text-xs font-bold text-navy">
          {voteCount} {voteCount > 1 ? "votes" : "vote"}
        </p>
      </div>
      <h2 className="mt-5 text-2xl font-black tracking-tight">Fais entrer {neighborhoodName} dans la collection.</h2>
      <p className="mt-2 text-sm leading-6 text-navy/60">Ton vote nous aide à choisir le prochain quartier. Tu seras prévenu en premier s’il est lancé.</p>
      <label className="mt-5 block text-xs font-bold uppercase tracking-[0.15em]" htmlFor="vote-email">Ton adresse e-mail</label>
      <input id="vote-email" type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.fr" className="focus-ring mt-2 w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm" />
      <p className="mt-2 text-xs leading-5 text-navy/50">Ton adresse sert à enregistrer le vote et à te prévenir si ce quartier est lancé. Elle ne t’inscrit pas automatiquement à la newsletter. <Link href="/confidentialite" className="font-bold underline underline-offset-2 hover:text-sea">En savoir plus</Link>.</p>
      <label className="mt-4 flex items-start gap-3 text-xs leading-5 text-navy/65">
        <input type="checkbox" checked={newsletterConsent} onChange={(event) => setNewsletterConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-sea" />
        <span>J’accepte de recevoir occasionnellement les nouvelles de 111 par e-mail. Je pourrai me désinscrire à tout moment.</span>
      </label>
      <button type="submit" disabled={state === "loading"} className="focus-ring mt-3 w-full rounded-full bg-terracotta px-5 py-3.5 text-sm font-bold text-white hover:bg-navy">{state === "loading" ? "Vote en cours…" : "Je vote pour ce quartier"}</button>
      {state === "success" && <p className="mt-3 text-sm font-semibold text-olive">Merci ! Ton vote est enregistré.</p>}
      {state === "duplicate" && <p className="mt-3 text-sm font-semibold text-sea">Ton vote était déjà enregistré.</p>}
      {state === "error" && <p className="mt-3 text-sm font-semibold text-terracotta">Une erreur est survenue. Réessaie dans un instant.</p>}
    </form>
  );
}
