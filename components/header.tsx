"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Menu, Search, ShoppingBag, MapPinned } from "lucide-react";

import { useCart } from "@/contexts/cart-context";
import { buildSearchParams, cn } from "@/lib/utils";
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

    if (!value) {
      return searchIndex.slice(0, 6);
    }

    return searchIndex
      .filter((item) => item.name.toLowerCase().includes(value))
      .slice(0, 6);
  }, [query, searchIndex]);

  return (
    <header className="sticky top-0 z-40 border-b border-navy/10 bg-foam/85 backdrop-blur-xl">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 md:px-6">
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded-full border border-navy/15 p-2 text-navy md:hidden"
            onClick={() => setIsMenuOpen((value) => !value)}
            aria-label="Ouvrir le menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link href="/" className="group flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-terracotta text-sm font-semibold uppercase tracking-[0.28em] text-foam shadow-soft">
              111
            </div>
            <div>
              <p className="font-display text-xl leading-none text-navy">Quartiers Marseille</p>
              <p className="mt-1 text-xs uppercase tracking-[0.28em] text-sea">
                {availableCount} / 111 quartiers disponibles
              </p>
            </div>
          </Link>
        </div>

        <div className="relative hidden flex-1 md:block">
          <div className="glass-panel flex items-center gap-3 rounded-full px-4 py-3 shadow-soft">
            <Search className="h-4 w-4 text-sea" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onFocus={() => setIsSearchOpen(true)}
              onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 120)}
              placeholder="Trouver un quartier..."
              className="w-full bg-transparent text-sm text-navy outline-none placeholder:text-navy/45"
            />
          </div>

          {isSearchOpen && (
            <div className="absolute left-0 right-0 top-[calc(100%+0.75rem)] rounded-3xl border border-navy/10 bg-white p-3 shadow-card">
              <div className="space-y-2">
                {suggestions.map((item) => (
                  <Link
                    key={item.id}
                    href={`/quartier/${item.slug}`}
                    className="flex items-center justify-between rounded-2xl px-3 py-2 hover:bg-sand"
                  >
                    <div>
                      <p className="text-sm font-semibold text-navy">{item.name}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-sea">
                        {item.arrondissement}e arrondissement
                      </p>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-[11px] uppercase tracking-[0.16em]",
                        item.isAvailable
                          ? "bg-olive/15 text-olive"
                          : "bg-terracotta/10 text-terracotta"
                      )}
                    >
                      {item.isAvailable ? "Disponible" : "Coming soon"}
                    </span>
                  </Link>
                ))}
                {suggestions.length === 0 && query && (
                  <p className="px-3 py-2 text-sm text-navy/60">
                    Aucun quartier ne correspond à cette recherche.
                  </p>
                )}
              </div>
              {query && (
                <Link
                  href={`/?${buildSearchParams(new URLSearchParams(), { q: query })}`}
                  className="mt-3 flex items-center justify-between rounded-2xl bg-sand px-3 py-3 text-sm font-medium text-navy hover:bg-sand/80"
                >
                  <span>Afficher tout le catalogue filtré</span>
                  <MapPinned className="h-4 w-4 text-sea" />
                </Link>
              )}
            </div>
          )}
        </div>

        <nav
          className={cn(
            "absolute left-4 right-4 top-full mt-3 rounded-3xl border border-navy/10 bg-white p-3 shadow-card md:static md:mt-0 md:flex md:w-auto md:items-center md:gap-3 md:border-none md:bg-transparent md:p-0 md:shadow-none",
            isMenuOpen ? "block" : "hidden md:flex"
          )}
        >
          <Link
            href="/#map"
            className="block rounded-full px-4 py-2 text-sm font-medium text-navy hover:bg-sand"
          >
            Carte
          </Link>
          <Link
            href="/#catalogue"
            className="block rounded-full px-4 py-2 text-sm font-medium text-navy hover:bg-sand"
          >
            Catalogue
          </Link>
          <Link
            href="/admin"
            className="block rounded-full px-4 py-2 text-sm font-medium text-navy hover:bg-sand"
          >
            Admin
          </Link>
          <button
            type="button"
            onClick={openDrawer}
            className="mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-navy px-4 py-3 text-sm font-medium text-white md:mt-0 md:w-auto"
          >
            <ShoppingBag className="h-4 w-4" />
            <span>Panier</span>
            <span className="rounded-full bg-white/15 px-2 py-0.5 text-xs">{itemCount}</span>
          </button>
        </nav>
      </div>
    </header>
  );
}
