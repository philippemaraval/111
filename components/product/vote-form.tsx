"use client";

import { useState, type FormEvent } from "react";

type VoteFormProps = {
  neighborhoodId: string;
  neighborhoodName: string;
};

export function VoteForm({ neighborhoodId, neighborhoodName }: VoteFormProps) {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "success" | "duplicate" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setState("loading");

    try {
      const response = await fetch("/api/votes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          email,
          neighborhoodId
        })
      });

      const payload = (await response.json()) as { duplicate?: boolean };

      if (!response.ok) {
        throw new Error("vote_failed");
      }

      setState(payload.duplicate ? "duplicate" : "success");
      setEmail("");
    } catch {
      setState("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-[28px] border border-navy/10 bg-white/80 p-5">
      <div>
        <p className="text-xs uppercase tracking-[0.22em] text-sea">Vote communauté</p>
        <h2 className="mt-2 font-display text-3xl text-navy">
          Activer {neighborhoodName}
        </h2>
      </div>
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="votre@email.fr"
        className="w-full rounded-2xl border border-navy/10 bg-foam px-4 py-3 text-sm text-navy outline-none"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-full bg-terracotta px-5 py-3 text-sm font-semibold uppercase tracking-[0.18em] text-white"
      >
        {state === "loading" ? "Envoi..." : "Voter et recevoir l’alerte"}
      </button>
      {state === "success" && (
        <p className="text-sm text-olive">Vote enregistré. Vous serez prévenu au lancement.</p>
      )}
      {state === "duplicate" && (
        <p className="text-sm text-sea">Adresse déjà enregistrée pour ce quartier.</p>
      )}
      {state === "error" && (
        <p className="text-sm text-terracotta">Impossible d’enregistrer le vote pour le moment.</p>
      )}
    </form>
  );
}
