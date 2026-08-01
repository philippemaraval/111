import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowUpRight, Heart, MapPin, PencilRuler, Shirt } from "lucide-react";

import { MiniMap } from "@/components/product/mini-map";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { getNeighborhoodBySlug, listNeighborhoods } from "@/lib/neighborhoods";

export const dynamic = "force-dynamic";

type NeighborhoodPageProps = { params: { slug: string } };

export async function generateMetadata({ params }: NeighborhoodPageProps): Promise<Metadata> {
  const neighborhood = await getNeighborhoodBySlug(params.slug);
  if (!neighborhood) return { title: "Quartier introuvable | 111" };
  return {
    title: neighborhood.seo.title ?? `${neighborhood.name} — T-shirt 111`,
    description: neighborhood.seo.description ?? neighborhood.descriptionHistory,
    keywords: neighborhood.seo.keywords,
    openGraph: { title: neighborhood.seo.title ?? neighborhood.name, description: neighborhood.seo.description ?? neighborhood.descriptionHistory, images: neighborhood.seo.image ? [neighborhood.seo.image] : [] }
  };
}

export default async function NeighborhoodPage({ params }: NeighborhoodPageProps) {
  const neighborhood = await getNeighborhoodBySlug(params.slug);
  if (!neighborhood) notFound();
  const related = (await listNeighborhoods({ arrondissement: neighborhood.arrondissement, sort: "popular" })).filter((item) => item.id !== neighborhood.id).slice(0, 3);

  return (
    <div className="pb-20">
      <div className="mx-auto max-w-[1440px] px-4 py-5 sm:px-6 lg:px-10">
        <Link href="/#collection" className="focus-ring inline-flex items-center gap-2 rounded-full py-2 text-xs font-bold uppercase tracking-[0.16em] text-navy/55 hover:text-sea"><ArrowLeft className="h-4 w-4" /> Retour à la collection</Link>
      </div>

      <section className="mx-auto grid max-w-[1440px] gap-7 px-4 sm:px-6 lg:grid-cols-[1.15fr_0.85fr] lg:px-10">
        <div className="grid gap-3 sm:grid-cols-2">
          {neighborhood.gallery.map((image, index) => (
            <div key={`${image.label}-${index}`} className="group relative overflow-hidden rounded-[20px] bg-[#f2f2f2]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={image.url} alt={`${neighborhood.name}, ${image.label}`} className="aspect-[4/5] w-full object-contain transition duration-700 group-hover:scale-[1.015]" />
              <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-navy">{image.label}</span>
            </div>
          ))}
        </div>
        <div className="lg:pl-5"><ProductPurchasePanel neighborhood={neighborhood} /></div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
        <div className="grid gap-12 border-t border-navy/10 pt-14 lg:grid-cols-[0.75fr_1.25fr]">
          <div>
            <p className="section-kicker">Derrière le dessin</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none tracking-[-0.04em] sm:text-5xl">{neighborhood.name}, côté cœur.</h2>
          </div>
          <div>
            <p className="max-w-3xl text-xl leading-9 text-navy/70">{neighborhood.descriptionHistory}</p>
            <div className="mt-10 grid gap-4 sm:grid-cols-3">
              {[
                { icon: PencilRuler, label: "Imaginé", value: "À Marseille" },
                { icon: Shirt, label: "Production", value: "En série courte" },
                { icon: Heart, label: "La communauté", value: `${neighborhood.voteCount} soutiens` }
              ].map((item) => (
                <div key={item.label} className="rounded-2xl bg-sand p-5"><item.icon className="h-5 w-5 text-sea" /><p className="mt-5 text-[10px] font-bold uppercase tracking-[0.18em] text-navy/45">{item.label}</p><p className="mt-1 font-bold">{item.value}</p></div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="bg-[#eef8fc] px-4 py-16 sm:px-6 lg:py-20">
        <div className="mx-auto grid max-w-[1360px] gap-10 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
          <div>
            <p className="section-kicker">Sur la carte</p>
            <h2 className="mt-3 text-4xl font-black uppercase leading-none tracking-[-0.04em]">Un quartier,<br />un point d’ancrage.</h2>
            <p className="mt-5 max-w-md leading-7 text-navy/60"><MapPin className="mr-2 inline h-5 w-5 text-terracotta" />{neighborhood.name}, dans le {neighborhood.arrondissement}<sup>e</sup> arrondissement de Marseille.</p>
          </div>
          <MiniMap coordinates={neighborhood.coordinates} neighborhoodSlug={neighborhood.slug} />
        </div>
      </section>

      {related.length > 0 && (
        <section className="mx-auto max-w-[1440px] px-4 py-20 sm:px-6 lg:px-10">
          <p className="section-kicker">Dans le même coin</p>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {related.map((item) => (
              <Link key={item.id} href={`/quartier/${item.slug}`} className="focus-ring group flex min-h-44 flex-col justify-between rounded-2xl border border-navy/10 p-6 transition hover:-translate-y-1 hover:border-sea hover:shadow-soft">
                <div><p className="text-xs font-bold uppercase tracking-[0.16em] text-sea">{item.arrondissement}<sup>e</sup> arrondissement</p><h3 className="mt-2 text-2xl font-black">{item.name}</h3></div>
                <div className="flex items-center justify-between text-sm text-navy/50"><span>{item.voteCount} soutiens</span><ArrowUpRight className="h-5 w-5 transition group-hover:text-sea" /></div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
