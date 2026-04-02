import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { z } from "zod";

import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getStripeClient, hasStripeEnv } from "@/lib/stripe";
import { getSiteUrl } from "@/lib/utils";

const checkoutSchema = z.object({
  items: z
    .array(
      z.object({
        neighborhoodId: z.string().min(1),
        slug: z.string().min(1),
        name: z.string().min(1),
        size: z.enum(["S", "M", "L", "XL"]),
        quantity: z.number().int().positive(),
        unitPrice: z.number().positive(),
        imageUrl: z.string().url()
      })
    )
    .min(1)
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { items } = checkoutSchema.parse(body);
    const origin = headers().get("origin") ?? getSiteUrl();

    if (process.env.RENDER_API_URL) {
      const response = await fetch(
        `${process.env.RENDER_API_URL.replace(/\/$/, "")}/checkout`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            items,
            origin
          })
        }
      );

      const payload = await response.json();
      return NextResponse.json(payload, { status: response.status });
    }

    if (!hasStripeEnv()) {
      return NextResponse.json({
        url: `${origin}/cart?demo=checkout`,
        demoMode: true
      });
    }

    const stripe = getStripeClient();

    if (!stripe) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 500 }
      );
    }

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      billing_address_collection: "required",
      success_url: `${origin}/cart?success=1&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart?canceled=1`,
      line_items: items.map((item) => ({
        quantity: item.quantity,
        price_data: {
          currency: "eur",
          unit_amount: Math.round(item.unitPrice * 100),
          product_data: {
            name: `111 ${item.name}`,
            description: `T-shirt quartier ${item.name} - Taille ${item.size}`,
            images: [item.imageUrl]
          }
        }
      }))
    });

    const supabase = createAdminSupabaseClient();

    if (supabase?.from && session.id) {
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          stripe_session_id: session.id,
          status: "pending"
        })
        .select("id")
        .single();

      if (!orderError && order) {
        await supabase.from("order_items").insert(
          items.map((item) => ({
            order_id: order.id,
            neighborhood_id: item.neighborhoodId,
            size: item.size,
            quantity: item.quantity,
            unit_price: Math.round(item.unitPrice * 100)
          }))
        );
      }
    }

    if (!session.url) {
      return NextResponse.json(
        { error: "Stripe did not return a checkout URL" },
        { status: 500 }
      );
    }

    return NextResponse.json({ url: session.url });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Invalid checkout payload" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Unable to create checkout session" },
      { status: 500 }
    );
  }
}
