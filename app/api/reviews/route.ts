import { NextResponse } from "next/server";
import { z } from "zod";

import { enforceRateLimit } from "@/lib/rate-limit";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  orderNumber: z.string().trim().regex(/^111-[A-Z0-9_]{8}$/i),
  email: z.string().trim().email(),
  neighborhoodId: z.string().uuid(),
  authorName: z.string().trim().min(2).max(60),
  rating: z.number().int().min(1).max(5),
  body: z.string().trim().min(10).max(1200)
});

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, "reviews", 3, 3600)) return NextResponse.json({ error: "Trop de tentatives." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Avis invalide." }, { status: 400 });
  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });

  const suffix = parsed.data.orderNumber.slice(4).toLowerCase();
  const { data: orders } = await supabase.from("orders").select("id, status")
    .ilike("stripe_session_id", `%${suffix}`).ilike("email", parsed.data.email).limit(1);
  const order = orders?.[0];
  if (!order || !["paid", "preparing", "shipped", "delivered", "returned", "refunded"].includes(order.status)) {
    return NextResponse.json({ error: "Commande vérifiable introuvable." }, { status: 404 });
  }
  const { data: item } = await supabase.from("order_items").select("id").eq("order_id", order.id)
    .eq("neighborhood_id", parsed.data.neighborhoodId).limit(1).maybeSingle();
  if (!item) return NextResponse.json({ error: "Ce quartier ne figure pas dans cette commande." }, { status: 400 });

  const { error } = await supabase.from("reviews").insert({
    order_id: order.id, neighborhood_id: parsed.data.neighborhoodId,
    author_name: parsed.data.authorName, rating: parsed.data.rating, body: parsed.data.body
  });
  if (error?.code === "23505") return NextResponse.json({ error: "Un avis existe déjà pour cet article." }, { status: 409 });
  return error ? NextResponse.json({ error: "Enregistrement impossible." }, { status: 500 }) : NextResponse.json({ success: true });
}
