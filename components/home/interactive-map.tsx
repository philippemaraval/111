"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  Heart,
  LoaderCircle,
  MapPin,
  Maximize2,
  RotateCcw,
  Search
} from "lucide-react";

import { cn } from "@/lib/utils";
import type { Neighborhood } from "@/lib/types";

type Position = [number, number];

type MapGeometry =
  | { type: "Polygon"; coordinates: Position[][] }
  | { type: "MultiPolygon"; coordinates: Position[][][] };

type MapFeature = {
  type: "Feature";
  properties: {
    name: string;
    slug: string;
    arrondissement: number;
    center: Position;
  };
  geometry: MapGeometry;
};

type MapCollection = {
  type: "FeatureCollection";
  features: MapFeature[];
};

const MAP_WIDTH = 900;
const MAP_HEIGHT = 900;
const MIN_LNG = 5.228;
const MAX_LNG = 5.533;
const MIN_LAT = 43.169;
const MAX_LAT = 43.392;
const LONGITUDE_RATIO = Math.cos((43.29 * Math.PI) / 180);

const DISPLAY_NAMES: Record<string, string> = {
  "chateau-gombert": "Château-Gombert",
  eoures: "Éoures",
  "hotel-de-ville": "Hôtel de Ville",
  "l-estaque": "L’Estaque",
  "les-iles": "Les Îles",
  malpasse: "Malpassé",
  opera: "Opéra",
  perier: "Périer",
  prefecture: "Préfecture"
};

function project([longitude, latitude]: Position): Position {
  const geographicWidth = (MAX_LNG - MIN_LNG) * LONGITUDE_RATIO;
  const x = ((longitude - MIN_LNG) * LONGITUDE_RATIO * MAP_WIDTH) / geographicWidth;
  const y = ((MAX_LAT - latitude) * MAP_HEIGHT) / (MAX_LAT - MIN_LAT);
  return [x, y];
}

