import { NextResponse } from "next/server";

import { hasSendcloudEnv } from "@/lib/sendcloud";
import { hasStripeEnv } from "@/lib/stripe";
import { createAdminSupabaseClient, hasSupabaseEnv } from "@/lib/supabase/server";

export async function GET() {
  const supabase = createAdminSupabaseClient();
  let database = false;
  if (supabase) {
    const { error } = await supabase.from("neighborhoods").select("id").limit(1);
    database = !error;
  }
  const checks = { database, supabase: hasSupabaseEnv(), stripe: hasStripeEnv(), sendcloud: hasSendcloudEnv() };
  const healthy = Object.values(checks).every(Boolean);
  return NextResponse.json({ status: healthy ? "ok" : "degraded", checks }, {
    status: healthy ? 200 : 503,
    headers: { "Cache-Control": "no-store" }
  });
}
