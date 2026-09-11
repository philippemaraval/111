import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { z } from "zod";

import { enforceRateLimit } from "@/lib/rate-limit";
import { isAdminEmail } from "@/lib/utils";
import { getSiteUrl } from "@/lib/utils";

const schema = z.object({ email: z.string().email() });

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, "admin-login", 5, 900)) {
    return NextResponse.json({ error: "Trop de tentatives. Réessayez plus tard." }, { status: 429 });
  }

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success || !isAdminEmail(parsed.data.email)) {
    return NextResponse.json({ sent: true });
  }

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });

  const supabase = createClient(url, anonKey, { auth: { persistSession: false } });
  const { error } = await supabase.auth.signInWithOtp({
    email: parsed.data.email,
    options: { emailRedirectTo: `${getSiteUrl()}/auth/callback?next=/admin` }
  });

  if (error) return NextResponse.json({ error: "Connexion indisponible." }, { status: 503 });
  return NextResponse.json({ sent: true });
}
