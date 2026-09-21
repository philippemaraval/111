export const TOTAL_NEIGHBORHOODS = 111;
export const PRODUCT_PRICE_EUROS = 25;

export const PACK_PRICES_EUROS = {
  3: 65,
  4: 80,
  5: 95
} as const;

export const MYSTERY_PACK_PRICES_EUROS = {
  1: 20,
  2: 35,
  3: 45
} as const;

export type MysteryPackSize = keyof typeof MYSTERY_PACK_PRICES_EUROS;

export function getMysteryPackPrice(count: number) {
  return count === 1 || count === 2 || count === 3
    ? MYSTERY_PACK_PRICES_EUROS[count]
    : null;
}

export const AVAILABLE_NEIGHBORHOOD_SLUGS = [
  "la-joliette",
  "notre-dame-du-mont",
  "sainte-anne",
  "cinq-avenues",
  "mazargues"
] as const;

export const PROJECT_NEIGHBORHOOD_SLUGS = [
  "noailles",
  "belle-de-mai",
  "perier",
  "saint-barnabe",
  "le-camas",
  "l-estaque",
  "saint-victor",
  "saint-louis",
  "la-capelette",
  "la-pomme"
] as const;

export type NeighborhoodCatalogStatus = "available" | "project" | "idea";

export function getNeighborhoodCatalogStatus(slug: string): NeighborhoodCatalogStatus {
  if ((AVAILABLE_NEIGHBORHOOD_SLUGS as readonly string[]).includes(slug)) {
    return "available";
  }

  if ((PROJECT_NEIGHBORHOOD_SLUGS as readonly string[]).includes(slug)) {
    return "project";
  }

  return "idea";
}

export function isNeighborhoodAvailable(slug: string) {
  return getNeighborhoodCatalogStatus(slug) === "available";
}

export function isCatalogStatusVotable(status: NeighborhoodCatalogStatus) {
  return status === "idea";
}

export const ARRONDISSEMENTS = Array.from({ length: 16 }, (_, index) => ({
  value: index + 1,
  label: `${index + 1}${index === 0 ? "er" : "e"} arrondissement`
}));

export const SIZE_ORDER = [
  "S",
  "M",
  "L",
  "XL"
] as const;

export const DEFAULT_STOCK = {
  S: 0,
  M: 0,
  L: 0,
  XL: 0
};
