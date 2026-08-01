"use client";

import Link from "next/link";
import { Map, Shirt, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";

import { useCart } from "@/contexts/cart-context";

export function MobileTabBar() {
  const { openDrawer, itemCount } = useCart();
  const pathname = usePathname();

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 z-30 md:hidden">
      <div className="flex items-center justify-between rounded-full border border-navy/10 bg-white/95 p-1.5 shadow-card backdrop-blur-xl">
        <Link href="/#carte" className="focus-ring flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold text-navy">
          <Map className="h-4 w-4" />
          Quartiers
        </Link>
        <Link href="/#collection" className="focus-ring flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold text-navy">
          <Shirt className="h-4 w-4" />
          Collection
        </Link>
        <button
          type="button"
          onClick={openDrawer}
          className="focus-ring flex flex-1 flex-col items-center gap-1 rounded-full bg-sea px-3 py-2 text-[10px] font-bold text-white"
        >
          <ShoppingBag className="h-4 w-4" />
          Panier ({itemCount})
        </button>
      </div>
    </div>
  );
}
