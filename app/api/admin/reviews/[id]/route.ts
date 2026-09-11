import { NextResponse } from "next/server";
import { z } from "zod";
import { getAdminAccess } from "@/lib/auth";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const schema = z.object({ status: z.enum(["published", "rejected"]) });

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const access = await getAdminAccess();
  if (!access.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  const supabase = createAdminSupabaseClient();
  if (!supabase) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });
  const { id } = await params;
  const { error } = await supabase.from("reviews").update({ status: parsed.data.status }).eq("id", id);
  return error ? NextResponse.json({ error: "Update failed" }, { status: 500 }) : NextResponse.json({ success: true });
}
