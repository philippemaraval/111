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
  Database,
  ContactMessage,
  Neighborhood,
  NeighborhoodMetricsRow,
  NeighborhoodRow,
  OrderSummary,
  Review,
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

  const supabase = await createServerSupabaseClient();

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

export const listPublishedReviews = cache(async (neighborhoodId: string): Promise<Review[]> => {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return [];
  const { data } = await supabase.from("reviews").select("*")
    .eq("neighborhood_id", neighborhoodId).eq("status", "published")
    .order("created_at", { ascending: false }).limit(20);
  return (data ?? []) as Review[];
});

export const getNeighborhoodSearchIndex = cache(async (): Promise<SearchIndexItem[]> => {
  if (!hasSupabaseEnv()) {
    return mockSearchIndex;
  }

  const supabase = await createServerSupabaseClient();

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

export async function recordVote(email: string, neighborhoodId: string, newsletterConsent: boolean) {
  if (!hasSupabaseEnv()) {
    throw new Error("Supabase public configuration is missing");
  }

  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    throw new Error("Supabase admin configuration is missing");
  }

  const { error } = await supabase.from("votes").insert({
    email: email.toLowerCase(),
    neighborhood_id: neighborhoodId,
    newsletter_consent: newsletterConsent
  });

  if (error && error.code !== "23505") {
    throw new Error(error.message);
  }

  if (error?.code === "23505" && newsletterConsent) {
    const { error: updateError } = await supabase
      .from("votes")
      .update({ newsletter_consent: true })
      .eq("email", email.toLowerCase())
      .eq("neighborhood_id", neighborhoodId);

    if (updateError) throw new Error(updateError.message);
  }

  return { success: true, duplicate: error?.code === "23505" };
}

export async function getAdminDashboardData() {
  if (!hasSupabaseEnv()) {
    return {
      neighborhoods: mockNeighborhoods,
      votes: mockVoteSummaries,
      orders: [] as OrderSummary[],
      messages: [] as ContactMessage[],
      reviews: [] as Review[]
    };
  }

  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return {
      neighborhoods: mockNeighborhoods,
      votes: mockVoteSummaries,
      orders: [] as OrderSummary[],
      messages: [] as ContactMessage[],
      reviews: [] as Review[]
    };
  }

  const [rowsResponse, metricsResponse, votesResponse, ordersResponse, orderItemsResponse, messagesResponse, orderEventsResponse, reviewsResponse] = await Promise.all([
    supabase.from("neighborhoods").select("*"),
    supabase.from("neighborhood_metrics").select("*"),
    supabase.from("votes").select("*").order("created_at", { ascending: false }),
    supabase.from("orders").select("*").order("created_at", { ascending: false }).limit(100),
    supabase.from("order_items").select("order_id, neighborhood_id, size, quantity"),
    supabase.from("contact_messages").select("*").order("created_at", { ascending: false }).limit(50),
    supabase.from("order_events").select("order_id, event_type, source, created_at").order("created_at", { ascending: false }).limit(500),
    supabase.from("reviews").select("*").order("created_at", { ascending: false }).limit(100)
  ]);

  const rows = rowsResponse.data as NeighborhoodRow[] | null;
  const metricsRows = metricsResponse.data as NeighborhoodMetricsRow[] | null;
  const voteRows = votesResponse.data as VoteRow[] | null;

  if (!rows) {
    return {
      neighborhoods: mockNeighborhoods,
      votes: mockVoteSummaries,
      orders: [] as OrderSummary[],
      messages: [] as ContactMessage[],
      reviews: [] as Review[]
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
      emails,
      newsletterEmails: (voteRows ?? [])
        .filter((vote) => vote.neighborhood_id === item.id && vote.newsletter_consent)
        .map((vote) => vote.email)
    };
  });

  const orderItems = (orderItemsResponse.data ?? []) as Array<{ order_id: string; neighborhood_id: string; size: "S" | "M" | "L" | "XL"; quantity: number }>;
  const neighborhoodNames = new Map(neighborhoods.map((item) => [item.id, item.name]));
  const orderEvents = (orderEventsResponse.data ?? []) as Array<{ order_id: string | null; event_type: string; source: string; created_at: string }>;
  const orders = ((ordersResponse.data ?? []) as Database["public"]["Tables"]["orders"]["Row"][])
    .map<OrderSummary>((order) => ({
      id: order.id,
      orderNumber: `111-${order.stripe_session_id.slice(-8).toUpperCase()}`,
      email: order.email,
      amountTotal: order.amount_total,
      currency: order.currency,
      status: order.status,
      createdAt: order.created_at,
      sendcloudImportedAt: order.sendcloud_imported_at,
      sendcloudError: order.sendcloud_error,
      itemCount: orderItems
        .filter((item) => item.order_id === order.id)
        .reduce((sum, item) => sum + item.quantity, 0),
      items: orderItems.filter((item) => item.order_id === order.id).map((item) => ({
        name: neighborhoodNames.get(item.neighborhood_id) ?? "Quartier inconnu",
        size: item.size,
        quantity: item.quantity
      })),
      lastEvent: (() => {
        const event = orderEvents.find((item) => item.order_id === order.id);
        return event ? { type: event.event_type, source: event.source, createdAt: event.created_at } : null;
      })()
    }));

  return {
    neighborhoods,
    votes,
    orders,
    messages: (messagesResponse.data ?? []) as ContactMessage[],
    reviews: (reviewsResponse.data ?? []) as Review[]
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
