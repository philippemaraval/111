"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { MapPin, Waves } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Neighborhood } from "@/lib/types";

type InteractiveMapProps = {
  neighborhoods: Neighborhood[];
};

export function InteractiveMap({ neighborhoods }: InteractiveMapProps) {
  const [activeArrondissement, setActiveArrondissement] = useState<number>(1);

  const grouped = useMemo(
    () =>
      Array.from({ length: 16 }, (_, index) => ({
        arrondissement: index + 1,
        neighborhoods: neighborhoods.filter(
          (item) => item.arrondissement === index + 1
        )
      })),
    [neighborhoods]
  );

  const activeGroup =
    grouped.find((item) => item.arrondissement === activeArrondissement) ?? grouped[0];

  return (
    <section id="map" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
      <div className="rounded-[32px] border border-navy/10 bg-white/70 p-5 shadow-card backdrop-blur-xl">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sea">Vue macro</p>
            <h2 className="font-display text-4xl text-navy">Carte des 16 arrondissements</h2>
          </div>
          <Waves className="h-6 w-6 text-sea" />
        </div>

        <div className="grid grid-cols-4 gap-3">
          {grouped.map((group) => (
            <button
              key={group.arrondissement}
              type="button"
              onClick={() => setActiveArrondissement(group.arrondissement)}
              className={cn(
                "group rounded-[24px] border px-3 py-5 text-left transition-all",
                activeArrondissement === group.arrondissement
                  ? "border-navy bg-navy text-white shadow-card scale-[1.02]"
                  : "border-navy/10 bg-sand/50 text-navy hover:bg-sand"
              )}
            >
              <span className="block text-xs uppercase tracking-[0.24em] opacity-75">
                Arr
              </span>
              <span className="mt-2 block font-display text-4xl leading-none">
                {group.arrondissement}
              </span>
              <span className="mt-3 block text-xs uppercase tracking-[0.2em] opacity-75">
                {group.neighborhoods.length} quartier{group.neighborhoods.length > 1 ? "s" : ""}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div className="rounded-[32px] border border-navy/10 bg-navy p-5 text-white shadow-card">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-sun">Vue micro</p>
            <h3 className="font-display text-4xl">
              Zoom sur le {activeGroup.arrondissement}e arrondissement
            </h3>
          </div>
          <div className="rounded-full bg-white/10 px-3 py-2 text-xs uppercase tracking-[0.2em] text-sun">
            Click to zoom
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {activeGroup.neighborhoods.length > 0 ? (
            activeGroup.neighborhoods.map((item) => (
              <Link
                key={item.id}
                href={`/quartier/${item.slug}`}
                className="rounded-[26px] border border-white/10 bg-white/5 p-4 transition hover:bg-white/10"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xl font-semibold">{item.name}</p>
                    <p className="mt-1 text-sm text-white/65">
                      {item.isAvailable ? "Disponible" : "Coming soon"}
                    </p>
                  </div>
                  <MapPin className="h-5 w-5 text-sun" />
                </div>
                <p className="mt-4 text-sm leading-6 text-white/70 line-clamp-3">
                  {item.descriptionHistory}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.18em] text-white/70">
                  <span>{item.voteCount} votes</span>
                  <span>{item.salesCount} ventes</span>
                </div>
              </Link>
            ))
          ) : (
            <div className="rounded-[26px] border border-dashed border-white/20 bg-white/5 p-6 text-sm text-white/70 sm:col-span-2">
              Aucun quartier n’est encore branché sur cet arrondissement.
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
