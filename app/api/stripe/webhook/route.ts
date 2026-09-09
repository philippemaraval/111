import { headers } from "next/headers";
import { NextResponse } from "next/server";
import Stripe from "stripe";

import { importPaidOrderToSendcloud } from "@/lib/sendcloud";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import { getStripeClient, hasStripeEnv } from "@/lib/stripe";

type CheckoutSessionWithCollectedInformation = Stripe.Checkout.Session & {
  collected_information?: {
    shipping_details?: Stripe.Checkout.Session.ShippingDetails | null;
  } | null;
};

async function handleCompletedCheckout(
  stripe: Stripe,
  supabase: NonNullable<ReturnType<typeof createAdminSupabaseClient>>,
  session: Stripe.Checkout.Session
) {
  const customerEmail = session.customer_details?.email ?? session.customer_email;
  const modernSession = session as CheckoutSessionWithCollectedInformation;
  const shippingDetails =
    modernSession.collected_information?.shipping_details ?? session.shipping_details;
  const shippingAddress = shippingDetails?.address;
  const customerName = shippingDetails?.name ?? session.customer_details?.name;
  const customerPhone = session.customer_details?.phone;

  await supabase
    .from("orders")
    .update({
      status: "paid",
      email: customerEmail ?? null,
      amount_total: session.amount_total ?? null,
      currency: session.currency ?? null
    })
    .eq("stripe_session_id", session.id);

  const shippingMethod = session.metadata?.shipping_method;
  const servicePointId = session.metadata?.service_point_id;
  const weightGrams = Number(session.metadata?.shipment_weight_grams ?? 0);

  // Les anciennes sessions Stripe ne contiennent pas toutes les données Sendcloud.
  if (
    !shippingMethod ||
    !Number.isFinite(weightGrams) ||
    weightGrams <= 0 ||
    (shippingMethod === "mondial-relay" && !servicePointId)
  ) {
    return;
  }

  if (
    !customerEmail ||
    !customerName ||
    !customerPhone ||
    !shippingAddress?.line1 ||
    !shippingAddress.postal_code ||
    !shippingAddress.city
  ) {
    throw new Error("sendcloud_missing_customer_details");
  }

  const lineItems = await stripe.checkout.sessions.listLineItems(session.id, { limit: 100 });
  const orderNumber = `111-${session.id.slice(-8).toUpperCase()}`;

  await importPaidOrderToSendcloud({
    sessionId: session.id,
    orderNumber,
    createdAt: new Date(session.created * 1000).toISOString(),
    customerName,
    customerEmail,
    customerPhone,
    addressLine1: shippingAddress.line1,
    addressLine2: shippingAddress.line2,
    postalCode: shippingAddress.postal_code,
    city: shippingAddress.city,
    countryCode: shippingAddress.country ?? "FR",
    amountTotal: session.amount_total ?? 0,
    shippingAmount: session.total_details?.amount_shipping ?? 0,
    currency: session.currency ?? "eur",
    weightGrams,
    shippingLabel: session.metadata?.shipping_label ?? shippingMethod,
    servicePointId: shippingMethod === "mondial-relay" ? servicePointId : undefined,
    lines: lineItems.data.map((item) => ({
      name: item.description ?? "T-shirt 111",
      quantity: item.quantity ?? 1,
      amountTotal: item.amount_total
    }))
  });
}

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
    event = await stripe.webhooks.constructEventAsync(
      rawBody,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Invalid signature" },
      { status: 400 }
    );
  }

  const supabase = createAdminSupabaseClient();

  if (!supabase) {
    return NextResponse.json(
      { error: "Supabase webhook configuration is missing" },
      { status: 500 }
    );
  }

  if (
    event.type === "checkout.session.completed" ||
    event.type === "checkout.session.async_payment_succeeded"
  ) {
    const session = event.data.object as Stripe.Checkout.Session;

    if (
      session.payment_status === "paid" ||
      session.payment_status === "no_payment_required"
    ) {
      try {
        await handleCompletedCheckout(stripe, supabase, session);
      } catch (error) {
        return NextResponse.json(
          {
            error: error instanceof Error
              ? error.message
              : "Unable to process completed checkout"
          },
          { status: 500 }
        );
      }
    }
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
