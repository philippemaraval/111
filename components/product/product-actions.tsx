"use client";

import { Heart, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

const FAVORITES_KEY = "marseille-111-favorites";

export function ProductActions({ slug, name }: { slug: string; name: string }) {
  const [favorite, setFavorite] = useState(false);
  const [shared, setShared] = useState(false);

  useEffect(() => {
    const favorites = JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[];
    // Hydratation client uniquement des favoris conservés dans le navigateur.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setFavorite(favorites.includes(slug));
  }, [slug]);

  function toggleFavorite() {
    const favorites = new Set(JSON.parse(window.localStorage.getItem(FAVORITES_KEY) ?? "[]") as string[]);
    if (favorites.has(slug)) favorites.delete(slug); else favorites.add(slug);
    window.localStorage.setItem(FAVORITES_KEY, JSON.stringify([...favorites]));
    setFavorite(favorites.has(slug));
  }

  async function share() {
    const url = window.location.href;
    if (navigator.share) await navigator.share({ title: `T-shirt 111 ${name}`, url });
    else await navigator.clipboard.writeText(url);
    setShared(true); window.setTimeout(() => setShared(false), 1800);
  }

  return <div className="mt-4 grid grid-cols-2 gap-2">
    <button type="button" onClick={toggleFavorite} aria-pressed={favorite} className="focus-ring flex items-center justify-center gap-2 rounded-full border border-navy/15 px-4 py-3 text-xs font-bold"><Heart className={`h-4 w-4 ${favorite ? "fill-terracotta text-terracotta" : ""}`} />{favorite ? "Dans mes favoris" : "Ajouter aux favoris"}</button>
    <button type="button" onClick={() => void share()} className="focus-ring flex items-center justify-center gap-2 rounded-full border border-navy/15 px-4 py-3 text-xs font-bold"><Share2 className="h-4 w-4" />{shared ? "Lien copié" : "Partager"}</button>
  </div>;
}
