"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { Heart, Share2 } from "lucide-react";

export function VoteForm({
  neighborhoodId,
  neighborhoodName,
  voteCount,
  rank,
  nextRank,
  compact = false
}: {
  neighborhoodId: string;
  neighborhoodName: string;
  voteCount: number;
  rank?: number | null;
  nextRank?: number | null;
  compact?: boolean;
}) {
  const [email, setEmail] = useState("");
  const [newsletterConsent, setNewsletterConsent] = useState(false);
  const [state, setState] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");
  const [shared, setShared] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("loading");
    try {
      const response = await fetch("/api/votes", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email, neighborhoodId, newsletterConsent }) });
      const payload = (await response.json()) as { duplicate?: boolean };
      if (!response.ok) throw new Error("vote_failed");
      setState(payload.duplicate ? "duplicate" : "success"); setEmail("");
    } catch { setState("error"); }
  }

  async function shareVote() {
    const url = window.location.href;
    const title = `Fais gagner ${neighborhoodName} sur 111 Marseille`;
    if (navigator.share) await navigator.share({ title, url });
    else await navigator.clipboard.writeText(url);
    setShared(true);
    window.setTimeout(() => setShared(false), 1800);
  }

  const displayedVoteCount = voteCount + (state === "success" ? 1 : 0);
  const displayedRank = state === "success" ? nextRank : rank;

  return (
    <form onSubmit={handleSubmit} className={`rounded-2xl p-5 text-navy sm:p-6 ${compact ? "bg-white" : "bg-sand"}`}>
      <div className="flex items-center justify-between gap-4">
        <Heart className="h-6 w-6 text-terracotta" />
        <p className={`rounded-full px-3 py-2 text-xs font-bold text-navy ${compact ? "bg-sand" : "bg-white"}`}>
          {displayedVoteCount} {displayedVoteCount > 1 ? "votes" : "vote"}
        </p>
      </div>
      <h2 className="mt-5 text-2xl font-black tracking-tight">Vote pour {neighborhoodName}.</h2>
      <p className="mt-2 text-sm leading-6 text-navy/60">Un e-mail suffit. Tu seras prévenu en priorité si son tee‑shirt rejoint la collection.</p>
      <label className="mt-5 block text-xs font-bold uppercase tracking-[0.15em]" htmlFor={`vote-email-${neighborhoodId}`}>Ton e-mail</label>
      <input id={`vote-email-${neighborhoodId}`} type="email" inputMode="email" autoComplete="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="vous@exemple.fr" className="focus-ring mt-2 w-full rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm" />
      <p className="mt-2 text-xs leading-5 text-navy/50">Utilisé uniquement pour valider ce vote et t’avertir du lancement. <Link href="/confidentialite" className="font-bold underline underline-offset-2 hover:text-sea">Confidentialité</Link>.</p>
      <details className="mt-4 rounded-xl border border-navy/10 bg-white/70 px-4 py-3 text-xs text-navy/65">
        <summary className="cursor-pointer font-bold text-navy">Recevoir aussi les nouvelles de 111 <span className="font-normal text-navy/45">(facultatif)</span></summary>
        <label className="mt-3 flex items-start gap-3 leading-5">
          <input type="checkbox" checked={newsletterConsent} onChange={(event) => setNewsletterConsent(event.target.checked)} className="mt-1 h-4 w-4 shrink-0 accent-sea" />
          <span>J’accepte de recevoir occasionnellement les nouvelles de 111 par e-mail. Je pourrai me désinscrire à tout moment.</span>
        </label>
      </details>
      <button type="submit" disabled={state === "loading"} className="focus-ring mt-4 w-full rounded-full bg-terracotta px-5 py-3.5 text-sm font-bold text-white hover:bg-navy disabled:cursor-wait disabled:opacity-70">{state === "loading" ? "Vote en cours…" : `Voter pour ${neighborhoodName}`}</button>
      {state === "success" && (
        <div className="mt-4 rounded-xl bg-white p-4">
          <p className="text-sm font-bold text-olive">Ton vote est enregistré.</p>
          <p className="mt-1 text-sm leading-6 text-navy/65">
            {neighborhoodName} passe à {displayedVoteCount} vote{displayedVoteCount > 1 ? "s" : ""}{displayedRank ? ` et occupe la ${displayedRank}${displayedRank === 1 ? "re" : "e"} place.` : "."}
          </p>
          <button type="button" onClick={() => void shareVote()} className="focus-ring mt-3 inline-flex items-center gap-2 rounded-full border border-navy/10 px-4 py-2 text-xs font-bold hover:border-sea hover:text-sea">
            <Share2 className="h-4 w-4" /> {shared ? "Lien copié" : "Faire voter mes voisins"}
          </button>
        </div>
      )}
      {state === "duplicate" && <p role="status" className="mt-3 text-sm font-semibold text-sea">Ton vote était déjà enregistré.</p>}
      {state === "error" && <p role="alert" className="mt-3 text-sm font-semibold text-terracotta">Une erreur est survenue. Réessaie dans un instant.</p>}
    </form>
  );
}
