"use client";

import { useMemo, useState } from "react";
import { ChevronDown, Download, Map as MapIcon, RotateCcw, Save, XCircle } from "lucide-react";

import { SIZE_ORDER } from "@/lib/constants";
import { formatCurrency } from "@/lib/utils";
import type { ContactMessage, Neighborhood, OrderSummary, Review, VoteSummary } from "@/lib/types";

type AdminDashboardProps = {
  neighborhoods: Neighborhood[];
  votes: VoteSummary[];
  orders: OrderSummary[];
  messages: ContactMessage[];
  reviews: Review[];
  demoMode: boolean;
  adminEmail?: string | null;
};

type InventoryState = Record<
  string,
  {
    price: number;
    isAvailable: boolean;
    catalogStatus: "available" | "project" | "idea";
    savedCatalogStatus: "available" | "project" | "idea";
    releaseDate: string;
    stockBySize: Record<string, number>;
    status: "idle" | "saving" | "saved" | "error";
    notificationStatus: "idle" | "sending" | "sent" | "error";
    notificationResult: string;
  }
>;

function OrderActions({ order }: { order: OrderSummary }) {
  const [state, setState] = useState(order.status);
  const [busy, setBusy] = useState(false);

  async function act(payload: { action: "set-status"; status: "preparing" | "shipped" | "delivered" | "returned" } | { action: "cancel" | "refund" }) {
    if (payload.action !== "set-status" && !window.confirm(payload.action === "refund" ? "Confirmer le remboursement intégral ?" : "Confirmer l’annulation de cette commande ?")) return;
    setBusy(true);
    try {
      const response = await fetch(`/api/admin/orders/${order.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json() as { status?: string };
      if (response.ok && result.status) setState(result.status);
    } finally {
      setBusy(false);
    }
  }

  return <div className="flex flex-wrap gap-2">
    <select disabled={busy} value={["preparing", "shipped", "delivered", "returned"].includes(state) ? state : ""} onChange={(event) => event.target.value && void act({ action: "set-status", status: event.target.value as "preparing" | "shipped" | "delivered" | "returned" })} className="rounded-lg border border-navy/10 px-2 py-1 text-xs">
      <option value="">{state}</option><option value="preparing">Préparation</option><option value="shipped">Expédiée</option><option value="delivered">Livrée</option><option value="returned">Retournée</option>
    </select>
    <button disabled={busy || state === "refunded"} onClick={() => void act({ action: "refund" })} className="rounded-lg border border-navy/10 p-2 text-terracotta" title="Rembourser"><RotateCcw className="h-4 w-4" /></button>
    <button disabled={busy || ["cancelled", "refunded"].includes(state)} onClick={() => void act({ action: "cancel" })} className="rounded-lg border border-navy/10 p-2 text-terracotta" title="Annuler"><XCircle className="h-4 w-4" /></button>
  </div>;
}

function EmailJobsButton() {
  const [result, setResult] = useState("");
  const [busy, setBusy] = useState(false);
  async function run() {
    setBusy(true); setResult("");
    const response = await fetch("/api/admin/email-jobs/run", { method: "POST" });
    const data = await response.json() as { configured?: boolean; sent?: number; failed?: number };
    setResult(!data.configured ? "Webhook e-mail non configuré" : `${data.sent ?? 0} envoyé(s), ${data.failed ?? 0} échec(s)`);
    setBusy(false);
  }
  return <div className="mt-4"><button type="button" disabled={busy} onClick={() => void run()} className="rounded-full bg-sand px-4 py-2 text-sm font-bold text-navy">{busy ? "Envoi…" : "Relancer les e-mails en attente"}</button>{result && <p role="status" className="mt-2 text-xs text-navy/60">{result}</p>}</div>;
}

export function AdminDashboard({
  neighborhoods,
  votes,
  orders,
  messages,
  reviews,
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
          catalogStatus: item.catalogStatus,
          savedCatalogStatus: item.catalogStatus,
          releaseDate: item.releaseDate ?? "",
          stockBySize: { ...item.stockBySize },
          status: "idle",
          notificationStatus: "idle",
          notificationResult: ""
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
  const neighborhoodsByArrondissement = useMemo(
    () => Array.from({ length: 16 }, (_, index) => {
      const arrondissement = index + 1;
      return {
        arrondissement,
        neighborhoods: neighborhoods
          .filter((item) => item.arrondissement === arrondissement)
          .sort((a, b) => a.name.localeCompare(b.name, "fr"))
      };
    }),
    [neighborhoods]
  );
  const sortedVotes = useMemo(
    () => [...votes].sort((a, b) => b.totalVotes - a.totalVotes || a.neighborhoodName.localeCompare(b.neighborhoodName, "fr")),
    [votes]
  );
  const votesByNeighborhood = useMemo(
    () => new Map(votes.map((item) => [item.neighborhoodId, item.totalVotes])),
    [votes]
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
          isAvailable: payload.catalogStatus === "available",
          catalogStatus: payload.catalogStatus,
          releaseDate: payload.releaseDate || null,
          stockBySize: payload.stockBySize
        })
      });

      if (!response.ok) {
        throw new Error("save_failed");
      }

      setInventory((current) => ({
        ...current,
        [neighborhoodId]: { ...current[neighborhoodId], status: "saved", savedCatalogStatus: current[neighborhoodId].catalogStatus }
      }));
    } catch {
      setInventory((current) => ({
        ...current,
        [neighborhoodId]: { ...current[neighborhoodId], status: "error" }
      }));
    }
  }

  async function notifyNeighborhoodVoters(neighborhoodId: string, neighborhoodName: string) {
    const voterCount = votesByNeighborhood.get(neighborhoodId) ?? 0;
    if (!window.confirm(`Envoyer l’annonce de disponibilité de ${neighborhoodName} aux ${voterCount} votant(s) ?`)) return;
    setInventory((current) => ({ ...current, [neighborhoodId]: { ...current[neighborhoodId], notificationStatus: "sending", notificationResult: "" } }));
    try {
      const response = await fetch(`/api/admin/neighborhoods/${neighborhoodId}/notify`, { method: "POST" });
      const result = await response.json() as { queued?: number; sent?: number; failed?: number; error?: string };
      if (!response.ok) throw new Error(result.error ?? "notification_failed");
      setInventory((current) => ({ ...current, [neighborhoodId]: { ...current[neighborhoodId], notificationStatus: "sent", notificationResult: `${result.queued ?? 0} notification(s) ajoutée(s), ${result.sent ?? 0} envoyée(s)` } }));
    } catch {
      setInventory((current) => ({ ...current, [neighborhoodId]: { ...current[neighborhoodId], notificationStatus: "error", notificationResult: "Envoi impossible" } }));
    }
  }

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      <section className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[24px] bg-navy p-6 text-white shadow-soft">
          <p className="text-xs font-bold uppercase tracking-[0.24em] text-sea">Espace 111</p>
          <h1 className="mt-3 text-3xl font-black">
            {demoMode ? "Vue de démonstration" : "Tableau de bord"}
          </h1>
          <p className="mt-3 text-sm text-white/60">
            {demoMode
              ? "Supabase n’est pas encore configuré. Les données affichées utilisent le mode démo."
              : `Session active pour ${adminEmail}.`}
          </p>
        </div>
        <div className="rounded-[24px] border border-navy/10 bg-white p-6 shadow-soft">
          <p className="text-xs uppercase tracking-[0.24em] text-sea">Disponibles</p>
          <p className="mt-3 font-display text-5xl text-navy">{availableCount}</p>
          <p className="mt-2 text-sm text-navy/65">Quartiers activés sur 111.</p>
          <EmailJobsButton />
        </div>
        <div className="rounded-[24px] border border-navy/10 bg-white p-6 shadow-soft">
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

      <section className="rounded-[24px] border border-navy/10 bg-white p-5 shadow-soft sm:p-7">
        <div className="mb-5"><p className="text-xs uppercase tracking-[0.24em] text-sea">Messages</p><h2 className="text-3xl font-black tracking-tight text-navy">Demandes reçues</h2></div>
        <div className="grid gap-3 md:grid-cols-2">{messages.length === 0 ? <p className="text-sm text-navy/60">Aucun message reçu.</p> : messages.map((message) => <article key={message.id} className="rounded-2xl bg-sand p-5"><p className="text-xs text-navy/45">{new Date(message.created_at).toLocaleDateString("fr-FR")} · {message.email}</p><h3 className="mt-2 font-black">{message.subject}</h3><p className="mt-2 whitespace-pre-wrap text-sm text-navy/65">{message.message}</p></article>)}</div>
      </section>

      <section className="rounded-[24px] border border-navy/10 bg-white p-5 shadow-soft sm:p-7">
        <div className="mb-5"><p className="text-xs uppercase tracking-[0.24em] text-sea">Avis clients</p><h2 className="text-3xl font-black tracking-tight text-navy">Modération</h2></div>
        <div className="grid gap-3 md:grid-cols-2">{reviews.length === 0 ? <p className="text-sm text-navy/60">Aucun avis reçu.</p> : reviews.map((review) => <article key={review.id} className="rounded-2xl bg-sand p-5"><p className="text-sm font-bold">{review.author_name} · {review.rating}/5 · {review.status}</p><p className="mt-2 text-sm text-navy/70">{review.body}</p>{review.status === "pending" && <div className="mt-4 flex gap-2"><button onClick={() => void fetch(`/api/admin/reviews/${review.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "published" }) }).then(() => window.location.reload())} className="rounded-full bg-olive px-4 py-2 text-xs font-bold text-white">Publier</button><button onClick={() => void fetch(`/api/admin/reviews/${review.id}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status: "rejected" }) }).then(() => window.location.reload())} className="rounded-full bg-white px-4 py-2 text-xs font-bold text-terracotta">Refuser</button></div>}</article>)}</div>
      </section>

      <section className="rounded-[24px] border border-navy/10 bg-white p-5 shadow-soft sm:p-7">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sea">Commandes</p>
            <h2 className="text-3xl font-black tracking-tight text-navy">Suivi des ventes</h2>
          </div>
          <p className="text-sm text-navy/60">Les 100 commandes les plus récentes.</p>
        </div>
        {orders.length === 0 ? (
          <p className="rounded-2xl bg-sand p-5 text-sm text-navy/60">Aucune commande enregistrée.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="border-b border-navy/10 text-xs uppercase tracking-wider text-navy/45">
                <tr><th className="p-3">Commande</th><th className="p-3">Client</th><th className="p-3">Articles</th><th className="p-3">Montant</th><th className="p-3">Logistique</th><th className="p-3">Actions</th></tr>
              </thead>
              <tbody className="divide-y divide-navy/10">
                {orders.map((order) => (
                  <tr key={order.id}>
                    <td className="p-3"><strong>{order.orderNumber}</strong><span className="mt-1 block text-xs text-navy/45">{new Intl.DateTimeFormat("fr-FR", { dateStyle: "short", timeStyle: "short" }).format(new Date(order.createdAt))}</span></td>
                    <td className="p-3">{order.email ?? "En attente"}</td>
                    <td className="p-3"><strong>{order.itemCount}</strong><span className="mt-1 block max-w-64 text-xs text-navy/45">{order.items.map((item) => `${item.name} · ${item.size} × ${item.quantity}`).join(" · ")}</span></td>
                    <td className="p-3 font-bold">{order.amountTotal === null ? "—" : formatCurrency(order.amountTotal / 100)}</td>
                    <td className="p-3 text-xs">{order.sendcloudImportedAt ? <span className="text-olive">Importée</span> : order.sendcloudError ? <span className="text-terracotta" title={order.sendcloudError}>Erreur Sendcloud</span> : "En attente"}{order.lastEvent && <span className="mt-1 block text-navy/40">{order.lastEvent.type} · {order.lastEvent.source}</span>}</td>
                    <td className="p-3"><OrderActions order={order} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <details className="group rounded-[24px] border border-navy/10 bg-white shadow-soft">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-5 sm:p-7 [&::-webkit-details-marker]:hidden">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sea">Stocks, carte & activations</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-navy">Gestion du catalogue</h2>
            <p className="mt-2 text-sm text-navy/55">{neighborhoods.length} quartiers · {availableCount} disponibles</p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand text-navy transition group-open:rotate-180"><ChevronDown className="h-5 w-5" /></span>
        </summary>

        <div className="space-y-3 border-t border-navy/10 p-4 sm:p-7">
          {neighborhoodsByArrondissement.map(({ arrondissement, neighborhoods: arrondissementNeighborhoods }) => (
            <details key={arrondissement} className="group/arrondissement overflow-hidden rounded-[22px] border border-navy/10 bg-foam/40">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 [&::-webkit-details-marker]:hidden">
                <div className="flex items-center gap-3">
                  <span className="grid h-9 min-w-9 place-items-center rounded-full bg-navy px-2 text-sm font-black text-white">{arrondissement}{arrondissement === 1 ? "er" : "e"}</span>
                  <div><h3 className="font-black text-navy">{arrondissement === 1 ? "Premier" : `${arrondissement}e`} arrondissement</h3><p className="text-xs text-navy/50">{arrondissementNeighborhoods.length} quartiers</p></div>
                </div>
                <ChevronDown className="h-5 w-5 text-sea transition group-open/arrondissement:rotate-180" />
              </summary>
              <div className="space-y-2 border-t border-navy/10 p-3 sm:p-4">
                {arrondissementNeighborhoods.map((item) => {
                  const state = inventory[item.id];
                  const statusLabel = state.catalogStatus === "available" ? "Disponible" : state.catalogStatus === "project" ? "En projet" : "À imaginer";
                  return (
                    <details key={item.id} className="group/quartier rounded-[18px] border border-navy/10 bg-white">
                      <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-4 [&::-webkit-details-marker]:hidden">
                        <div className="min-w-0"><h4 className="truncate text-lg font-black text-navy">{item.name}</h4><p className="mt-1 text-xs text-navy/50">{formatCurrency(state.price)} · {Object.values(state.stockBySize).reduce((sum, stock) => sum + stock, 0)} en stock</p></div>
                        <div className="flex items-center gap-3"><span className={`hidden rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider sm:inline ${state.catalogStatus === "available" ? "bg-sea/10 text-sea" : state.catalogStatus === "project" ? "bg-ochre/15 text-ochre" : "bg-navy/5 text-navy/50"}`}>{statusLabel}</span><ChevronDown className="h-4 w-4 text-navy/45 transition group-open/quartier:rotate-180" /></div>
                      </summary>
                      <div className="grid gap-5 border-t border-navy/10 p-4 lg:grid-cols-[1fr_auto]">
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    <label className="space-y-2 sm:col-span-2 lg:col-span-3">
                      <span className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-sea"><MapIcon className="h-3.5 w-3.5" /> Statut sur la carte</span>
                      <select value={state.catalogStatus} onChange={(event) => setInventory((current) => ({ ...current, [item.id]: { ...current[item.id], catalogStatus: event.target.value as "available" | "project" | "idea", isAvailable: event.target.value === "available" } }))} className="w-full rounded-2xl border border-navy/10 bg-foam px-3 py-3 text-sm font-bold text-navy outline-none">
                        <option value="available">Disponible</option><option value="project">En projet</option><option value="idea">À imaginer</option>
                      </select>
                    </label>
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
                      <span className="text-xs uppercase tracking-[0.18em] text-sea">Date de sortie</span>
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
                  <div className="flex flex-col items-stretch justify-end gap-3 lg:min-w-40">
                    <button
                      type="button"
                      onClick={() => saveNeighborhood(item.id)}
                      className="inline-flex items-center justify-center gap-2 rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white"
                    >
                      <Save className="h-4 w-4" />
                      Enregistrer
                    </button>
                    <p className="text-xs uppercase tracking-[0.18em] text-sea">
                      {state.status === "saving" && "Sauvegarde..."}
                      {state.status === "saved" && "Enregistré"}
                      {state.status === "error" && "Erreur"}
                    </p>
                    {state.catalogStatus === "available" && state.savedCatalogStatus === "available" && (
                      <><button type="button" disabled={state.notificationStatus === "sending" || (votesByNeighborhood.get(item.id) ?? 0) === 0} onClick={() => void notifyNeighborhoodVoters(item.id, item.name)} className="rounded-full border border-sea/25 bg-sea/10 px-4 py-3 text-xs font-bold text-sea disabled:cursor-not-allowed disabled:opacity-40">{state.notificationStatus === "sending" ? "Envoi…" : `Prévenir les votants (${votesByNeighborhood.get(item.id) ?? 0})`}</button>{state.notificationResult && <p role="status" className={`max-w-48 text-xs ${state.notificationStatus === "error" ? "text-terracotta" : "text-olive"}`}>{state.notificationResult}</p>}</>
                    )}
                  </div>
                      </div>
                    </details>
                  );
                })}
              </div>
            </details>
          ))}
        </div>
      </details>

      <details className="group rounded-[24px] border border-navy/10 bg-white shadow-soft">
        <summary className="flex cursor-pointer list-none items-center justify-between gap-5 p-5 sm:p-7 [&::-webkit-details-marker]:hidden">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sea">Votes email</p>
            <h2 className="mt-1 text-3xl font-black tracking-tight text-navy">Demandes de la communauté</h2>
            <p className="mt-2 text-sm text-navy/55">{totalVotes} votes enregistrés</p>
          </div>
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-sand text-navy transition group-open:rotate-180"><ChevronDown className="h-5 w-5" /></span>
        </summary>
        <div className="space-y-2 border-t border-navy/10 p-4 sm:p-7">
          <div className="divide-y divide-navy/10 overflow-hidden rounded-[18px] border border-navy/10 bg-sand/25">
            {sortedVotes.map((vote, index) => <div key={vote.neighborhoodId} className="grid grid-cols-[2.5rem_1fr_auto] items-center gap-3 px-4 py-3"><span className="text-center text-xs font-black text-navy/35">{index + 1}</span><div><span className="font-bold text-navy">{vote.neighborhoodName}</span><span className="ml-2 text-xs text-navy/40">{vote.arrondissement}{vote.arrondissement === 1 ? "er" : "e"}</span></div><span className="rounded-full bg-white px-3 py-1 text-xs font-bold text-sea">{vote.totalVotes} vote{vote.totalVotes === 1 ? "" : "s"}</span></div>)}
          </div>
        </div>
      </details>
    </div>
  );
}
