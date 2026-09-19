"use client";

import Link from "next/link";
import { Map, Shirt, ShoppingBag } from "lucide-react";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { useCart } from "@/contexts/cart-context";
import { cn } from "@/lib/utils";

export function MobileTabBar() {
  const { openDrawer, itemCount } = useCart();
  const pathname = usePathname();
  const [activeHomeSection, setActiveHomeSection] = useState<"collection" | "carte">("collection");

  useEffect(() => {
    if (pathname !== "/") return;
    const sections = ["collection", "carte"]
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    const observer = new IntersectionObserver((entries) => {
      const visible = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
      if (visible?.target.id === "collection" || visible?.target.id === "carte") {
        setActiveHomeSection(visible.target.id);
      }
    }, { rootMargin: "-20% 0px -55%", threshold: [0, 0.1, 0.35] });
    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [pathname]);

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <div className="fixed bottom-3 left-3 right-3 z-30 md:hidden">
      <div className="flex items-center justify-between rounded-full border border-navy/10 bg-white/95 p-1.5 shadow-card backdrop-blur-xl">
        <Link href="/#carte" onClick={() => setActiveHomeSection("carte")} aria-current={pathname === "/" && activeHomeSection === "carte" ? "page" : undefined} className={cn("focus-ring flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold transition", pathname === "/" && activeHomeSection === "carte" ? "bg-sun text-navy" : "text-navy")}>
          <Map className="h-4 w-4" />
          Voter
        </Link>
        <Link href="/#collection" onClick={() => setActiveHomeSection("collection")} aria-current={pathname === "/" && activeHomeSection === "collection" ? "page" : undefined} className={cn("focus-ring flex flex-1 flex-col items-center gap-1 rounded-full px-3 py-2 text-[10px] font-bold transition", pathname === "/" && activeHomeSection === "collection" ? "bg-navy text-white" : "text-navy")}>
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
