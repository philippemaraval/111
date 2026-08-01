"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowUpRight, ChevronLeft, ChevronRight, Heart } from "lucide-react";

import { formatCurrency } from "@/lib/utils";
import type { Neighborhood } from "@/lib/types";

export function NeighborhoodCard({ neighborhood }: { neighborhood: Neighborhood }) {
  const gallery = neighborhood.gallery.length
    ? neighborhood.gallery
    : [{ label: "T-shirt", url: neighborhood.imageUrl }];
  const [activeImage, setActiveImage] = useState(0);
  const image = gallery[activeImage] ?? gallery[0];

  function showPrevious() {
    setActiveImage((current) => (current - 1 + gallery.length) % gallery.length);
  }

  function showNext() {
    setActiveImage((current) => (current + 1) % gallery.length);
  }

  return (
    <article className="group">
      <div className="relative aspect-[4/5] overflow-hidden rounded-[24px] bg-[#f1f1f1]">
        <Link href={`/quartier/${neighborhood.slug}`} className="focus-ring block h-full w-full" aria-label={`Découvrir le t-shirt ${neighborhood.name}`}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            key={image.url}
            src={image.url}
            alt={`T-shirt 111 ${neighborhood.name}, ${image.label}`}
            className="h-full w-full animate-[reveal-up_300ms_ease-out] object-contain p-2 transition duration-700 group-hover:scale-[1.015]"
          />
          <span className="absolute left-4 top-4 rounded-full bg-white px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-navy shadow-soft">
            {neighborhood.isAvailable ? "Disponible" : "À soutenir"}
          </span>
          <span className="absolute right-4 top-4 rounded-full bg-navy/80 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.12em] text-white backdrop-blur-sm">
            {image.label}
          </span>
          <span className="absolute bottom-4 right-4 grid h-11 w-11 place-items-center rounded-full bg-sea text-white transition group-hover:-translate-y-1 group-hover:translate-x-1">
            <ArrowUpRight className="h-5 w-5" />
          </span>
        </Link>

        {gallery.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="focus-ring absolute left-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-navy shadow-soft hover:bg-sun"
              aria-label={`Photo précédente de ${neighborhood.name}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="focus-ring absolute right-3 top-1/2 z-10 grid h-10 w-10 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-navy shadow-soft hover:bg-sun"
              aria-label={`Photo suivante de ${neighborhood.name}`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div className="absolute bottom-5 left-1/2 z-10 flex -translate-x-1/2 gap-1.5 rounded-full bg-white/90 px-3 py-2 shadow-soft" role="group" aria-label={`Photo ${activeImage + 1} sur ${gallery.length}`}>
              {gallery.map((galleryImage, index) => (
                <button
                  key={galleryImage.url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className={`focus-ring h-2 rounded-full transition-all ${index === activeImage ? "w-5 bg-sea" : "w-2 bg-navy/20 hover:bg-navy/40"}`}
                  aria-label={`Afficher ${galleryImage.label}`}
                  aria-current={index === activeImage ? "true" : undefined}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="flex items-start justify-between gap-4 px-1 pt-4">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-sea">{neighborhood.arrondissement}<sup>e</sup> arrondissement</p>
          <h3 className="mt-1 text-2xl font-black tracking-tight text-navy">
            <Link href={`/quartier/${neighborhood.slug}`} className="focus-ring rounded hover:text-sea">{neighborhood.name}</Link>
          </h3>
          <p className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-navy/45"><Heart className="h-3.5 w-3.5 text-terracotta" /> {neighborhood.voteCount} vote{neighborhood.voteCount === 1 ? "" : "s"}</p>
        </div>
        <p className="pt-5 text-base font-bold text-navy">{formatCurrency(neighborhood.price)}</p>
      </div>
    </article>
  );
}
