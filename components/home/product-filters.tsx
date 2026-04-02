"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { ARRONDISSEMENTS } from "@/lib/constants";
import { buildSearchParams } from "@/lib/utils";

export function ProductFilters() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  function updateParam(key: string, value: string | null) {
    const next = buildSearchParams(searchParams, { [key]: value });
    router.push(next ? `${pathname}?${next}` : pathname);
  }

  return (
    <div className="grid gap-4 rounded-[32px] border border-navy/10 bg-white/70 p-5 shadow-soft backdrop-blur-xl md:grid-cols-4">
      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-sea">Recherche</span>
        <input
          defaultValue={searchParams.get("q") ?? ""}
          onChange={(event) => updateParam("q", event.target.value || null)}
          placeholder="Le Panier, Mazargues..."
          className="w-full rounded-2xl border border-navy/10 bg-foam px-4 py-3 text-sm text-navy outline-none"
        />
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-sea">Arrondissement</span>
        <select
          defaultValue={searchParams.get("arrondissement") ?? ""}
          onChange={(event) => updateParam("arrondissement", event.target.value || null)}
          className="w-full rounded-2xl border border-navy/10 bg-foam px-4 py-3 text-sm text-navy outline-none"
        >
          <option value="">Tous</option>
          {ARRONDISSEMENTS.map((item) => (
            <option key={item.value} value={item.value}>
              {item.label}
            </option>
          ))}
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-sea">Disponibilité</span>
        <select
          defaultValue={searchParams.get("availability") ?? "all"}
          onChange={(event) => updateParam("availability", event.target.value || null)}
          className="w-full rounded-2xl border border-navy/10 bg-foam px-4 py-3 text-sm text-navy outline-none"
        >
          <option value="all">Tout voir</option>
          <option value="available">Disponible</option>
          <option value="coming-soon">Coming soon</option>
        </select>
      </label>

      <label className="space-y-2">
        <span className="text-xs uppercase tracking-[0.2em] text-sea">Tri</span>
        <select
          defaultValue={searchParams.get("sort") ?? "popular"}
          onChange={(event) => updateParam("sort", event.target.value || null)}
          className="w-full rounded-2xl border border-navy/10 bg-foam px-4 py-3 text-sm text-navy outline-none"
        >
          <option value="popular">Popularité</option>
          <option value="recent">Plus récent</option>
          <option value="name">Nom</option>
        </select>
      </label>
    </div>
  );
}
