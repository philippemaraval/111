import { NextResponse } from "next/server";
import { z } from "zod";

import { getAdminAccess } from "@/lib/auth";
import { deleteSendcloudOrder, updateSendcloudOrderStatus } from "@/lib/sendcloud";
import { getStripeClient } from "@/lib/stripe";
import { createAdminSupabaseClient } from "@/lib/supabase/server";

const schema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("set-status"), status: z.enum(["preparing", "shipped", "delivered", "returned"]) }),
  z.object({ action: z.literal("cancel") }),
  z.object({ action: z.literal("refund") })
]);

type Props = { params: Promise<{ id: string }> };

export async function PATCH(request: Request, { params }: Props) {
  const access = await getAdminAccess();
  if (!access.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid action" }, { status: 400 });

  const supabase = createAdminSupabaseClient();
  const stripe = getStripeClient();
  if (!supabase || !stripe) return NextResponse.json({ error: "Service unavailable" }, { status: 503 });

  const { id } = await params;
  const { data: order, error } = await supabase.from("orders").select("*").eq("id", id).single();
  if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

  try {
    let nextStatus = order.status;
    if (parsed.data.action === "set-status") {
      nextStatus = parsed.data.status;
      if (order.sendcloud_order_id) {
        await updateSendcloudOrderStatus(order.sendcloud_order_id, nextStatus, nextStatus);
      }
      await supabase.from("orders").update({
        status: nextStatus,
        shipping_status: nextStatus === "shipped" || nextStatus === "delivered" ? nextStatus : order.shipping_status
      }).eq("id", id);
    } else {
      const session = await stripe.checkout.sessions.retrieve(order.stripe_session_id);
      if (session.payment_status === "paid" && typeof session.payment_intent === "string") {
        await stripe.refunds.create(
          { payment_intent: session.payment_intent, reason: "requested_by_customer" },
          { idempotencyKey: `admin-refund-${order.id}` }
        );
        nextStatus = "refund_pending";
      } else {
        if (session.status === "open") await stripe.checkout.sessions.expire(session.id);
        nextStatus = "cancelled";
      }

      if (order.sendcloud_order_id) await deleteSendcloudOrder(order.sendcloud_order_id);
      await supabase.from("orders").update({
        status: nextStatus,
        shipping_status: "cancelled",
        cancelled_at: parsed.data.action === "cancel" ? new Date().toISOString() : order.cancelled_at
      }).eq("id", id);
    }

    await supabase.from("order_events").insert({
      order_id: id,
      event_type: parsed.data.action === "set-status" ? nextStatus : parsed.data.action,
      source: "admin",
      detail: { admin_email: access.user.email ?? null }
    });
    return NextResponse.json({ success: true, status: nextStatus });
  } catch (actionError) {
    await supabase.from("order_events").insert({
      order_id: id,
      event_type: "action_failed",
      source: "admin",
      detail: { action: parsed.data.action, message: actionError instanceof Error ? actionError.message.slice(0, 300) : "unknown" }
    });
    return NextResponse.json({ error: "Order action failed" }, { status: 502 });
  }
}
