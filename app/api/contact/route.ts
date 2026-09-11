import { NextResponse } from "next/server";
import { z } from "zod";
import { enforceRateLimit } from "@/lib/rate-limit";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({ name: z.string().trim().min(2).max(100), email: z.string().email(), subject: z.string().trim().min(2).max(150), message: z.string().trim().min(10).max(4000), website: z.string().max(0) });

export async function POST(request: Request) {
  if (!await enforceRateLimit(request, "contact", 4, 3600)) return NextResponse.json({ error: "Trop de messages." }, { status: 429 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Formulaire invalide." }, { status: 400 });
  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Service indisponible." }, { status: 503 });
  const message = { name: parsed.data.name, email: parsed.data.email, subject: parsed.data.subject, message: parsed.data.message };
  const { error } = await supabase.from("contact_messages").insert({ ...message, email: message.email.toLowerCase() });
  return error ? NextResponse.json({ error: "Envoi impossible." }, { status: 500 }) : NextResponse.json({ success: true });
}
