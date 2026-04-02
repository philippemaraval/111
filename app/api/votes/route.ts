import { NextResponse } from "next/server";
import { z } from "zod";

import { recordVote } from "@/lib/neighborhoods";

const voteSchema = z.object({
  email: z.string().email(),
  neighborhoodId: z.string().min(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const payload = voteSchema.parse(body);
    const result = await recordVote(payload.email, payload.neighborhoodId);

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Vote registration failed" },
      { status: 500 }
    );
  }
}
