import Link from "next/link";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { hasSupabaseEnv } from "@/lib/supabase/server";

type AdminLoginPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const demoMode = !hasSupabaseEnv() || searchParams?.mode === "demo";

  return (
    <div className="grid min-h-[70vh] gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[32px] bg-navy p-8 text-white shadow-card">
        <p className="text-xs uppercase tracking-[0.26em] text-sun">Back-office</p>
        <h1 className="mt-4 font-display text-6xl">Gérer les drops, les stocks et les votes.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
          Cette interface sécurise l’activation des quartiers et donne une lecture directe de la traction email par arrondissement.
        </p>
        {demoMode && (
          <Link
            href="/admin"
            className="mt-6 inline-flex rounded-full bg-sun px-6 py-3 text-sm font-semibold text-navy"
          >
            Ouvrir le mode démo
          </Link>
        )}
      </div>

      {demoMode ? (
        <div className="rounded-[32px] border border-navy/10 bg-white/75 p-6 shadow-card backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.26em] text-sea">Mode démo</p>
          <h2 className="mt-2 font-display text-4xl text-navy">Supabase non configuré</h2>
          <p className="mt-4 text-sm text-navy/70">
            Configurez `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` et `SUPABASE_SERVICE_ROLE_KEY` pour activer l’auth admin réelle.
          </p>
        </div>
      ) : (
        <AdminLoginForm />
      )}
    </div>
  );
}
