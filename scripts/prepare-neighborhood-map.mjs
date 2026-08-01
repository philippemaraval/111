import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const [
  ,
  ,
  sourcePath,
  outputPath = "public/data/marseille-quartiers.geojson",
  catalogOutputPath = "lib/marseille-neighborhoods.json"
] = process.argv;

if (!sourcePath) {
  throw new Error("Usage: node scripts/prepare-neighborhood-map.mjs <source.geojson> [output.geojson]");
}

const tolerance = 0.000045;
const source = JSON.parse(await readFile(sourcePath, "utf8"));

function squaredSegmentDistance(point, start, end) {
  let x = start[0];
  let y = start[1];
  let dx = end[0] - x;
  let dy = end[1] - y;

  if (dx !== 0 || dy !== 0) {
    const t = ((point[0] - x) * dx + (point[1] - y) * dy) / (dx * dx + dy * dy);
    if (t > 1) {
      x = end[0];
      y = end[1];
    } else if (t > 0) {
      x += dx * t;
      y += dy * t;
    }
  }

  dx = point[0] - x;
  dy = point[1] - y;
  return dx * dx + dy * dy;
}

function simplifySection(points, first, last, threshold, output) {
  let maxDistance = threshold;
  let index = 0;

  for (let cursor = first + 1; cursor < last; cursor += 1) {
    const distance = squaredSegmentDistance(points[cursor], points[first], points[last]);
    if (distance > maxDistance) {
      index = cursor;
      maxDistance = distance;
    }
  }

  if (maxDistance > threshold) {
    if (index - first > 1) simplifySection(points, first, index, threshold, output);
    output.push(points[index]);
    if (last - index > 1) simplifySection(points, index, last, threshold, output);
  }
}

function roundPoint(point) {
  return [Number(point[0].toFixed(6)), Number(point[1].toFixed(6))];
}

function simplifyRing(ring) {
  if (!Array.isArray(ring) || ring.length < 5) return ring;
  const openRing = ring.slice(0, -1);
  const output = [openRing[0]];
  simplifySection(openRing, 0, openRing.length - 1, tolerance * tolerance, output);
  output.push(openRing[openRing.length - 1]);
  const simplified = output.length >= 3 ? output : openRing;
  const rounded = simplified.map(roundPoint);
  rounded.push([...rounded[0]]);
  return rounded;
}

function simplifyGeometry(geometry) {
  if (geometry.type === "Polygon") {
    return { type: "Polygon", coordinates: geometry.coordinates.map(simplifyRing) };
  }

  if (geometry.type === "MultiPolygon") {
    return {
      type: "MultiPolygon",
      coordinates: geometry.coordinates.map((polygon) => polygon.map(simplifyRing))
    };
  }

  throw new Error(`Unsupported geometry: ${geometry.type}`);
}

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const nameOverrides = {
  "chateau-gombert": "Château-Gombert",
  eoures: "Éoures",
  "hotel-de-ville": "Hôtel de Ville",
  "l-estaque": "L’Estaque",
  "les-iles": "Les Îles",
  malpasse: "Malpassé",
  "notre-dame-du-mont": "Notre-Dame-du-Mont",
  opera: "Opéra",
  perier: "Périer",
  prefecture: "Préfecture",
  "sainte-anne": "Sainte-Anne",
  "sainte-marguerite": "Sainte-Marguerite",
  "sainte-marthe": "Sainte-Marthe"
};

function formatName(value) {
  const slug = slugify(value);
  if (nameOverrides[slug]) return nameOverrides[slug];

  const smallWords = new Set(["de", "des", "du", "la", "le", "les"]);
  return value
    .toLocaleLowerCase("fr")
    .split(/([ -])/)
    .map((part, index) => {
      if (part === " " || part === "-") return part;
      if (index > 0 && smallWords.has(part)) return part;
      return `${part.charAt(0).toLocaleUpperCase("fr")}${part.slice(1)}`;
    })
    .join("");
}

const result = {
  type: "FeatureCollection",
  source: "Camino / limites des 111 quartiers de Marseille",
  features: source.features.map((feature) => {
    const name = feature.properties.nom_qua;
    const center = feature.properties.geo_point_2d;
    return {
      type: "Feature",
      properties: {
        name,
        slug: slugify(name),
        arrondissement: Number(String(feature.properties.depco).slice(-2)),
        center: [Number(center.lon.toFixed(6)), Number(center.lat.toFixed(6))]
      },
      geometry: simplifyGeometry(feature.geometry)
    };
  })
};

await mkdir(path.dirname(outputPath), { recursive: true });
await writeFile(outputPath, JSON.stringify(result));

const catalog = result.features
  .map((feature) => ({
    name: formatName(feature.properties.name),
    slug: feature.properties.slug,
    arrondissement: feature.properties.arrondissement,
    coordinates: {
      lng: feature.properties.center[0],
      lat: feature.properties.center[1]
    }
  }))
  .sort((a, b) => a.arrondissement - b.arrondissement || a.name.localeCompare(b.name, "fr"));

await mkdir(path.dirname(catalogOutputPath), { recursive: true });
await writeFile(catalogOutputPath, `${JSON.stringify(catalog, null, 2)}\n`);

console.log(`Carte générée : ${result.features.length} quartiers → ${outputPath}`);
console.log(`Catalogue généré : ${catalog.length} quartiers → ${catalogOutputPath}`);
