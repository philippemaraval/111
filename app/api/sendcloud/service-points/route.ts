import { NextResponse } from "next/server";
import { z } from "zod";

import {
  hasSendcloudEnv,
  searchMondialRelayServicePoints
} from "@/lib/sendcloud";
import { enforceRateLimit } from "@/lib/rate-limit";

const postalCodeSchema = z.string().regex(/^\d{5}$/);

export async function GET(request: Request) {
  if (!await enforceRateLimit(request, "service-points", 30, 60)) {
    return NextResponse.json({ error: "Trop de recherches. Réessayez dans une minute." }, { status: 429 });
  }
  if (!hasSendcloudEnv()) {
    return NextResponse.json(
      { error: "La sélection des points relais n’est pas encore configurée." },
      { status: 503 }
    );
  }

  const postalCode = new URL(request.url).searchParams.get("postalCode") ?? "";
  const parsed = postalCodeSchema.safeParse(postalCode);

  if (!parsed.success) {
    return NextResponse.json(
      { error: "Saisissez un code postal français valide." },
      { status: 400 }
    );
  }

  try {
    const servicePoints = await searchMondialRelayServicePoints(parsed.data);
    return NextResponse.json(
      { servicePoints },
      { headers: { "Cache-Control": "private, max-age=300" } }
    );
  } catch {
    return NextResponse.json(
      { error: "Les points relais sont temporairement indisponibles." },
      { status: 502 }
    );
  }
}
