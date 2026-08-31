import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { MYSTERY_PACK_PRICE_EUROS, PACK_PRICES_EUROS, PRODUCT_PRICE_EUROS } from "@/lib/constants";
import { listNeighborhoods } from "@/lib/neighborhoods";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getStripeClient, hasStripeEnv } from "@/lib/stripe";
import { calculateShippingPrice, getShippingLabel } from "@/lib/shipping";
import type { Neighborhood, Size } from "@/lib/types";
import { getSiteUrl } from "@/lib/utils";

const selectionSchema = z.object({
  neighborhoodId: z.string().min(1), slug: z.string().min(1), name: z.string().min(1),
  size: z.enum(["S", "M", "L", "XL"]), imageUrl: z.string().min(1)
});
const cartItemSchema = z.object({
  id: z.string().min(1), kind: z.enum(["individual", "pack", "mystery-pack"]),
  name: z.string().min(1), quantity: z.number().int().positive().max(20),
  unitPrice: z.number().positive(), imageUrl: z.string().min(1),
  selections: z.array(selectionSchema).min(1).max(5)
});
const checkoutSchema = z.object({
  items: z.array(cartItemSchema).min(1).max(30),
  shippingMethod: z.enum(["mondial-relay", "home"])
});
type InputItem = z.infer<typeof cartItemSchema>;
type ResolvedItem = {
  kind: InputItem["kind"];
  name: string;
  quantity: number;
  unitPrice: number;
  selections: Array<{ neighborhood: Neighborhood; size: Size }>;
};

function assignMysteryNeighborhoods(neighborhoods: Neighborhood[], sizes: Size[]) {
  function find(index: number, used: Set<string>): Neighborhood[] | null {
    if (index === sizes.length) return [];
    const candidates = neighborhoods
      .filter((item) => !used.has(item.id) && item.stockBySize[sizes[index]] > 0)
      .map((item) => ({ item, score: Math.random() * item.stockBySize[sizes[index]] }))
      .sort((a, b) => b.score - a.score)
      .map(({ item }) => item);
    for (const candidate of candidates) {
      used.add(candidate.id);
      const rest = find(index + 1, used);
      if (rest) return [candidate, ...rest];
      used.delete(candidate.id);
    }
    return null;
  }
  return find(0, new Set());
}

function validateStock(items: ResolvedItem[]) {
  const requested = new Map<string, number>();
  for (const item of items) {
    for (const selection of item.selections) {
      const key = `${selection.neighborhood.id}:${selection.size}`;
      requested.set(key, (requested.get(key) ?? 0) + item.quantity);
      if ((requested.get(key) ?? 0) > selection.neighborhood.stockBySize[selection.size]) {
        throw new Error("stock_unavailable");
      }
    }
  }
}

function resolveItems(items: InputItem[], neighborhoods: Neighborhood[]): ResolvedItem[] {
  const available = neighborhoods.filter((item) => item.isAvailable);
  const byId = new Map(available.map((item) => [item.id, item]));
  const resolved = items.map<ResolvedItem>((item) => {
    if (item.kind === "individual") {
      if (item.selections.length !== 1) throw new Error("invalid_item");
      const input = item.selections[0];
      const neighborhood = byId.get(input.neighborhoodId);
      if (!neighborhood) throw new Error("invalid_item");
      return { kind: item.kind, name: `T-shirt ${neighborhood.name}`, quantity: item.quantity,
        unitPrice: PRODUCT_PRICE_EUROS, selections: [{ neighborhood, size: input.size }] };
    }
    if (item.quantity !== 1) throw new Error("invalid_pack_quantity");
    if (item.kind === "mystery-pack") {
      if (item.selections.length !== 3) throw new Error("invalid_pack");
      const sizes = item.selections.map((selection) => selection.size);
      const assigned = assignMysteryNeighborhoods(available, sizes);
      if (!assigned) throw new Error("stock_unavailable");
      return { kind: item.kind, name: "Pack surprise · 3 quartiers", quantity: 1,
        unitPrice: MYSTERY_PACK_PRICE_EUROS,
        selections: assigned.map((neighborhood, index) => ({ neighborhood, size: sizes[index] })) };
    }
    const count = item.selections.length;
    if (count !== 3 && count !== 4 && count !== 5) throw new Error("invalid_pack");
    const selections = item.selections.map((input) => {
      const neighborhood = byId.get(input.neighborhoodId);
      if (!neighborhood) throw new Error("invalid_pack");
      return { neighborhood, size: input.size };
    });
    return { kind: item.kind, name: `Pack au choix · ${count} tee-shirts`, quantity: 1,
      unitPrice: PACK_PRICES_EUROS[count], selections };
  });
  validateStock(resolved);
  return resolved;
}

