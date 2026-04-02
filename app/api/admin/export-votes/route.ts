import { NextResponse } from "next/server";

import { getAdminAccess } from "@/lib/auth";
import { getAdminDashboardData } from "@/lib/neighborhoods";

export async function GET() {
  const access = await getAdminAccess();

  if (!access.demoMode && !access.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { votes } = await getAdminDashboardData();

  const rows = [
    "neighborhood,arrondissement,total_votes,emails",
    ...votes.map(
      (vote) =>
        `"${vote.neighborhoodName.replace(/"/g, '""')}",${vote.arrondissement},${vote.totalVotes},"${vote.emails.join(" | ")}"`
    )
  ].join("\n");

  return new NextResponse(rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="votes-quartiers.csv"'
    }
  });
}
