import Link from "next/link";

import { AdminLoginForm } from "@/components/admin/admin-login-form";
import { hasSupabaseEnv } from "@/lib/supabase/server";

type AdminLoginPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const resolvedSearchParams = await searchParams;
  const demoMode = process.env.NODE_ENV !== "production" && (
    !hasSupabaseEnv() || resolvedSearchParams?.mode === "demo"
  );
  const configurationMissing = !hasSupabaseEnv();

  return (
    <div className="mx-auto grid min-h-[70vh] max-w-[1200px] gap-6 px-4 py-8 sm:px-6 lg:grid-cols-[0.95fr_1.05fr] lg:px-10 lg:py-12">
      <div className="rounded-[24px] bg-sea p-8 text-white shadow-card lg:p-10">
        <p className="text-xs font-bold uppercase tracking-[0.26em] text-sun">Espace 111</p>
        <h1 className="mt-4 text-5xl font-black uppercase leading-[0.95] tracking-[-0.04em]">Gérer la collection et les votes.</h1>
        <p className="mt-4 max-w-xl text-sm leading-7 text-white/72">
          L’espace de gestion des quartiers, des stocks et des envies de la communauté.
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

      {configurationMissing && !demoMode ? (
        <div className="rounded-[24px] border border-terracotta/20 bg-white p-6 shadow-soft">
          <p className="section-kicker">Service indisponible</p>
          <h2 className="mt-2 text-3xl font-black text-navy">Connexion temporairement indisponible</h2>
          <p className="mt-4 text-sm text-navy/70">La configuration sécurisée de l’administration est incomplète. Réessayez plus tard.</p>
        </div>
      ) : demoMode ? (
        <div className="rounded-[24px] border border-navy/10 bg-white p-6 shadow-soft">
          <p className="section-kicker">Mode démo</p>
          <h2 className="mt-2 text-3xl font-black text-navy">Données de démonstration</h2>
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
