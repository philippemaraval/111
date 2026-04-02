"use client";

import Link from "next/link";
import { Map, Search, ShoppingBag } from "lucide-react";

import { useCart } from "@/contexts/cart-context";

export function MobileTabBar() {
  const { openDrawer, itemCount } = useCart();

  return (
    <div className="fixed bottom-4 left-4 right-4 z-40 md:hidden">
      <div className="flex items-center justify-between rounded-full border border-navy/10 bg-white/90 p-2 shadow-card backdrop-blur-xl">
        <Link href="/#map" className="flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs font-medium text-navy">
          <Map className="h-4 w-4" />
          Carte
        </Link>
        <Link href="/#catalogue" className="flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-xs font-medium text-navy">
          <Search className="h-4 w-4" />
          Recherche
        </Link>
        <button
          type="button"
          onClick={openDrawer}
          className="flex flex-1 flex-col items-center gap-1 rounded-full bg-navy px-3 py-2 text-xs font-medium text-white"
        >
          <ShoppingBag className="h-4 w-4" />
          Panier ({itemCount})
        </button>
      </div>
    </div>
  );
}
