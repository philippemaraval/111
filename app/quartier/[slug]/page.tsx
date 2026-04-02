import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CalendarDays, HeartHandshake, ShoppingBag } from "lucide-react";

import { MiniMap } from "@/components/product/mini-map";
import { ProductPurchasePanel } from "@/components/product/product-purchase-panel";
import { formatCurrency } from "@/lib/utils";
import { getNeighborhoodBySlug, listNeighborhoods } from "@/lib/neighborhoods";

export const dynamic = "force-dynamic";

type NeighborhoodPageProps = {
  params: {
    slug: string;
  };
};

export async function generateMetadata({
  params
}: NeighborhoodPageProps): Promise<Metadata> {
  const neighborhood = await getNeighborhoodBySlug(params.slug);

  if (!neighborhood) {
    return {
      title: "Quartier introuvable | 111 Quartiers Marseille"
    };
  }

  return {
    title: neighborhood.seo.title ?? `${neighborhood.name} | 111 Quartiers Marseille`,
    description: neighborhood.seo.description ?? neighborhood.descriptionHistory,
    keywords: neighborhood.seo.keywords,
    openGraph: {
      title: neighborhood.seo.title ?? neighborhood.name,
      description: neighborhood.seo.description ?? neighborhood.descriptionHistory,
      images: neighborhood.seo.image ? [neighborhood.seo.image] : []
    }
  };
}

export default async function NeighborhoodPage({ params }: NeighborhoodPageProps) {
  const neighborhood = await getNeighborhoodBySlug(params.slug);

  if (!neighborhood) {
    notFound();
  }

  const related = (await listNeighborhoods({
    arrondissement: neighborhood.arrondissement,
    sort: "popular"
  }))
    .filter((item) => item.id !== neighborhood.id)
    .slice(0, 3);

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5">
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-sand px-4 py-2 text-xs uppercase tracking-[0.22em] text-sea">
              {neighborhood.arrondissement}e arrondissement
            </span>
            <span className="rounded-full bg-white/80 px-4 py-2 text-xs uppercase tracking-[0.22em] text-navy shadow-soft">
              {neighborhood.isAvailable ? `${formatCurrency(neighborhood.price)}` : "Vote + alerte stock"}
            </span>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {neighborhood.gallery.map((image) => (
              <div key={image.label} className="overflow-hidden rounded-[32px] border border-navy/10 bg-white shadow-soft">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={image.url}
                  alt={`${neighborhood.name} - ${image.label}`}
                  className={`aspect-[4/5] h-full w-full object-cover ${neighborhood.isAvailable ? "" : "grayscale"}`}
                />
                <div className="border-t border-navy/10 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.22em] text-sea">{image.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <ProductPurchasePanel neighborhood={neighborhood} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <div className="space-y-5 rounded-[32px] border border-navy/10 bg-white/75 p-6 shadow-card backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sea">Histoire du quartier</p>
            <h2 className="mt-2 font-display text-4xl text-navy">{neighborhood.name}</h2>
          </div>
          <p className="text-base leading-8 text-navy/75">{neighborhood.descriptionHistory}</p>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-[24px] bg-sand/55 p-4">
              <ShoppingBag className="h-5 w-5 text-sea" />
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-sea">Ventes</p>
              <p className="mt-2 font-display text-4xl text-navy">{neighborhood.salesCount}</p>
            </div>
            <div className="rounded-[24px] bg-sand/55 p-4">
              <HeartHandshake className="h-5 w-5 text-terracotta" />
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-sea">Communauté</p>
              <p className="mt-2 font-display text-4xl text-navy">{neighborhood.voteCount}</p>
            </div>
            <div className="rounded-[24px] bg-sand/55 p-4">
              <CalendarDays className="h-5 w-5 text-olive" />
              <p className="mt-4 text-xs uppercase tracking-[0.18em] text-sea">Release</p>
              <p className="mt-2 text-lg font-semibold text-navy">
                {neighborhood.releaseDate ?? "À annoncer"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-5 rounded-[32px] border border-navy/10 bg-white/75 p-6 shadow-card backdrop-blur-xl">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sea">Mini-map</p>
            <h2 className="mt-2 font-display text-4xl text-navy">Localisation</h2>
          </div>
          <MiniMap coordinates={neighborhood.coordinates} />
          <p className="text-sm text-navy/65">
            Position symbolique du quartier sur la carte, utile pour la narration produit et le repérage rapide.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div>
          <p className="text-xs uppercase tracking-[0.24em] text-sea">À proximité</p>
          <h2 className="font-display text-4xl text-navy">Autres quartiers du secteur</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {related.map((item) => (
            <Link
              key={item.id}
              href={`/quartier/${item.slug}`}
              className="rounded-[28px] border border-navy/10 bg-white/75 p-4 shadow-soft backdrop-blur-xl"
            >
              <p className="text-xs uppercase tracking-[0.2em] text-sea">
                {item.arrondissement}e arrondissement
              </p>
              <h3 className="mt-2 text-2xl font-semibold text-navy">{item.name}</h3>
              <p className="mt-2 text-sm text-navy/65 line-clamp-2">
                {item.descriptionHistory}
              </p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