export async function POST(request: Request) {
  try {
    const { items, shippingMethod } = checkoutSchema.parse(await request.json());
    const neighborhoods = await listNeighborhoods({ availability: "available" });
    const resolvedItems = resolveItems(items, neighborhoods);
    const subtotal = resolvedItems.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
    const shirtCount = resolvedItems.reduce(
      (sum, item) => sum + item.selections.length * item.quantity,
      0
    );
    const shippingPrice = calculateShippingPrice(subtotal);
    const origin = headers().get("origin") ?? getSiteUrl();

    if (process.env.RENDER_API_URL) {
      const forwardedItems = resolvedItems.flatMap((item) => {
        const totalCents = Math.round(item.unitPrice * 100);
        const basePrice = Math.floor(totalCents / item.selections.length);
        const remainder = totalCents - basePrice * item.selections.length;
        return item.selections.map((selection, index) => ({
          neighborhoodId: selection.neighborhood.id,
          slug: selection.neighborhood.slug,
          name: selection.neighborhood.name,
          size: selection.size,
          quantity: item.quantity,
          unitPrice: (basePrice + (index < remainder ? 1 : 0)) / 100,
          imageUrl: selection.neighborhood.imageUrl
        }));
      });
      const response = await fetch(`${process.env.RENDER_API_URL.replace(/\/$/, "")}/checkout`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          items: forwardedItems,
          origin,
          shippingMethod,
          shippingAmount: Math.round(shippingPrice * 100)
        })
      });
      const payload = await response.json();
      return NextResponse.json(payload, { status: response.status });
    }

    if (!hasStripeEnv()) return NextResponse.json({ url: `${origin}/cart?demo=checkout`, demoMode: true });
    const stripe = getStripeClient();
    if (!stripe) return NextResponse.json({ error: "Stripe is not configured" }, { status: 500 });

    const session = await stripe.checkout.sessions.create({
      mode: "payment", billing_address_collection: "required",
      shipping_address_collection: shippingMethod === "home" ? { allowed_countries: ["FR"] } : undefined,
      shipping_options: shippingPrice > 0 ? [{ shipping_rate_data: {
        type: "fixed_amount",
        display_name: getShippingLabel(shippingMethod),
        fixed_amount: { currency: "eur", amount: Math.round(shippingPrice * 100) }
      }}] : undefined,
      metadata: {
        shipping_method: shippingMethod,
        shipping_label: getShippingLabel(shippingMethod),
        shirt_count: String(shirtCount)
      },
      success_url: `${origin}/cart?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=1`,
      line_items: resolvedItems.map((item) => ({ quantity: item.quantity, price_data: {
        currency: "eur", unit_amount: Math.round(item.unitPrice * 100), product_data: {
          name: `111 · ${item.name}`,
          description: item.selections.map(({ neighborhood, size }) => `${neighborhood.name} (${size})`).join(" · ")
        }
      }}))
    });

    const supabase = createAdminSupabaseClient();
    if (supabase?.from && session.id) {
      const { data: order, error: orderError } = await supabase.from("orders")
        .insert({ stripe_session_id: session.id, status: "pending" }).select("id").single();
      if (!orderError && order) {
        const orderItems = resolvedItems.flatMap((item) => {
          const totalCents = Math.round(item.unitPrice * 100);
          const basePrice = Math.floor(totalCents / item.selections.length);
          const remainder = totalCents - basePrice * item.selections.length;
          return item.selections.map((selection, index) => ({
            order_id: order.id, neighborhood_id: selection.neighborhood.id, size: selection.size,
            quantity: item.quantity, unit_price: basePrice + (index < remainder ? 1 : 0)
          }));
        });
        await supabase.from("order_items").insert(orderItems);
      }
    }
    if (!session.url) return NextResponse.json({ error: "Stripe did not return a checkout URL" }, { status: 500 });
    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) return NextResponse.json({ error: "Invalid checkout payload" }, { status: 400 });
    if (error instanceof Error && error.message === "stock_unavailable") {
      return NextResponse.json({ error: "Une taille n’est plus disponible en quantité suffisante." }, { status: 409 });
    }
    if (error instanceof Error && error.message.startsWith("invalid_")) {
      return NextResponse.json({ error: "Le contenu du panier est invalide." }, { status: 400 });
    }
    return NextResponse.json({ error: "Unable to create checkout session" }, { status: 500 });
  }
}
