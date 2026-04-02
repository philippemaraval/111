export const TOTAL_NEIGHBORHOODS = 111;

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
