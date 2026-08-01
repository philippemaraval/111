import { cache } from "react";

import { AVAILABLE_NEIGHBORHOOD_SLUGS, isNeighborhoodAvailable, PRODUCT_PRICE_EUROS } from "@/lib/constants";
import { mockNeighborhoods, mockSearchIndex, mockVoteSummaries, mockVotes } from "@/lib/mock-data";
import { neighborhoodDescriptions } from "@/lib/neighborhood-descriptions";
import {
  hasPublishedProductImages,
  laJolietteGallery
} from "@/lib/product-illustrations";
import { createAdminSupabaseClient, createServerSupabaseClient, hasSupabaseEnv } from "@/lib/supabase/server";
import { parseCoordinates, parseSeoMetadata, parseStock, slugify } from "@/lib/utils";
import type {
  Neighborhood,
  NeighborhoodMetricsRow,
  NeighborhoodRow,
  SearchIndexItem,
  VoteRow,
  VoteSummary
} from "@/lib/types";

type NeighborhoodFilters = {
  arrondissement?: number;
  availability?: "all" | "available" | "coming-soon";
  q?: string;
  sort?: "popular" | "recent" | "name";
};

function enrichNeighborhood(
  row: NeighborhoodRow,
  metrics?: NeighborhoodMetricsRow
): Neighborhood {
  const seo = parseSeoMetadata(row.seo_metadata);
  const slug = seo.slug ?? slugify(row.name);
  const hasProductImages = hasPublishedProductImages(row.name);
  const gallery = hasProductImages
    ? laJolietteGallery
    : seo.gallery ?? [
        { label: "Photo à plat", url: row.image_url },
        { label: "Porté mannequin", url: row.image_url }
      ];

  return {
    id: row.id,
    name: row.name,
    slug,
    arrondissement: row.arrondissement,
    price: PRODUCT_PRICE_EUROS,
    stockBySize: parseStock(row.stock_by_size),
    imageUrl: hasProductImages ? laJolietteGallery[0].url : row.image_url,
    descriptionHistory: neighborhoodDescriptions[slug] ?? row.description_history,
    coordinates: parseCoordinates(row.coordinates),
    isAvailable: isNeighborhoodAvailable(slug),
    releaseDate: row.release_date,
    seo,
    voteCount: metrics?.vote_count ?? 0,
    salesCount: metrics?.sales_count ?? 0,
    popularityScore: metrics?.popularity_score ?? 0,
    gallery
  };
}

function sortNeighborhoods(
  neighborhoods: Neighborhood[],
  sort: NeighborhoodFilters["sort"] = "popular"
) {
  return [...neighborhoods].sort((a, b) => {
    if (sort === "name") {
      return a.name.localeCompare(b.name, "fr");
    }

    if (sort === "recent") {
      return (b.releaseDate ?? "").localeCompare(a.releaseDate ?? "");
    }

    return b.popularityScore - a.popularityScore;
  });
}

function filterMockNeighborhoods(filters: NeighborhoodFilters) {
  const base = mockNeighborhoods.filter((item) => {
    if (filters.arrondissement && item.arrondissement !== filters.arrondissement) {
      return false;
    }

    if (filters.availability === "available" && !item.isAvailable) {
      return false;
    }

    if (filters.availability === "coming-soon" && item.isAvailable) {
      return false;
    }

    if (
      filters.q &&
      !item.name.toLowerCase().includes(filters.q.toLowerCase().trim())
    ) {
      return false;
    }

    return true;
  });

  return sortNeighborhoods(base, filters.sort);
}

export const listNeighborhoods = cache(async (filters: NeighborhoodFilters = {}) => {
  if (!hasSupabaseEnv()) {
    return filterMockNeighborhoods(filters);
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return filterMockNeighborhoods(filters);
  }

  let query = supabase
    .from("neighborhoods")
    .select("*");

  if (filters.arrondissement) {
    query = query.eq("arrondissement", filters.arrondissement);
  }

  if (filters.q) {
    query = query.ilike("name", `%${filters.q.trim()}%`);
  }

  const {
    data: rows,
    error
  } = (await query) as {
    data: NeighborhoodRow[] | null;
    error: { message: string } | null;
  };

  if (error || !rows) {
    return filterMockNeighborhoods(filters);
  }

  const ids = rows.map((row) => row.id);

  const { data: metricsRows } = (ids.length
    ? await supabase
        .from("neighborhood_metrics")
        .select("*")
        .in("neighborhood_id", ids)
    : { data: [] as NeighborhoodMetricsRow[] }) as {
    data: NeighborhoodMetricsRow[] | null;
  };

  const metricsMap = new Map(
    (metricsRows ?? []).map((item) => [item.neighborhood_id, item])
  );

  const enriched = rows.map((row) => enrichNeighborhood(row, metricsMap.get(row.id)));
  const filtered = enriched.filter((item) => {
    if (filters.availability === "available") return item.isAvailable;
    if (filters.availability === "coming-soon") return !item.isAvailable;
    return true;
  });

  return sortNeighborhoods(filtered, filters.sort);
});

