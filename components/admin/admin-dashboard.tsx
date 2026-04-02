"use client";

import { useMemo, useState } from "react";
import { Download, Save } from "lucide-react";

import { SIZE_ORDER } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { Neighborhood, VoteSummary } from "@/lib/types";

type AdminDashboardProps = {
  neighborhoods: Neighborhood[];
  votes: VoteSummary[];
  demoMode: boolean;
  adminEmail?: string | null;
};

type InventoryState = Record<
  string,
  {
    price: number;
    isAvailable: boolean;
    releaseDate: string;
    stockBySize: Record<string, number>;
    status: "idle" | "saving" | "saved" | "error";
  }
>;

export function AdminDashboard({
  neighborhoods,
  votes,
  demoMode,
  adminEmail
}: AdminDashboardProps) {
  const [inventory, setInventory] = useState<InventoryState>(() =>
    Object.fromEntries(
      neighborhoods.map((item) => [
        item.id,
        {
          price: item.price,
          isAvailable: item.isAvailable,
          releaseDate: item.releaseDate ?? "",
          stockBySize: { ...item.stockBySize },
          status: "idle"
        }
      ])
    )
  );

  const totalVotes = useMemo(
    () => votes.reduce((sum, item) => sum + item.totalVotes, 0),
    [votes]
  );
  const availableCount = useMemo(
    () => neighborhoods.filter((item) => inventory[item.id]?.isAvailable).length,
    [inventory, neighborhoods]
  );

  async function saveNeighborhood(neighborhoodId: string) {
    const payload = inventory[neighborhoodId];

    setInventory((current) => ({
      ...current,
      [neighborhoodId]: { ...current[neighborhoodId], status: "saving" }
    }));

    try {
      const response = await fetch(`/api/admin/neighborhoods/${neighborhoodId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          price: payload.price,
          isAvailable: payload.isAvailable,
          releaseDate: payload.releaseDate || null,
          stockBySize: payload.stockBySize
        })
      });

      if (!response.ok) {
        throw new Error("save_failed");
      }

      setInventory((current) => ({
        ...current,
        [neighborhoodId]: { ...current[neighborhoodId], status: "saved" }
      }));
    } catch {
      setInventory((current) => ({
        ...current,
        [neighborhoodId]: { ...current[neighborhoodId], status: "error" }
      }));
    }
  }

  return (
    <div className="space-y-6 pb-24 md:pb-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[30px] border border-navy/10 bg-white/75 p-5 shadow-soft backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-sea">Admin</p>
          <h1 className="mt-3 font-display text-4xl text-navy">
            {demoMode ? "Dashboard démo" : "Dashboard sécurisé"}
          </h1>
          <p className="mt-3 text-sm text-navy/70">
            {demoMode
              ? "Supabase n’est pas encore configuré. Les données affichées utilisent le mode démo."
              : `Session active pour ${adminEmail}.`}
          </p>
        </div>
        <div className="rounded-[30px] border border-navy/10 bg-white/75 p-5 shadow-soft backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-sea">Disponibles</p>
          <p className="mt-3 font-display text-5xl text-navy">{availableCount}</p>
          <p className="mt-2 text-sm text-navy/65">Quartiers activés sur 111.</p>
        </div>
        <div className="rounded-[30px] border border-navy/10 bg-white/75 p-5 shadow-soft backdrop-blur-xl">
          <p className="text-xs uppercase tracking-[0.24em] text-sea">Votes</p>
          <p className="mt-3 font-display text-5xl text-navy">{totalVotes}</p>
          <a
            href="/api/admin/export-votes"
            className="mt-3 inline-flex items-center gap-2 rounded-full bg-sand px-4 py-2 text-sm font-medium text-navy"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </a>
        </div>
      </section>

      <section className="rounded-[32px] border border-navy/10 bg-white/75 p-5 shadow-card backdrop-blur-xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sea">Stocks & activations</p>
            <h2 className="font-display text-4xl text-navy">Gestion catalogue</h2>
          </div>
          <p className="max-w-xl text-sm text-navy/60">
            Mise à jour des stocks par taille, prix, date de sortie et activation publique d’un quartier.
          </p>
        </div>

        <div className="space-y-4">
          {neighborhoods.map((item) => {
            const state = inventory[item.id];

            return (
              <div key={item.id} className="rounded-[28px] border border-navy/10 p-4">
                <div className="grid gap-4 lg:grid-cols-[1.2fr_1.4fr_auto]">
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-sea">
                      {item.arrondissement}e arrondissement
                    </p>
                    <h3 className="mt-2 text-2xl font-semibold text-navy">{item.name}</h3>
                    <p className="mt-2 text-sm text-navy/60">
                      Prix affiché: {formatCurrency(state.price)}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.18em] text-sea">Prix</span>
                      <input
                        type="number"
                        value={state.price}
                        onChange={(event) =>
                          setInventory((current) => ({
                            ...current,
                            [item.id]: {
                              ...current[item.id],
                              price: Number(event.target.value)
                            }
                          }))
                        }
                        className="w-full rounded-2xl border border-navy/10 bg-foam px-3 py-3 text-sm text-navy outline-none"
                      />
                    </label>

                    <label className="space-y-2">
                      <span className="text-xs uppercase tracking-[0.18em] text-sea">Release</span>
                      <input
                        type="date"
                        value={state.releaseDate}
                        onChange={(event) =>
                          setInventory((current) => ({
                            ...current,
                            [item.id]: {
                              ...current[item.id],
                              releaseDate: event.target.value
                            }
                          }))
                        }
                        className="w-full rounded-2xl border border-navy/10 bg-foam px-3 py-3 text-sm text-navy outline-none"
                      />
                    </label>

                    <label className="flex items-center gap-3 rounded-2xl border border-navy/10 bg-foam px-4 py-3">
                      <input
                        type="checkbox"
                        checked={state.isAvailable}
                        onChange={(event) =>
                          setInventory((current) => ({
                            ...current,
                            [item.id]: {
                              ...current[item.id],
                              isAvailable: event.target.checked
                            }
                          }))
                        }
                      />
                      <span className="text-sm font-medium text-navy">Actif publiquement</span>
                    </label>

                    {SIZE_ORDER.map((size) => (
                      <label key={size} className="space-y-2">
                        <span className="text-xs uppercase tracking-[0.18em] text-sea">{size}</span>
                        <input
                          type="number"
                          value={state.stockBySize[size]}
                          onChange={(event) =>
                            setInventory((current) => ({
                              ...current,
                              [item.id]: {
                                ...current[item.id],
                                stockBySize: {
                                  ...current[item.id].stockBySize,
                                  [size]: Number(event.target.value)
                                }
                              }
                            }))
                          }
                          className="w-full rounded-2xl border border-navy/10 bg-foam px-3 py-3 text-sm text-navy outline-none"
                        />
                      </label>
                    ))}
                  </div>

                  <div className="flex flex-col justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => saveNeighborhood(item.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white"
                    >
                      <Save className="h-4 w-4" />
                      Sauver
                    </button>
                    <p className="text-xs uppercase tracking-[0.18em] text-sea">
                      {state.status === "saving" && "Sauvegarde..."}
                      {state.status === "saved" && "Enregistré"}
                      {state.status === "error" && "Erreur"}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="rounded-[32px] border border-navy/10 bg-white/75 p-5 shadow-card backdrop-blur-xl">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sea">Votes email</p>
            <h2 className="font-display text-4xl text-navy">Demandes communauté</h2>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {votes
            .sort((a, b) => b.totalVotes - a.totalVotes)
            .map((vote) => (
              <div key={vote.neighborhoodId} className="rounded-[28px] border border-navy/10 bg-sand/35 p-4">
                <p className="text-xs uppercase tracking-[0.2em] text-sea">
                  {vote.arrondissement}e arrondissement
                </p>
                <h3 className="mt-2 text-2xl font-semibold text-navy">
                  {vote.neighborhoodName}
                </h3>
                <p className="mt-2 text-sm text-navy/70">{vote.totalVotes} votes enregistrés</p>
                <div className="mt-4 rounded-[22px] bg-white/75 p-3 text-sm text-navy/65">
                  {vote.emails.slice(0, 5).join(", ") || "Aucun email"}
                  {vote.emails.length > 5 ? "..." : ""}
                </div>
              </div>
            ))}
        </div>
      </section>
    </div>
  );
}
