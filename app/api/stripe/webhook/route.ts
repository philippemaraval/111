import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getStripeClient, hasStripeEnv } from "@/lib/stripe";

export async function POST(request: Request) {
  const signature = headers().get("stripe-signature");

  if (!hasStripeEnv() || !process.env.STRIPE_WEBHOOK_SECRET || !signature) {
    return NextResponse.json(
      { error: "Stripe webhook is not configured" },
      { status: 400 }
    );
  }

  const stripe = getStripeClient();

  if (!stripe) {
    return NextResponse.json({ error: "Missing Stripe client" }, { status: 500 });
  }

  const rawBody = await request.text();

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return NextResponse.json({ received: true, demoMode: true });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    await supabase
      .from("orders")
      .update({
        status: "paid",
        email: session.customer_details?.email ?? session.customer_email ?? null,
        amount_total: session.amount_total ?? null,
        currency: session.currency ?? null
      })
      .eq("stripe_session_id", session.id);
  }

  if (event.type === "checkout.session.expired") {
    const session = event.data.object as Stripe.Checkout.Session;

    await supabase
      .from("orders")
      .update({
        status: "expired"
      })
      .eq("stripe_session_id", session.id);
  }

  return NextResponse.json({ received: true });
}
