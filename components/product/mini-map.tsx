"use client";

import { useEffect, useState } from "react";

import type { Coordinates } from "@/lib/types";

type Position = [number, number];
type Feature = {
  properties: { slug: string };
  geometry:
    | { type: "Polygon"; coordinates: Position[][] }
    | { type: "MultiPolygon"; coordinates: Position[][][] };
};
type Collection = { features: Feature[] };

const MIN_LNG = 5.228;
const MAX_LNG = 5.533;
const MIN_LAT = 43.169;
const MAX_LAT = 43.392;

function project([longitude, latitude]: Position): Position {
  return [
    ((longitude - MIN_LNG) * 900) / (MAX_LNG - MIN_LNG),
    ((MAX_LAT - latitude) * 900) / (MAX_LAT - MIN_LAT)
  ];
}

function ringToPath(ring: Position[]) {
  return ring.map((point, index) => {
    const [x, y] = project(point);
    return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
  }).join("") + "Z";
}

function geometryToPath(feature: Feature) {
  if (feature.geometry.type === "Polygon") {
    return feature.geometry.coordinates.map(ringToPath).join("");
  }
  return feature.geometry.coordinates.flatMap((polygon) => polygon.map(ringToPath)).join("");
}

export function MiniMap({ coordinates, neighborhoodSlug }: { coordinates: Coordinates; neighborhoodSlug: string }) {
  const [features, setFeatures] = useState<Feature[]>([]);
  const mapSlug = neighborhoodSlug === "le-panier" ? "hotel-de-ville" : neighborhoodSlug;
  const marker = project([coordinates.lng, coordinates.lat]);

  useEffect(() => {
    const controller = new AbortController();
    fetch("/data/marseille-quartiers.geojson", { signal: controller.signal })
      .then((response) => response.json() as Promise<Collection>)
      .then((data) => setFeatures(data.features))
      .catch(() => undefined);
    return () => controller.abort();
  }, []);

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[24px] bg-[#c8efff]">
      <svg viewBox="0 0 900 900" aria-label="Localisation réelle du quartier à Marseille" role="img" className="absolute inset-0 h-full w-full p-5">
        {features.map((feature) => {
          const selected = feature.properties.slug === mapSlug;
          return (
            <path
              key={feature.properties.slug}
              d={geometryToPath(feature)}
              fill={selected ? "#ffd43b" : "#ffffff"}
              fillOpacity={selected ? 1 : 0.78}
              stroke={selected ? "#12202f" : "#129fd4"}
              strokeWidth={selected ? 3 : 1}
              vectorEffect="non-scaling-stroke"
              fillRule="evenodd"
            />
          );
        })}
        <circle cx={marker[0]} cy={marker[1]} r="10" fill="#ff5c52" stroke="#ffffff" strokeWidth="5" vectorEffect="non-scaling-stroke" />
      </svg>
      <div className="absolute bottom-5 left-5 rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-navy shadow-soft">Limites réelles · Marseille</div>
    </div>
  );
}
