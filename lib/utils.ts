import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

import { DEFAULT_STOCK, SIZE_ORDER } from "@/lib/constants";
import type {
  Coordinates,
  Json,
  SeoMetadata,
  Size,
  StockBySize
} from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function slugify(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function formatCurrency(amount: number) {
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "EUR"
  }).format(amount);
}

export function parseStock(input: Json): StockBySize {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { ...DEFAULT_STOCK };
  }

  return SIZE_ORDER.reduce<StockBySize>((acc, size) => {
    const rawValue = (input as Record<string, Json>)[size];
    acc[size] = typeof rawValue === "number" ? rawValue : 0;
    return acc;
  }, { ...DEFAULT_STOCK });
}

export function parseCoordinates(input: Json): Coordinates {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return { lat: 43.2965, lng: 5.3698 };
  }

  const lat = (input as Record<string, Json>).lat;
  const lng = (input as Record<string, Json>).lng;

  return {
    lat: typeof lat === "number" ? lat : 43.2965,
    lng: typeof lng === "number" ? lng : 5.3698
  };
}

export function parseSeoMetadata(input: Json): SeoMetadata {
  if (!input || typeof input !== "object" || Array.isArray(input)) {
    return {};
  }

  return input as SeoMetadata;
}

export function availableSizes(stockBySize: StockBySize) {
  return SIZE_ORDER.filter((size) => stockBySize[size] > 0);
}

export function totalStock(stockBySize: StockBySize) {
  return SIZE_ORDER.reduce((sum, size) => sum + stockBySize[size], 0);
}

export function buildSearchParams(
  current: URLSearchParams,
  updates: Record<string, string | null>
) {
  const next = new URLSearchParams(current.toString());

  Object.entries(updates).forEach(([key, value]) => {
    if (!value) {
      next.delete(key);
      return;
    }

    next.set(key, value);
  });

  return next.toString();
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  const allowlist = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);

  return allowlist.includes(email.toLowerCase());
}

export function clampQuantity(quantity: number) {
  if (Number.isNaN(quantity)) {
    return 1;
  }

  return Math.min(9, Math.max(1, quantity));
}

export function normalizeSize(input: string): Size | null {
  if (SIZE_ORDER.includes(input as Size)) {
    return input as Size;
  }

  return null;
}
