import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminAccess } from "@/lib/auth";
import { updateNeighborhoodRecord } from "@/lib/neighborhoods";

const updateSchema = z.object({
  price: z.number().nonnegative(),
  isAvailable: z.boolean(),
  releaseDate: z.string().nullable(),
  stockBySize: z.object({
    S: z.number().int().nonnegative(),
    M: z.number().int().nonnegative(),
    L: z.number().int().nonnegative(),
    XL: z.number().int().nonnegative()
  })
});

type RouteProps = {
  params: {
    id: string;
  };
};

export async function PATCH(request: Request, { params }: RouteProps) {
  const access = await getAdminAccess();

  if (!access.demoMode && !access.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const payload = updateSchema.parse(body);
    const result = await updateNeighborhoodRecord(params.id, {
      price: payload.price,
      is_available: payload.isAvailable,
      release_date: payload.releaseDate,
      stock_by_size: payload.stockBySize
    });

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid payload" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unable to update neighborhood" },
      { status: 500 }
    );
  }
}