export const getNeighborhoodBySlug = cache(async (slug: string) => {
  const neighborhoods = await listNeighborhoods({});
  return neighborhoods.find((item) => item.slug === slug) ?? null;
});

export const getNeighborhoodSearchIndex = cache(async (): Promise<SearchIndexItem[]> => {
  if (!hasSupabaseEnv()) {
    return mockSearchIndex;
  }

  const supabase = createServerSupabaseClient();

  if (!supabase) {
    return mockSearchIndex;
  }

  const { data, error } = (await supabase
    .from("neighborhoods")
    .select("id, name, arrondissement, is_available, seo_metadata")) as {
    data:
      | Array<
          Pick<
            NeighborhoodRow,
            "id" | "name" | "arrondissement" | "is_available" | "seo_metadata"
          >
        >
      | null;
    error: { message: string } | null;
  };

  if (error || !data) {
    return mockSearchIndex;
  }

  return data.map((row) => {
    const seo = parseSeoMetadata(row.seo_metadata);

    return {
      id: row.id,
      name: row.name,
      slug: seo.slug ?? slugify(row.name),
      arrondissement: row.arrondissement,
      isAvailable: isNeighborhoodAvailable(seo.slug ?? slugify(row.name))
    };
  });
});

export const getAvailabilityCount = cache(async () => {
  return AVAILABLE_NEIGHBORHOOD_SLUGS.length;
});

export const getNeighborhoodGroups = cache(async () => {
  const neighborhoods = await listNeighborhoods({ sort: "popular" });

  return Array.from({ length: 16 }, (_, index) => ({
    arrondissement: index + 1,
    neighborhoods: neighborhoods.filter((item) => item.arrondissement === index + 1)
  }));
});

export async function recordVote(email: string, neighborhoodId: string) {
  if (!hasSupabaseEnv()) {
    return { success: true, demoMode: true };
  }

  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return { success: true, demoMode: true };
  }

  const { error } = await supabase.from("votes").insert({
    email: email.toLowerCase(),
    neighborhood_id: neighborhoodId
  });

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }

  return { success: true, duplicate: error?.code === "23505" };
}

export async function getAdminDashboardData() {
  if (!hasSupabaseEnv()) {
    return {
      neighborhoods: mockNeighborhoods,
      votes: mockVoteSummaries
    };
  }

  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return {
      neighborhoods: mockNeighborhoods,
      votes: mockVoteSummaries
    };
  }

  const [rowsResponse, metricsResponse, votesResponse] = await Promise.all([
    supabase.from("neighborhoods").select("*"),
    supabase.from("neighborhood_metrics").select("*"),
    supabase.from("votes").select("*").order("created_at", { ascending: false })
  ]);

  const rows = rowsResponse.data as NeighborhoodRow[] | null;
  const metricsRows = metricsResponse.data as NeighborhoodMetricsRow[] | null;
  const voteRows = votesResponse.data as VoteRow[] | null;

  if (!rows) {
    return {
      neighborhoods: mockNeighborhoods,
      votes: mockVoteSummaries
    };
  }

  const metricsMap = new Map(
    (metricsRows ?? []).map((item) => [item.neighborhood_id, item])
  );

  const neighborhoods = rows.map((row) =>
    enrichNeighborhood(row, metricsMap.get(row.id))
  );

  const votes = neighborhoods.map<VoteSummary>((item) => {
    const emails = (voteRows ?? [])
      .filter((vote) => vote.neighborhood_id === item.id)
      .map((vote) => vote.email);

    return {
      neighborhoodId: item.id,
      neighborhoodName: item.name,
      arrondissement: item.arrondissement,
      totalVotes: emails.length,
      emails
    };
  });

  return {
    neighborhoods,
    votes
  };
}

export async function updateNeighborhoodRecord(
  neighborhoodId: string,
  updates: Partial<{
    price: number;
    is_available: boolean;
    stock_by_size: Record<string, number>;
    release_date: string | null;
  }>
) {
  if (!hasSupabaseEnv()) {
    return { success: true, demoMode: true };
  }

  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return { success: true, demoMode: true };
  }

  const { error } = await supabase
    .from("neighborhoods")
    .update(updates)
    .eq("id", neighborhoodId);

  if (error) {
    throw new Error(error.message);
  }

  return { success: true };
}
