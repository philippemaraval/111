import Link from "next/link";
import { ArrowUpRight, Heart } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import type { Neighborhood } from "@/lib/types";

export function NeighborhoodCard({ neighborhood }: { neighborhood: Neighborhood }) {
  return (
    <article className="group">
      <Link href={`/quartier/${neighborhood.slug}`} className="focus-ring block overflow-hidden rounded-[24px] bg-[#f1f1f1]">
        <div className="relative aspect-[4/5] overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={neighborhood.imageUrl} alt={`T-shirt 111 ${neighborhood.name}`} className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]" />
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-navy shadow-soft">
            {neighborhood.isAvailable ? "Disponible" : "À soutenir"}
          </span>
          <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-sea text-white transition group-hover:-translate-y-1 group-hover:translate-x-1">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </div>
      </Link>
      <div className="flex items-start justify-between gap-4 px-1 pt-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sea">{neighborhood.arrondissement}<sup>e</sup> arrondissement</p>
          <h3 className="mt-1 text-2xl font-black tracking-tight text-navy">{neighborhood.name}</h3>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-navy/45"><Heart className="h-3.5 w-3.5 text-terracotta" /> {neighborhood.voteCount} vote{neighborhood.voteCount === 1 ? "" : "s"}</p>
        </div>
        <p className="pt-5 text-base font-bold text-navy">{formatCurrency(neighborhood.price)}</p>
      </div>
    </article>
  );
}
