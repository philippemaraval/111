import Link from "next/link";
import { ArrowRight, MapPin, PencilRuler, Sparkles } from "lucide-react";

import { HeroSection } from "@/components/home/hero-section";
import { LazyInteractiveMap } from "@/components/home/lazy-interactive-map";
import { FeaturedCollection } from "@/components/home/featured-collection";
import { EditionContents } from "@/components/edition-contents";
import { listNeighborhoods } from "@/lib/neighborhoods";

export const revalidate = 300;

export default async function HomePage() {
  const neighborhoods = await listNeighborhoods({ sort: "popular" });
  const featured = neighborhoods.filter((item) => item.isAvailable);

  return (
    <div className="pb-16">
      <HeroSection />

      <section className="mx-auto grid max-w-[1440px] grid-cols-1 border-b border-navy/10 px-4 py-10 sm:grid-cols-3 sm:px-6 lg:px-10">
        {[
          { icon: PencilRuler, title: "Dessiné ici", text: "Chaque visuel part d’une histoire et d’un lieu marseillais." },
          { icon: Sparkles, title: "En série courte", text: "Des pièces bien faites, pensées pour durer." },
          { icon: MapPin, title: "Par et pour Marseille", text: "La communauté vote pour faire vivre les prochains quartiers." }
        ].map((item) => (
          <div key={item.title} className="flex gap-4 border-navy/10 py-5 first:pt-0 last:pb-0 sm:border-l sm:px-7 sm:py-0 sm:first:border-0 sm:first:pl-0">
            <item.icon className="h-6 w-6 shrink-0 text-sea" />
            <div><h2 className="font-bold text-navy">{item.title}</h2><p className="mt-1 text-sm leading-6 text-navy/55">{item.text}</p></div>
          </div>
        ))}
      </section>

      <section id="collection" className="mx-auto max-w-[1440px] scroll-mt-32 px-4 py-12 sm:px-6 md:py-20 lg:px-10 lg:py-28">
        <div className="mb-6 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between md:mb-10">
          <div>
            <p className="section-kicker">La première collection</p>
            <h2 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] text-navy sm:text-6xl">Les quartiers prennent la lumière.</h2>
          </div>
          <Link href="#carte" className="focus-ring inline-flex items-center gap-2 self-start rounded-full border border-navy/15 px-5 py-3 text-sm font-bold hover:border-sea hover:text-sea">
            À toi de choisir <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <FeaturedCollection neighborhoods={featured} />
      </section>

      <EditionContents />

      <LazyInteractiveMap neighborhoods={neighborhoods} />

      <section className="bg-navy px-4 py-16 text-white sm:px-6 lg:py-20">
        <div className="mx-auto flex max-w-[1360px] flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div><p className="text-xs font-bold uppercase tracking-[0.24em] text-sun">Nouveaux packs</p><h2 className="mt-3 max-w-3xl text-4xl font-black uppercase leading-[0.95] tracking-[-0.04em] sm:text-6xl">Plus de quartiers. Moins cher.</h2><p className="mt-5 max-w-2xl leading-7 text-white/60">Compose ton pack de 3, 4 ou 5 tee‑shirts. Économise jusqu’à <span className="whitespace-nowrap">30 €</span>, avec des prix à partir de <span className="whitespace-nowrap">19 € le tee‑shirt</span>.</p></div>
          <Link href="/packs" className="focus-ring inline-flex shrink-0 items-center gap-2 self-start rounded-full bg-sun px-6 py-4 text-sm font-bold text-navy hover:bg-white">Découvrir les packs <ArrowRight className="h-4 w-4" /></Link>
        </div>
      </section>
    </div>
  );
}
