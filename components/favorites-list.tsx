"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { SearchIndexItem } from "@/lib/types";

export function FavoritesList({ neighborhoods }: { neighborhoods: SearchIndexItem[] }) {
  const [slugs, setSlugs] = useState<string[] | null>(null);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSlugs(JSON.parse(window.localStorage.getItem("marseille-111-favorites") ?? "[]") as string[]);
  }, []);
  if (slugs === null) return <p>Chargement…</p>;
  const favorites = neighborhoods.filter((item) => slugs.includes(item.slug));
  if (favorites.length === 0) return <p className="rounded-2xl bg-sand p-6 text-navy/60">Aucun favori pour le moment.</p>;
  return <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{favorites.map((item) => <Link key={item.id} href={`/quartier/${item.slug}`} className="rounded-2xl border border-navy/10 p-6 hover:border-sea"><p className="text-xs font-bold text-sea">{item.arrondissement}e arrondissement</p><h2 className="mt-2 text-2xl font-black">{item.name}</h2></Link>)}</div>;
}