function ringToPath(ring: Position[]) {
  return ring
    .map((point, index) => {
      const [x, y] = project(point);
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join("") + "Z";
}

function geometryToPath(geometry: MapGeometry) {
  if (geometry.type === "Polygon") {
    return geometry.coordinates.map(ringToPath).join("");
  }

  return geometry.coordinates
    .flatMap((polygon) => polygon.map(ringToPath))
    .join("");
}

function featureBounds(feature: MapFeature) {
  const points: Position[] = [];
  const collect = (value: Position | Position[] | Position[][] | Position[][][]) => {
    if (Array.isArray(value) && typeof value[0] === "number") {
      points.push(project(value as Position));
      return;
    }
    (value as Position[]).forEach((item) => collect(item));
  };
  collect(feature.geometry.coordinates);

  const xs = points.map((point) => point[0]);
  const ys = points.map((point) => point[1]);
  return {
    minX: Math.min(...xs),
    maxX: Math.max(...xs),
    minY: Math.min(...ys),
    maxY: Math.max(...ys)
  };
}

function focusedViewBox(feature: MapFeature) {
  const bounds = featureBounds(feature);
  const span = Math.max(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY, 65) * 1.65;
  const centerX = (bounds.minX + bounds.maxX) / 2;
  const centerY = (bounds.minY + bounds.maxY) / 2;
  const x = Math.max(0, Math.min(MAP_WIDTH - span, centerX - span / 2));
  const y = Math.max(0, Math.min(MAP_HEIGHT - span, centerY - span / 2));
  return `${x.toFixed(1)} ${y.toFixed(1)} ${Math.min(span, MAP_WIDTH).toFixed(1)} ${Math.min(span, MAP_HEIGHT).toFixed(1)}`;
}

function formatOfficialName(feature: MapFeature) {
  if (DISPLAY_NAMES[feature.properties.slug]) return DISPLAY_NAMES[feature.properties.slug];

  const smallWords = new Set(["de", "des", "du", "la", "le", "les"]);
  return feature.properties.name
    .toLocaleLowerCase("fr")
    .split(/([ -])/)
    .map((part, index) => {
      if (part === " " || part === "-") return part;
      if (index > 0 && smallWords.has(part)) return part;
      return `${part.charAt(0).toLocaleUpperCase("fr")}${part.slice(1)}`;
    })
    .join("");
}

function mapSlugForProduct(product: Neighborhood) {
  return product.slug === "le-panier" ? "hotel-de-ville" : product.slug;
}

export function InteractiveMap({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  const [mapData, setMapData] = useState<MapCollection | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState("la-joliette");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [activeArrondissement, setActiveArrondissement] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/marseille-quartiers.geojson", { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("map_load_failed");
        return response.json() as Promise<MapCollection>;
      })
      .then(setMapData)
      .catch((error: unknown) => {
        if (!(error instanceof DOMException && error.name === "AbortError")) setLoadError(true);
      });
    return () => controller.abort();
  }, []);

  const productsByMapSlug = useMemo(
    () => new Map(neighborhoods.map((product) => [mapSlugForProduct(product), product])),
    [neighborhoods]
  );

  const features = useMemo(
    () => [...(mapData?.features ?? [])].sort((a, b) => {
      if (a.properties.arrondissement !== b.properties.arrondissement) {
        return a.properties.arrondissement - b.properties.arrondissement;
      }
      return formatOfficialName(a).localeCompare(formatOfficialName(b), "fr");
    }),
    [mapData]
  );

  const selectedFeature = features.find((feature) => feature.properties.slug === selectedSlug) ?? features[0];
  const selectedProduct = selectedFeature ? productsByMapSlug.get(selectedFeature.properties.slug) : undefined;
  const hoveredFeature = features.find((feature) => feature.properties.slug === hoveredSlug);
  const viewBox = isFocused && selectedFeature ? focusedViewBox(selectedFeature) : `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`;

  function selectFeature(slug: string, focus = true) {
    setSelectedSlug(slug);
    setIsFocused(focus);
  }

  return (
    <section id="carte" className="mx-auto max-w-[1440px] scroll-mt-32 px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
      <div className="mb-9 grid gap-7 lg:grid-cols-[1fr_0.65fr] lg:items-end">
        <div className="max-w-3xl">
          <p className="section-kicker">La vraie carte des 111</p>
          <h2 className="mt-3 text-4xl font-black uppercase leading-[0.95] tracking-[-0.045em] sm:text-6xl">Choisis ton quartier.</h2>
          <p className="mt-5 max-w-2xl text-base leading-7 text-navy/60">Les contours officiels de Marseille, du nord au sud. Clique sur la carte ou cherche directement ton quartier.</p>
        </div>
        <label className="relative block">
          <span className="mb-2 block text-xs font-bold uppercase tracking-[0.16em] text-navy/55">Rechercher parmi les 111 quartiers</span>
          <Search className="pointer-events-none absolute bottom-3.5 left-4 h-5 w-5 text-sea" />
          <select
            value={selectedFeature?.properties.slug ?? ""}
            onChange={(event) => selectFeature(event.target.value)}
            className="focus-ring w-full appearance-none rounded-full border border-navy/15 bg-white py-3.5 pl-12 pr-10 text-sm font-bold shadow-soft"
          >
            {features.map((feature) => (
              <option key={feature.properties.slug} value={feature.properties.slug}>
                {feature.properties.arrondissement}e · {formatOfficialName(feature)}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="mb-6 flex gap-2 overflow-x-auto pb-2" aria-label="Filtrer par arrondissement">
        <button type="button" onClick={() => setActiveArrondissement(null)} className={cn("focus-ring shrink-0 rounded-full px-4 py-2 text-xs font-bold", activeArrondissement === null ? "bg-navy text-white" : "border border-navy/10 hover:border-sea")}>Toute la ville</button>
        {Array.from({ length: 16 }, (_, index) => index + 1).map((item) => (
          <button key={item} type="button" onClick={() => setActiveArrondissement(item)} className={cn("focus-ring shrink-0 rounded-full px-4 py-2 text-xs font-bold", activeArrondissement === item ? "bg-sea text-white" : "border border-navy/10 hover:border-sea")}>{item}<sup>e</sup></button>
        ))}
      </div>

      <div className="grid overflow-hidden rounded-[28px] bg-[#dff4fc] shadow-soft lg:grid-cols-[1.12fr_0.88fr]">
        <div className="relative min-h-[620px] overflow-hidden sm:min-h-[760px]">
          {!mapData && !loadError && (
            <div className="absolute inset-0 z-20 grid place-items-center bg-[#dff4fc]"><div className="text-center"><LoaderCircle className="mx-auto h-7 w-7 animate-spin text-sea" /><p className="mt-3 text-xs font-bold uppercase tracking-[0.15em] text-navy/45">Chargement des quartiers</p></div></div>
          )}
          {loadError && (
            <div className="absolute inset-0 z-20 grid place-items-center p-8 text-center"><div><p className="text-xl font-black">La carte n’a pas pu être chargée.</p><p className="mt-2 text-sm text-navy/55">La liste des quartiers reste disponible dans le sélecteur.</p></div></div>
          )}

          <div className="absolute left-5 top-5 z-10 rounded-full bg-white/95 px-4 py-2 text-[10px] font-bold uppercase tracking-[0.18em] text-sea shadow-soft">
            {hoveredFeature ? `${formatOfficialName(hoveredFeature)} · ${hoveredFeature.properties.arrondissement}e` : "Marseille · 111 quartiers"}
          </div>
          <div className="absolute right-5 top-5 z-10 flex gap-2">
            <button type="button" onClick={() => selectedFeature && setIsFocused(true)} className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft hover:text-sea" aria-label="Centrer sur le quartier sélectionné"><Maximize2 className="h-4 w-4" /></button>
            <button type="button" onClick={() => setIsFocused(false)} className="focus-ring grid h-10 w-10 place-items-center rounded-full bg-white shadow-soft hover:text-sea" aria-label="Voir toute la ville"><RotateCcw className="h-4 w-4" /></button>
          </div>

          <svg viewBox={viewBox} preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full p-5 sm:p-8" role="img" aria-label="Carte interactive des 111 quartiers de Marseille">
            <g>
              {features.map((feature) => {
                const product = productsByMapSlug.get(feature.properties.slug);
                const selected = selectedFeature?.properties.slug === feature.properties.slug;
                const hovered = hoveredSlug === feature.properties.slug;
                const inActiveArrondissement = activeArrondissement === null || activeArrondissement === feature.properties.arrondissement;
                const fill = selected ? "#ffd43b" : product?.isAvailable ? "#129fd4" : product ? "#ff8a34" : "#ffffff";
                return (
                  <path
                    key={feature.properties.slug}
                    d={geometryToPath(feature.geometry)}
                    fill={fill}
                    fillOpacity={inActiveArrondissement ? (selected ? 1 : product ? 0.82 : 0.72) : 0.16}
                    stroke={selected || hovered ? "#12202f" : "#487387"}
                    strokeOpacity={inActiveArrondissement ? 1 : 0.3}
                    strokeWidth={selected ? 3 : hovered ? 2.4 : 1.1}
                    vectorEffect="non-scaling-stroke"
                    fillRule="evenodd"
                    className="cursor-pointer outline-none transition-[fill,fill-opacity] duration-200 focus-visible:stroke-[4]"
                    role="button"
                    tabIndex={0}
                    aria-label={`Choisir ${formatOfficialName(feature)}, ${feature.properties.arrondissement}e arrondissement`}
                    onMouseEnter={() => setHoveredSlug(feature.properties.slug)}
                    onMouseLeave={() => setHoveredSlug(null)}
                    onFocus={() => setHoveredSlug(feature.properties.slug)}
                    onBlur={() => setHoveredSlug(null)}
                    onClick={() => selectFeature(feature.properties.slug)}
                    onKeyDown={(event) => {
                      if (event.key === "Enter" || event.key === " ") {
                        event.preventDefault();
                        selectFeature(feature.properties.slug);
                      }
                    }}
                  />
                );
              })}
            </g>
          </svg>

          <div className="absolute bottom-5 left-5 right-5 flex flex-wrap gap-3 rounded-2xl bg-white/95 px-4 py-3 text-[10px] font-bold uppercase tracking-[0.1em] shadow-soft sm:right-auto">
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-sea" /> Disponible</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-ochre" /> En projet</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full border border-navy/20 bg-white" /> À imaginer</span>
          </div>
        </div>

        <div className="flex min-h-[560px] flex-col justify-between bg-navy p-7 text-white sm:p-10 lg:p-12" aria-live="polite">
          {selectedFeature && (
            <>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sea">{selectedFeature.properties.arrondissement}<sup>e</sup> arrondissement</p>
                  <MapPin className="h-6 w-6 text-sun" />
                </div>
                <h3 className="mt-5 text-4xl font-black uppercase leading-none tracking-[-0.05em] sm:text-6xl">
                  {selectedFeature.properties.slug === "hotel-de-ville" && selectedProduct ? "Le Panier" : formatOfficialName(selectedFeature)}
                </h3>
                {selectedFeature.properties.slug === "hotel-de-ville" && selectedProduct && <p className="mt-2 text-sm font-semibold text-white/45">Quartier officiel Hôtel de Ville</p>}
                <p className="mt-7 max-w-lg text-base leading-8 text-white/65">
                  {selectedProduct
                    ? selectedProduct.descriptionHistory
                    : `${formatOfficialName(selectedFeature)} fait partie des 111 quartiers officiels de Marseille. Son histoire et son premier t-shirt restent encore à imaginer avec les habitants.`}
                </p>
              </div>

              <div>
                {selectedProduct ? (
                  <>
                    <div className="mb-5 flex items-center justify-between gap-3 text-sm text-white/70">
                      <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-terracotta" /> <strong className="text-white">{selectedProduct.voteCount}</strong> soutiens</span>
                      <span className={cn("rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]", selectedProduct.isAvailable ? "bg-olive/25 text-[#a5efbe]" : "bg-terracotta/20 text-[#ffaaa3]")}>{selectedProduct.isAvailable ? "T-shirt disponible" : "À soutenir"}</span>
                    </div>
                    <Link href={`/quartier/${selectedProduct.slug}`} className="focus-ring flex w-full items-center justify-between rounded-full bg-white px-6 py-4 text-sm font-bold text-navy hover:bg-sun">
                      {selectedProduct.isAvailable ? "Découvrir le t-shirt" : "Découvrir et voter"}<ArrowUpRight className="h-5 w-5" />
                    </Link>
                  </>
                ) : (
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-sun">À imaginer</p>
                    <p className="mt-2 text-sm leading-6 text-white/60">Ce quartier n’a pas encore son édition 111. Il apparaîtra ici dès que sa fiche sera ouverte aux votes.</p>
                    <Link href="#collection" className="focus-ring mt-5 inline-flex items-center gap-2 text-sm font-bold text-white hover:text-sun">Voir les éditions actuelles <ArrowUpRight className="h-4 w-4" /></Link>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
