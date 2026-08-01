"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Heart, MapPin } from "lucide-react";

import { cn } from "@/lib/utils";
import type { Neighborhood } from "@/lib/types";

type MapPoint = Neighborhood & { x: number; y: number };

function position(item: Neighborhood) {
  return {
    x: Math.min(88, Math.max(12, 12 + ((item.coordinates.lng - 5.28) / 0.25) * 76)),
    y: Math.min(90, Math.max(9, 9 + ((43.42 - item.coordinates.lat) / 0.24) * 81))
  };
}

export function InteractiveMap({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  const [activeId, setActiveId] = useState(neighborhoods[0]?.id ?? "");
  const [arrondissement, setArrondissement] = useState<number | null>(null);
  const points = useMemo<MapPoint[]>(() => neighborhoods.map((item) => ({ ...item, ...position(item) })), [neighborhoods]);
  const visible = arrondissement ? points.filter((item) => item.arrondissement === arrondissement) : points;
  const active = points.find((item) => item.id === activeId) ?? visible[0] ?? points[0];

  return (
    <section id="carte" className="mx-auto max-w-[1440px] scroll-mt-32 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="mb-9 max-w-3xl">
        <p className="section-kicker">La carte 111</p>
        <h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-[-0.045em] sm:text-6xl">Retrouve ton coin de Marseille.</h2>
        <p className="mt-5 max-w-2xl text-base leading-7 text-navy/60">Choisis un arrondissement, découvre son histoire et vote pour le prochain t-shirt à voir le jour.</p>
      </div>

      <div className="mb-7 flex gap-2 overflow-x-auto pb-2">
        <button type="button" onClick={() => setArrondissement(null)} className={cn("focus-ring shrink-0 rounded-full px-4 py-2 text-xs font-bold", arrondissement === null ? "bg-navy text-white" : "border border-navy/10 hover:border-sea")}>Toute la ville</button>
        {Array.from({ length: 16 }, (_, index) => index + 1).map((item) => (
          <button key={item} type="button" onClick={() => { setArrondissement(item); const first = points.find((point) => point.arrondissement === item); if (first) setActiveId(first.id); }} className={cn("focus-ring shrink-0 rounded-full px-4 py-2 text-xs font-bold", arrondissement === item ? "bg-sea text-white" : "border border-navy/10 hover:border-sea")}>{item}<sup>e</sup></button>
        ))}
      </div>

      <div className="grid overflow-hidden rounded-[28px] bg-[#eef8fc] lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative min-h-[600px] overflow-hidden p-4 sm:p-8 lg:min-h-[720px]">
          <div className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sea shadow-soft">Carte illustrée · Marseille</div>
          <svg viewBox="0 0 600 720" aria-hidden="true" className="absolute inset-0 h-full w-full">
            <path d="M171 22C264 11 407 45 498 119c64 52 70 121 47 186-17 48-5 91-28 141-29 63-86 95-120 158-24 45-86 91-156 86-58-4-100-35-112-84-10-41 12-78-9-116-21-39-66-57-69-103-4-53 39-83 53-126 17-54-19-98 2-148 13-32 32-72 65-91Z" fill="#fff" stroke="#129fd4" strokeWidth="3" />
            <path d="M51 387c43 15 77 43 99 83 21 37-2 80 12 118 13 36 49 66 87 72-59 22-139 10-178-45-35-49-50-158-20-228Z" fill="#bcecff" opacity=".8" />
            <path d="M118 200c92 29 149 4 220-29 63-30 129-12 194 16M126 326c106-31 184 8 278-21 53-17 96-7 137 18M149 457c90-29 163 4 238-14 50-12 87-5 126 18M211 103c-4 98 28 161 6 244-19 70 11 149 3 232M352 73c-20 92 15 169-4 242-16 66 23 126 17 205M465 129c-28 70 3 126-14 194-12 48 16 86 10 130" fill="none" stroke="#12202f" strokeOpacity=".08" strokeWidth="2" />
          </svg>
          {visible.map((item) => (
            <button key={item.id} type="button" onClick={() => setActiveId(item.id)} style={{ left: `${item.x}%`, top: `${item.y}%` }} className={cn("focus-ring absolute z-10 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-soft transition hover:scale-125", active?.id === item.id ? "h-6 w-6 bg-terracotta ring-4 ring-terracotta/20" : item.isAvailable ? "h-4 w-4 bg-sea" : "h-3.5 w-3.5 bg-navy/35")} aria-label={`Voir ${item.name}`} />
          ))}
          <div className="absolute bottom-5 left-5 flex gap-4 rounded-xl bg-white/90 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.12em] shadow-soft">
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-sea" /> Disponible</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-navy/35" /> À soutenir</span>
          </div>
        </div>

        <div className="flex min-h-[520px] flex-col justify-between bg-navy p-7 text-white sm:p-10 lg:p-12">
          {active ? (
            <>
              <div>
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sea">{active.arrondissement}<sup>e</sup> arrondissement</p>
                  <MapPin className="h-6 w-6 text-sun" />
                </div>
                <h3 className="mt-5 text-5xl font-black uppercase leading-none tracking-[-0.05em] sm:text-6xl">{active.name}</h3>
                <p className="mt-7 max-w-lg text-base leading-8 text-white/65">{active.descriptionHistory}</p>
              </div>
              <div>
                <div className="mb-5 flex items-center gap-2 text-sm text-white/70"><Heart className="h-4 w-4 text-terracotta" /> <strong className="text-white">{active.voteCount}</strong> votes de la communauté</div>
                <Link href={`/quartier/${active.slug}`} className="focus-ring flex w-full items-center justify-between rounded-full bg-white px-6 py-4 text-sm font-bold text-navy hover:bg-sun">
                  {active.isAvailable ? "Découvrir le t-shirt" : "Découvrir et voter"}<ArrowUpRight className="h-5 w-5" />
                </Link>
              </div>
            </>
          ) : <p>Aucun quartier dans cette sélection.</p>}
        </div>
      </div>
    </section>
  );
}
