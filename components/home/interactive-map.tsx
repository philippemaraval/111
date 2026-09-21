"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  Heart,
  LoaderCircle,
  MapPin,
  Maximize2,
  RotateCcw,
  Search,
  Trophy
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
  "belle-de-mai": "Belle de Mai",
  "chateau-gombert": "Château-Gombert",
  eoures: "Éoures",
  "hotel-de-ville": "Hôtel de Ville",
  "l-estaque": "L’Estaque",
  "les-iles": "Les Îles",
  "les-medecins": "Les Médecins",
  "la-fourragere": "La Fourragère",
  "la-milliere": "La Millière",
  malpasse: "Malpassé",
  opera: "Opéra",
  perier: "Périer",
  prefecture: "Préfecture",
  "saint-andre": "Saint-André",
  "saint-barnabe": "Saint-Barnabé",
  "saint-barthelemy": "Saint-Barthélemy",
  "saint-jean-du-desert": "Saint-Jean-du-Désert",
  "saint-jerome": "Saint-Jérôme"
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
  const [selectedSlug, setSelectedSlug] = useState("");
  const [hoveredSlug, setHoveredSlug] = useState<string | null>(null);
  const [activeArrondissement, setActiveArrondissement] = useState<number | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [isRankingExpanded, setIsRankingExpanded] = useState(false);
  const mapPanel = useRef<HTMLDivElement>(null);

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

  const voteRanking = useMemo(
    () => neighborhoods
      .filter((item) => item.catalogStatus === "idea" && item.voteCount > 0)
      .sort((a, b) => b.voteCount - a.voteCount || a.name.localeCompare(b.name, "fr")),
    [neighborhoods]
  );
  const availableCount = neighborhoods.filter((item) => item.catalogStatus === "available").length;
  const projectCount = neighborhoods.filter((item) => item.catalogStatus === "project").length;
  const votableCount = neighborhoods.filter((item) => item.catalogStatus === "idea").length;

  const selectedFeature = features.find((feature) => feature.properties.slug === selectedSlug) ?? features[0];
  const selectedProduct = selectedFeature
    ? productsByMapSlug.get(selectedFeature.properties.slug)
    : undefined;
  const selectedStatus = selectedProduct?.catalogStatus ?? "idea";
  const hoveredFeature = features.find((feature) => feature.properties.slug === hoveredSlug);
  const viewBox = isFocused && selectedFeature ? focusedViewBox(selectedFeature) : `0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`;

  function selectFeature(slug: string, focus = true) {
    setSelectedSlug(slug);
    setIsFocused(focus);
  }

  function selectFromRanking(product: Neighborhood) {
    selectFeature(mapSlugForProduct(product));
    mapPanel.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="mx-auto max-w-[1440px] px-4 py-12 sm:px-6 sm:py-20 lg:px-10 lg:py-28">
      <div className="mb-6 grid gap-5 sm:mb-9 sm:gap-7 lg:grid-cols-[1fr_0.65fr] lg:items-end">
        <div className="max-w-3xl">
          <p className="section-kicker">À toi de choisir</p>
          <h2 className="mt-3 text-3xl font-black uppercase leading-[0.95] tracking-[-0.045em] md:text-6xl">Vote. Partage. Mets-nous la pression.</h2>
          <p className="mt-4 max-w-2xl text-sm leading-6 text-navy/60 md:mt-5 md:text-base md:leading-7">
            <span className="md:hidden">Vote pour le quartier que tu veux voir rejoindre la collection.</span>
            <span className="hidden md:inline">Tu ne dessines pas le tee‑shirt : tu votes pour le quartier que tu veux voir rejoindre la collection. Plus il monte, plus notre équipe devra accélérer.</span>
          </p>
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

      <div className="mb-5 flex items-center justify-between gap-2 rounded-2xl border border-navy/10 bg-white px-4 py-3 text-center shadow-soft md:hidden">
        <p><strong className="block text-lg text-sea">{availableCount}</strong><span className="text-[10px] font-bold uppercase tracking-[0.08em] text-navy/45">disponibles</span></p>
        <span className="h-8 w-px bg-navy/10" />
        <p><strong className="block text-lg text-ochre">{projectCount}</strong><span className="text-[10px] font-bold uppercase tracking-[0.08em] text-navy/45">en projet</span></p>
        <span className="h-8 w-px bg-navy/10" />
        <p><strong className="block text-lg text-navy">{votableCount}</strong><span className="text-[10px] font-bold uppercase tracking-[0.08em] text-navy/45">à départager</span></p>
      </div>

      <div className="mb-8 hidden gap-3 md:grid md:grid-cols-3">
        <Link href="#collection" className="focus-ring rounded-2xl bg-sea p-5 text-white shadow-soft transition hover:-translate-y-0.5">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-white/65">Acheter maintenant</p>
          <p className="mt-2 text-xl font-black">{availableCount} tee‑shirts disponibles</p>
          <p className="mt-2 text-sm text-white/70">Le vote est fermé : ils sont dans la collection.</p>
        </Link>
        <div className="rounded-2xl bg-ochre p-5 text-navy shadow-soft">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-navy/55">Demande entendue</p>
          <p className="mt-2 text-xl font-black">{projectCount} quartiers en projet</p>
          <p className="mt-2 text-sm text-navy/65">Le vote est fermé : leur tee‑shirt est dans les cartons.</p>
        </div>
        <div className="rounded-2xl border border-navy/10 bg-white p-5 shadow-soft">
          <p className="text-[10px] font-bold uppercase tracking-[0.17em] text-sea">À toi de jouer</p>
          <p className="mt-2 text-xl font-black">{votableCount} quartiers à départager</p>
          <p className="mt-2 text-sm text-navy/55">Un vote par personne et par quartier.</p>
        </div>
      </div>

      <section id="classement" className="mb-8 hidden scroll-mt-32 overflow-hidden rounded-[28px] bg-sand md:block" aria-labelledby="ranking-title">
        <div className="grid lg:grid-cols-[0.72fr_1.28fr]">
          <div className="bg-sun p-7 sm:p-9">
            <Trophy className="h-7 w-7 text-navy" />
            <p className="mt-8 text-xs font-bold uppercase tracking-[0.2em] text-navy/55">Classement en direct</p>
            <h3 id="ranking-title" className="mt-3 text-4xl font-black uppercase leading-[0.92] tracking-[-0.045em] text-navy">Quels quartiers mettent le plus de pression&nbsp;?</h3>
            <p className="mt-5 leading-7 text-navy/65">Seuls les quartiers encore ouverts au vote sont classés. Dès qu’un tee‑shirt passe en projet, il sort de la compétition.</p>
          </div>
          <div className="p-4 sm:p-6">
            {voteRanking.length > 0 ? (
              <ol className="max-h-[430px] space-y-2 overflow-y-auto pr-1">
                {voteRanking.map((item, index) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => selectFromRanking(item)} className="focus-ring group flex w-full items-center gap-4 rounded-2xl bg-white px-4 py-3 text-left transition hover:-translate-y-0.5 hover:shadow-soft sm:px-5">
                      <span className={cn("grid h-10 w-10 shrink-0 place-items-center rounded-full text-sm font-black", index === 0 ? "bg-sun text-navy" : "bg-navy text-white")}>{index + 1}</span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-black text-navy group-hover:text-sea">{item.name}</span>
                        <span className="text-xs text-navy/45">{item.arrondissement}<sup>e</sup> arrondissement</span>
                      </span>
                      <span className="shrink-0 text-right"><strong className="block text-lg text-navy">{item.voteCount}</strong><span className="text-[10px] font-bold uppercase tracking-[0.12em] text-navy/40">votes</span></span>
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <div className="grid min-h-56 place-items-center rounded-2xl border border-dashed border-navy/15 bg-white p-8 text-center">
                <div><p className="text-xl font-black">Le classement attend son premier vote.</p><p className="mt-2 max-w-md text-sm leading-6 text-navy/55">Choisis un quartier sur la carte : le premier soutien suffit pour le faire apparaître ici.</p></div>
              </div>
            )}
          </div>
        </div>
      </section>

      <div className="mb-6 hidden gap-2 overflow-x-auto pb-2 md:flex" aria-label="Filtrer par arrondissement">
        <button type="button" onClick={() => setActiveArrondissement(null)} className={cn("focus-ring shrink-0 rounded-full px-4 py-2 text-xs font-bold", activeArrondissement === null ? "bg-navy text-white" : "border border-navy/10 hover:border-sea")}>Toute la ville</button>
        {Array.from({ length: 16 }, (_, index) => index + 1).map((item) => (
          <button key={item} type="button" onClick={() => setActiveArrondissement(item)} className={cn("focus-ring shrink-0 rounded-full px-4 py-2 text-xs font-bold", activeArrondissement === item ? "bg-sea text-white" : "border border-navy/10 hover:border-sea")}>{item}<sup>e</sup></button>
        ))}
      </div>

      <div ref={mapPanel} className="grid scroll-mt-28 overflow-hidden rounded-[28px] bg-[#dff4fc] shadow-soft lg:grid-cols-[1.12fr_0.88fr]">
        <div data-testid="neighborhood-map" className="relative min-h-[380px] overflow-hidden md:min-h-[680px]">
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
                const status = productsByMapSlug.get(feature.properties.slug)?.catalogStatus ?? "idea";
                const selected = selectedFeature?.properties.slug === feature.properties.slug;
                const hovered = hoveredSlug === feature.properties.slug;
                const inActiveArrondissement = activeArrondissement === null || activeArrondissement === feature.properties.arrondissement;
                const fill = selected ? "#ffd43b" : status === "available" ? "#129fd4" : status === "project" ? "#ff8a34" : "#ffffff";
                return (
                  <path
                    key={feature.properties.slug}
                    d={geometryToPath(feature.geometry)}
                    fill={fill}
                    fillOpacity={inActiveArrondissement ? (selected ? 1 : status !== "idea" ? 0.82 : 0.72) : 0.16}
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

          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap gap-2 rounded-2xl bg-white/95 px-3 py-2 text-[9px] font-bold uppercase tracking-[0.08em] shadow-soft sm:bottom-5 sm:left-5 sm:right-auto sm:gap-3 sm:px-4 sm:py-3 sm:text-[10px] sm:tracking-[0.1em]">
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-sea" /> Disponible</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full bg-ochre" /> En projet</span>
            <span className="flex items-center gap-2"><i className="h-2.5 w-2.5 rounded-full border border-navy/20 bg-white" /> À imaginer</span>
          </div>
        </div>

        <div data-testid="neighborhood-summary" className="flex min-h-0 flex-col justify-between gap-6 bg-navy p-5 text-white md:min-h-[560px] md:p-10 lg:p-12" aria-live="polite">
          {selectedFeature && (
            <>
              <div>
                <div className="flex items-center justify-between gap-4">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-sea">{selectedFeature.properties.arrondissement}<sup>e</sup> arrondissement</p>
                  <MapPin className="h-6 w-6 text-sun" />
                </div>
                <h3 className="mt-3 text-3xl font-black uppercase leading-none tracking-[-0.05em] sm:mt-5 sm:text-6xl">
                  {selectedProduct?.slug === "le-panier" ? "Le Panier" : formatOfficialName(selectedFeature)}
                </h3>
                {selectedProduct?.slug === "le-panier" && <p className="mt-2 text-sm font-semibold text-white/45">Quartier officiel Hôtel de Ville</p>}
                <p className="mt-7 hidden max-w-lg text-base leading-8 text-white/65 md:block">
                  {selectedProduct
                    ? selectedStatus === "project"
                      ? `Le tee‑shirt ${selectedProduct.name} est déjà en préparation. Les votes sont donc fermés pendant que l’équipe travaille à sa sortie.`
                      : selectedStatus === "available"
                        ? `${selectedProduct.name} a déjà son tee‑shirt : il est disponible dans la collection.`
                        : selectedProduct.descriptionHistory
                    : selectedStatus === "project"
                      ? `${formatOfficialName(selectedFeature)} fait partie des prochaines éditions 111. Le projet est identifié et sa fiche rejoindra bientôt les votes de la communauté.`
                    : `${formatOfficialName(selectedFeature)} fait partie des 111 quartiers officiels de Marseille. Son histoire et son premier t-shirt restent encore à imaginer avec les habitants.`}
                </p>
              </div>

              <div>
                {selectedProduct ? (
                  <>
                    <div className="mb-5 flex items-center justify-between gap-3 text-sm text-white/70">
                      <span className="flex items-center gap-2"><Heart className="h-4 w-4 text-terracotta" /> <strong className="text-white">{selectedProduct.voteCount}</strong> {selectedStatus === "idea" ? "votes" : "soutiens historiques"}</span>
                      <span className={cn(
                        "rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.12em]",
                        selectedStatus === "available"
                          ? "bg-olive/25 text-[#a5efbe]"
                          : selectedStatus === "project"
                            ? "bg-terracotta/20 text-[#ffaaa3]"
                            : "bg-white/10 text-white/70"
                      )}>
                        {selectedStatus === "available"
                          ? "T-shirt disponible"
                          : selectedStatus === "project"
                            ? "En projet"
                            : "Votes ouverts"}
                      </span>
                    </div>
                    <Link href={`/quartier/${selectedProduct.slug}`} className="focus-ring flex w-full items-center justify-between rounded-full bg-white px-6 py-4 text-sm font-bold text-navy hover:bg-sun">
                      {selectedStatus === "available" ? "Découvrir le tee‑shirt" : selectedStatus === "project" ? "Suivre sa préparation" : "Voir sa place et voter"}<ArrowUpRight className="h-5 w-5" />
                    </Link>
                  </>
                ) : selectedStatus === "project" ? (
                  <div className="rounded-2xl border border-ochre/25 bg-ochre/10 p-5">
                    <p className="text-xs font-bold uppercase tracking-[0.16em] text-sun">En projet</p>
                    <p className="mt-2 text-sm leading-6 text-white/65">Ce quartier fait bien partie des prochaines éditions 111. Sa fiche de vote sera disponible dès son ajout au catalogue.</p>
                  </div>
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

      <section className="mt-6 overflow-hidden rounded-[24px] bg-sand md:hidden" aria-labelledby="mobile-ranking-title">
        <div className="bg-sun px-5 py-5">
          <div className="flex items-center gap-3">
            <Trophy className="h-5 w-5 shrink-0 text-navy" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-navy/50">Classement en direct</p>
              <h3 id="mobile-ranking-title" className="mt-1 text-xl font-black uppercase leading-tight tracking-[-0.03em] text-navy">Les quartiers en tête</h3>
            </div>
          </div>
        </div>
        <div className="p-3">
          {voteRanking.length > 0 ? (
            <>
              <ol className="space-y-2">
                {(isRankingExpanded ? voteRanking : voteRanking.slice(0, 3)).map((item, index) => (
                  <li key={item.id}>
                    <button type="button" onClick={() => selectFromRanking(item)} className="focus-ring flex w-full items-center gap-3 rounded-2xl bg-white px-3 py-3 text-left">
                      <span className={cn("grid h-9 w-9 shrink-0 place-items-center rounded-full text-xs font-black", index === 0 ? "bg-sun text-navy" : "bg-navy text-white")}>{index + 1}</span>
                      <span className="min-w-0 flex-1 truncate font-black text-navy">{item.name}</span>
                      <span className="shrink-0 text-sm font-black text-navy">{item.voteCount} <span className="text-[9px] uppercase tracking-[0.08em] text-navy/40">votes</span></span>
                    </button>
                  </li>
                ))}
              </ol>
              {voteRanking.length > 3 && (
                <button
                  type="button"
                  className="focus-ring mt-3 flex w-full items-center justify-center gap-2 rounded-full border border-navy/15 px-4 py-3 text-xs font-bold text-navy"
                  aria-expanded={isRankingExpanded}
                  onClick={() => setIsRankingExpanded((current) => !current)}
                >
                  {isRankingExpanded ? "Réduire le classement" : "Voir le classement complet"}
                  {isRankingExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </button>
              )}
            </>
          ) : (
            <p className="rounded-2xl bg-white p-5 text-center text-sm text-navy/55">Le classement attend son premier vote.</p>
          )}
        </div>
      </section>
    </section>
  );
}
