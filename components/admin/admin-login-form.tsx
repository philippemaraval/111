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
    <form onSubmit={handleSubmit} className="space-y-5 rounded-[24px] border border-navy/10 bg-white p-7 shadow-soft lg:p-10">
      <div>
        <p className="section-kicker">Accès sécurisé</p>
        <h1 className="mt-2 text-4xl font-black tracking-tight text-navy">Connexion</h1>
        <p className="mt-3 text-sm text-navy/70">
          Recevez un lien de connexion à usage unique sur votre adresse autorisée.
        </p>
      </div>
      <input
        type="email"
        required
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        placeholder="admin@marseille111.fr"
        className="focus-ring w-full rounded-xl border border-navy/15 bg-white px-4 py-3.5 text-sm text-navy"
      />
      <button
        type="submit"
        disabled={state === "loading"}
        className="focus-ring w-full rounded-full bg-sea px-5 py-4 text-sm font-bold text-white hover:bg-navy"
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
