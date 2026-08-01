import Link from "next/link";
import { MapPin, Sparkles, Users } from "lucide-react";
import { LogoMark } from "@/components/logo-mark";

export function Footer() {
  return (
    <footer className="mt-20 bg-navy text-white">
      <div className="overflow-hidden border-b border-white/10 py-4">
        <div className="marquee-track flex w-max gap-10 whitespace-nowrap text-xs font-bold uppercase tracking-[0.22em] text-sun">
          {[0, 1].map((group) => (
            <div key={group} className="flex gap-10" aria-hidden={group === 1}>
              <span>111 quartiers</span><span>Une seule ville</span><span>Créé à Marseille</span><span>Séries courtes</span><span>Marseille rayonne</span>
            </div>
          ))}
        </div>
      </div>
      <div className="mx-auto grid max-w-[1440px] gap-12 px-5 py-14 sm:px-8 lg:grid-cols-[1.2fr_0.8fr_0.8fr] lg:px-10">
        <div className="max-w-md">
          <LogoMark className="h-16 w-16 text-sea" />
          <h2 className="mt-6 text-3xl font-black leading-tight">Marseille se porte fièrement.</h2>
          <p className="mt-3 text-sm leading-6 text-white/60">Une collection locale qui met les histoires, les accents et les couleurs de nos quartiers au premier plan.</p>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sun">Explorer</p>
          <div className="mt-5 flex flex-col gap-3 text-sm text-white/75">
            <Link href="/#collection" className="hover:text-white">La collection</Link>
            <Link href="/#carte" className="hover:text-white">La carte des quartiers</Link>
            <Link href="/#histoire" className="hover:text-white">Notre démarche</Link>
            <Link href="/cart" className="hover:text-white">Mon panier</Link>
          </div>
        </div>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-sun">Restons voisins</p>
          <div className="mt-5 space-y-4 text-sm text-white/75">
            <p className="flex gap-3"><MapPin className="h-5 w-5 shrink-0 text-sea" /> Imaginé à Marseille</p>
            <p className="flex gap-3"><Sparkles className="h-5 w-5 shrink-0 text-sea" /> Collections en séries courtes</p>
            <p className="flex gap-3"><Users className="h-5 w-5 shrink-0 text-sea" /> Les habitants choisissent la suite</p>
          </div>
        </div>
      </div>
      <div className="mx-auto flex max-w-[1440px] flex-col gap-3 border-t border-white/10 px-5 py-5 text-xs text-white/40 sm:flex-row sm:items-center sm:justify-between lg:px-10">
        <p>© 2026 — 111 Marseille</p>
        <p>Fièrement local, résolument marseillais.</p>
      </div>
    </footer>
  );
}
