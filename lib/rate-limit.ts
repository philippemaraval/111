import { createHash } from "node:crypto";

import { createAdminSupabaseClient } from "@/lib/supabase/server";

function getClientAddress(request: Request) {
  return request.headers.get("cf-connecting-ip")
    ?? request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
    ?? "unknown";
}

export async function enforceRateLimit(request: Request, scope: string, maxRequests: number, windowSeconds: number) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return process.env.NODE_ENV !== "production";

  const fingerprint = createHash("sha256")
    .update(`${scope}:${getClientAddress(request)}:${process.env.RATE_LIMIT_SALT ?? "111"}`)
    .digest("hex");
  const { data, error } = await supabase.rpc("consume_rate_limit", {
    rate_key: `${scope}:${fingerprint}`,
    max_requests: maxRequests,
    window_seconds: windowSeconds
  });

  // Permet un déploiement sans coupure avant l'application de la migration 009.
  // Toute autre panne de la base reste fail-closed en production.
  if (error?.code === "PGRST202" || error?.code === "42883") return true;
  return !error && data === true;
}
