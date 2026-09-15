import { NextResponse } from "next/server";

import { getAdminAccess } from "@/lib/auth";
import { notifyNeighborhoodVoters } from "@/lib/email-automations";

type RouteProps = { params: Promise<{ id: string }> };

export async function POST(_request: Request, { params }: RouteProps) {
  const access = await getAdminAccess();
  if (!access.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  try {
    const { id } = await params;
    return NextResponse.json(await notifyNeighborhoodVoters(id));
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Unable to notify voters" }, { status: 400 });
  }
}
