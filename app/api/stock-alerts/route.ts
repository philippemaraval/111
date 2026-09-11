import { NextResponse } from "next/server";
import { z } from "zod";

import { enforceRateLimit } from "@/lib/rate-limit";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({ neighborhoodId: z.string().uuid(), size: z.enum(["S", "M", "L", "XL"]), email: z.string().email() });

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, "stock-alerts", 5, 3600)) return NextResponse.json({ error: "Trop de demandes." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Informations invalides." }, { status: 400 });
  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  const { error } = await supabase.from("stock_alerts").upsert({
    neighborhood_id: parsed.data.neighborhoodId,
    size: parsed.data.size,
    email: parsed.data.email.toLowerCase()
  }, { onConflict: "neighborhood_id,size,email", ignoreDuplicates: true });
  return error ? NextResponse.json({ error: "Inscription impossible." }, { status: 500 }) : NextResponse.json({ success: true });
}
