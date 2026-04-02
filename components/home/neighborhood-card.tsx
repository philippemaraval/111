import Link from "next/link";
import { ArrowUpRight, Heart, ShoppingBag } from "lucide-react";

import { formatCurrency, totalStock } from "@/lib/utils";
import type { Neighborhood } from "@/lib/types";

type NeighborhoodCardProps = {
  neighborhood: Neighborhood;
};

export function NeighborhoodCard({ neighborhood }: NeighborhoodCardProps) {
  return (
    <article className="group overflow-hidden rounded-[30px] border border-navy/10 bg-white shadow-soft transition hover:-translate-y-1 hover:shadow-card">
      <div className="relative aspect-[4/4.8] overflow-hidden bg-sand/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={neighborhood.imageUrl}
          alt={neighborhood.name}
          className={`h-full w-full object-cover transition duration-500 group-hover:scale-[1.03] ${neighborhood.isAvailable ? "" : "grayscale"}`}
        />
        <div className="absolute inset-x-4 top-4 flex items-center justify-between">
          <span className="rounded-full bg-white/85 px-3 py-2 text-[11px] uppercase tracking-[0.2em] text-sea backdrop-blur-sm">
            {neighborhood.arrondissement}e arrondissement
          </span>
          <span
            className={`rounded-full px-3 py-2 text-[11px] uppercase tracking-[0.2em] backdrop-blur-sm ${
              neighborhood.isAvailable
                ? "bg-olive/90 text-white"
                : "bg-terracotta/90 text-white"
            }`}
          >
            {neighborhood.isAvailable ? "En stock" : "À voter"}
          </span>
        </div>
      </div>
      <div className="space-y-4 p-5">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-display text-3xl text-navy">{neighborhood.name}</h3>
            <p className="mt-1 text-sm text-navy/65 line-clamp-2">
              {neighborhood.descriptionHistory}
            </p>
          </div>
          <Link
            href={`/quartier/${neighborhood.slug}`}
            className="rounded-full border border-navy/10 p-2 text-navy"
          >
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="flex items-center justify-between text-sm text-navy/70">
          <span className="inline-flex items-center gap-2">
            <Heart className="h-4 w-4 text-terracotta" />
            {neighborhood.voteCount} votes
          </span>
          <span className="inline-flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-sea" />
            {neighborhood.salesCount} ventes
          </span>
        </div>
        <div className="flex items-center justify-between rounded-[24px] bg-sand/55 px-4 py-3">
          <div>
            <p className="text-sm font-semibold text-navy">
              {formatCurrency(neighborhood.price)}
            </p>
            <p className="text-xs uppercase tracking-[0.18em] text-sea">
              {neighborhood.isAvailable
                ? `${totalStock(neighborhood.stockBySize)} pièces restantes`
                : "Vote d’activation"}
            </p>
          </div>
          <Link
            href={`/quartier/${neighborhood.slug}`}
            className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-white"
          >
            {neighborhood.isAvailable ? "Voir le produit" : "Découvrir"}
          </Link>
        </div>
      </div>
    </article>
  );
}
