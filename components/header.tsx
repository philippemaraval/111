"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Menu, Search, ShoppingBag, X } from "lucide-react";

import { LogoMark } from "@/components/logo-mark";
import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";
import type { SearchIndexItem } from "@/lib/types";

type HeaderProps = {
  availableCount: number;
  searchIndex: SearchIndexItem[];
};

export function Header({ availableCount, searchIndex }: HeaderProps) {
  const [query, setQuery] = useState("");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { itemCount, openDrawer } = useCart();

  const suggestions = useMemo(() => {
    const value = query.trim().toLowerCase();
    return searchIndex
      .filter((item) => !value || item.name.toLowerCase().includes(value))
      .slice(0, 6);
  }, [query, searchIndex]);

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-xl">
      <div className="bg-navy px-4 py-2 text-center text-[10px] font-bold uppercase tracking-[0.2em] text-white sm:text-xs">
        Imaginé à Marseille · Séries courtes · Livraison offerte dès 90 €
      </div>
      <div className="mx-auto flex h-[74px] max-w-[1440px] items-center justify-between gap-5 border-b border-navy/10 px-4 sm:px-6 lg:px-10">
        <button
          type="button"
          className="focus-ring rounded-full p-2 text-navy lg:hidden"
          onClick={() => setIsMenuOpen((value) => !value)}
          aria-label={isMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
          aria-expanded={isMenuOpen}
        >
          {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </button>

        <Link href="/" className="focus-ring rounded-md text-sea" aria-label="111, accueil">
          <LogoMark className="h-12 w-12" />
        </Link>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Navigation principale">
          <Link href="/#collection" className="text-sm font-semibold text-navy hover:text-sea">La collection</Link>
          <Link href="/#carte" className="text-sm font-semibold text-navy hover:text-sea">Les quartiers</Link>
          <Link href="/histoire" className="text-sm font-semibold text-navy hover:text-sea">Notre histoire</Link>
        </nav>

        <div className="ml-auto flex items-center gap-1 sm:gap-2 lg:ml-0">
          <button
            type="button"
            onClick={() => setIsSearchOpen((value) => !value)}
            className="focus-ring rounded-full p-3 text-navy hover:bg-sand"
            aria-label="Rechercher un quartier"
            aria-expanded={isSearchOpen}
          >
            <Search className="h-5 w-5" />
          </button>
          <button
            type="button"
            onClick={openDrawer}
            className="focus-ring relative flex items-center gap-2 rounded-full bg-navy px-4 py-3 text-sm font-semibold text-white hover:bg-sea"
          >
            <ShoppingBag className="h-4 w-4" />
            <span className="hidden sm:inline">Panier</span>
            {itemCount > 0 && (
              <span className="grid min-w-5 place-items-center rounded-full bg-sun px-1.5 py-0.5 text-[10px] text-navy">{itemCount}</span>
            )}
          </button>
        </div>
      </div>

      <div className={cn("border-b border-navy/10 bg-white px-4 transition-all", isSearchOpen ? "max-h-80 py-4 opacity-100" : "max-h-0 overflow-hidden py-0 opacity-0")}>
        <div className="relative mx-auto max-w-2xl">
          <Search className="absolute left-4 top-3.5 h-5 w-5 text-navy/40" />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Chercher votre quartier…"
            className="focus-ring w-full rounded-full border border-navy/15 bg-white py-3 pl-12 pr-5 text-sm"
            autoFocus={isSearchOpen}
          />
          <div className="mt-3 grid gap-1 sm:grid-cols-2">
            {suggestions.map((item) => (
              <Link key={item.id} href={`/quartier/${item.slug}`} onClick={() => setIsSearchOpen(false)} className="rounded-xl px-3 py-2 text-sm font-semibold hover:bg-sand">
                {item.name} <span className="font-normal text-navy/45">· {item.arrondissement}<sup>e</sup></span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      <nav className={cn("absolute inset-x-0 border-b border-navy/10 bg-white p-5 shadow-card lg:hidden", isMenuOpen ? "block" : "hidden")}>
        <div className="mx-auto flex max-w-7xl flex-col gap-1">
          {[["La collection", "/#collection"], ["Les quartiers", "/#carte"], ["Notre histoire", "/histoire"]].map(([label, href]) => (
            <Link key={href} href={href} onClick={() => setIsMenuOpen(false)} className="rounded-xl px-4 py-3 text-lg font-semibold hover:bg-sand">{label}</Link>
          ))}
          <p className="px-4 pt-3 text-xs text-navy/45">{availableCount} quartier{availableCount > 1 ? "s" : ""} disponible{availableCount > 1 ? "s" : ""}</p>
        </div>
      </nav>
    </header>
  );
}
