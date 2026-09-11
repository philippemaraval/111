import { NextResponse } from "next/server";
import { z } from "zod";

import { enforceRateLimit } from "@/lib/rate-limit";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({
  orderNumber: z.string().trim().regex(/^111-[A-Z0-9_]{8}$/i),
  email: z.string().trim().email()
});

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, "order-tracking", 10, 900)) {
    return NextResponse.json({ error: "Trop de recherches. Réessayez plus tard." }, { status: 429 });
  }
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Informations invalides." }, { status: 400 });

  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });

  const suffix = parsed.data.orderNumber.slice(4).toLowerCase();
  const { data: orders } = await supabase.from("orders").select("id, stripe_session_id, status, shipping_status, updated_at")
    .ilike("stripe_session_id", `%${suffix}`).ilike("email", parsed.data.email).limit(1);
  const order = orders?.[0];
  if (!order) return NextResponse.json({ error: "Commande introuvable." }, { status: 404 });

  return NextResponse.json({
    orderNumber: `111-${order.stripe_session_id.slice(-8).toUpperCase()}`,
    status: order.status,
    shippingStatus: order.shipping_status,
    updatedAt: order.updated_at
  });
}
