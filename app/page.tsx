import Link from "next/link";
import { ArrowRight, MapPin, PencilRuler, Sparkles } from "lucide-react";

import { HeroSection } from "@/components/home/hero-section";
import { InteractiveMap } from "@/components/home/interactive-map";
import { NeighborhoodCard } from "@/components/home/neighborhood-card";
import { listNeighborhoods } from "@/lib/neighborhoods";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const neighborhoods = await listNeighborhoods({ sort: "popular" });
  const featured = neighborhoods.filter((item) => item.isAvailable).slice(0, 5);

  return (
    <div className="pb-16">
      <HeroSection />

      <section className="mx-auto grid max-w-[1440px] grid-cols-1 border-b border-navy/10 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-10">
        {[
          { icon: PencilRuler, title: "Dessiné ici", text: "Chaque visuel part d’une histoire et d’un lieu marseillais." },
          { icon: Sparkles, title: "En série courte", text: "Des pièces choisies avec soin, sans collection inutile." },
          { icon: MapPin, title: "Par et pour Marseille", text: "La communauté vote pour faire vivre les prochains quartiers." }
        ].map((item) => (
          <div key={item.title} className="flex gap-4 border-navy/10 py-5 first:pt-0 last:pb-0 sm:border-l sm:px-7 sm:py-0 sm:first:border-0 sm:first:pl-0">
            <item.icon className="h-6 w-6 shrink-0 text-sea" />
            <div><h2 className="font-bold text-navy">{item.title}</h2><p className="mt-1 text-sm leading-6 text-navy/55">{item.text}</p></div>
          </div>
        ))}
      </section>

      <section id="collection" className="mx-auto max-w-[1440px] scroll-mt-32 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="mb-10 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="section-kicker">La première collection</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-navy sm:text-6xl">Les quartiers prennent la lumière.</h2>
          </div>
          <Link href="#carte" className="focus-ring inline-flex items-center gap-2 self-start rounded-full border border-navy/15 px-5 py-3 text-sm font-bold hover:border-sea hover:text-sea">
            Tous les quartiers <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className={`grid gap-6 ${featured.length === 1 ? "max-w-xl" : "md:grid-cols-2 xl:grid-cols-3"}`}>
          {featured.map((item) => <NeighborhoodCard key={item.id} neighborhood={item} />)}
        </div>
      </section>

      <section id="histoire" className="bg-sun px-4 py-16 sm:px-6 lg:py-24">
        <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div className="max-w-md">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-navy/55">Pourquoi 111 ?</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none tracking-[-0.045em] text-navy sm:text-6xl">Une ville.<br />111 façons de l’aimer.</h2>
          </div>
          <div className="grid gap-6 text-navy/75 sm:grid-cols-2">
            <p className="text-lg leading-8">Marseille ne se résume pas à une carte postale. Elle se raconte dans ses rues, ses places, ses habitudes et ses voix.</p>
            <p className="text-lg leading-8">111 transforme cette mémoire locale en images à porter. Un projet imaginé à Marseille, nourri par ses habitants et produit en séries courtes.</p>
          </div>
        </div>
      </section>

      <InteractiveMap neighborhoods={neighborhoods} />
    </div>
  );
}
