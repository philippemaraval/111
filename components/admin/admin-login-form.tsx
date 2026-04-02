"use client";

import { useState, type FormEvent } from "react";

import { createBrowserSupabaseClient } from "@/lib/supabase/client";
import { getSiteUrl } from "@/lib/utils";

export function AdminLoginForm() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "loading" | "sent" | "error">("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const supabase = createBrowserSupabaseClient();

    if (!supabase) {
      setState("error");
      return;
    }

    setState("loading");

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/admin`
      }
    });

    setState(error ? "error" : "sent");
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 rounded-[32px] border border-navy/10 bg-white/75 p-6 shadow-card backdrop-blur-xl">
      <div>
        <p className="text-xs uppercase tracking-[0.26em] text-sea">Admin sécurisé</p>
        <h1 className="mt-2 font-display text-5xl text-navy">Connexion</h1>
        <p className="mt-3 text-sm text-navy/70">
          Authentification Supabase par magic link. Seuls les emails autorisés dans `ADMIN_EMAILS` accèdent au dashboard.
        </p>
      </div>
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="admin@marseille111.fr"
        className="w-full rounded-2xl border border-navy/10 bg-foam px-4 py-3 text-sm text-navy outline-none"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="w-full rounded-full bg-navy px-5 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white"
      >
        {state === "loading" ? "Envoi..." : "Recevoir le lien"}
      </button>
      {state === "sent" && (
        <p className="text-sm text-olive">Lien envoyé. Vérifiez votre boîte mail.</p>
      )}
      {state === "error" && (
        <p className="text-sm text-terracotta">
          Impossible de démarrer l’authentification. Vérifiez la configuration Supabase.
        </p>
      )}
    </form>
  );
}
