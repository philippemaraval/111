import { NextResponse } from "next/server";
import { getAdminAccess } from "@/lib/auth";
import { dispatchPendingEmailJobs } from "@/lib/email-automations";

export async function POST() {
  const access = await getAdminAccess();
  if (!access.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  return NextResponse.json(await dispatchPendingEmailJobs());
}
