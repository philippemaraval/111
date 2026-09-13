import { CONTACT_EMAIL } from "@/lib/site";
import { createAdminSupabaseClient } from "@/lib/supabase/server";
import type { Database } from "@/lib/types";

type EmailJobInsert = Database["public"]["Tables"]["email_jobs"]["Insert"];
type EmailJob = Database["public"]["Tables"]["email_jobs"]["Row"];

export async function queueEmail(job: EmailJobInsert) {
  const supabase = createAdminSupabaseClient();
  if (!supabase) return;
  await supabase.from("email_jobs").upsert(job, { onConflict: "dedupe_key", ignoreDuplicates: true });
  await dispatchPendingEmailJobs(5);
}

export async function dispatchPendingEmailJobs(limit = 20) {
  const supabase = createAdminSupabaseClient();
  const endpoint = process.env.EMAIL_AUTOMATION_WEBHOOK_URL;
  const token = process.env.EMAIL_AUTOMATION_TOKEN;
  if (!supabase || !endpoint || !token) return { configured: false, sent: 0, failed: 0 };

  const { data } = await supabase.rpc("claim_email_jobs", { max_jobs: limit });
  let sent = 0;
  let failed = 0;
  for (const job of (data ?? []) as EmailJob[]) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ token, id: job.id, type: job.kind, to: job.recipient, subject: job.subject, text: job.body, replyTo: job.reply_to })
      });
      const delivery = await response.json().catch(() => null) as { success?: boolean } | null;
      if (!response.ok || delivery?.success !== true) throw new Error(`email_webhook_${response.status}`);
      await supabase.from("email_jobs").update({ status: "sent", sent_at: new Date().toISOString(), last_error: null }).eq("id", job.id);
      if (job.kind === "stock_back" && job.dedupe_key?.startsWith("stock:")) {
        await supabase.from("stock_alerts").update({ notified_at: new Date().toISOString() }).eq("id", job.dedupe_key.slice(6));
      }
      sent += 1;
    } catch (error) {
      const delayMinutes = Math.min(60, 2 ** job.attempts);
      await supabase.from("email_jobs").update({
        status: "failed",
        last_error: error instanceof Error ? error.message.slice(0, 300) : "unknown",
        available_at: new Date(Date.now() + delayMinutes * 60_000).toISOString()
      }).eq("id", job.id);
      failed += 1;
    }
  }
  return { configured: true, sent, failed };
}

export function contactNotificationJob(input: { id: string; name: string; email: string; subject: string; message: string }): EmailJobInsert {
  return { kind: "contact_notification", recipient: CONTACT_EMAIL, reply_to: input.email,
    subject: `[111] Nouveau message : ${input.subject}`,
    body: `${input.name} (${input.email}) a écrit :\n\n${input.message}`,
    dedupe_key: `contact:${input.id}` };
}

export function stockBackJob(input: { alertId: string; email: string; neighborhoodName: string; slug: string; size: string }): EmailJobInsert {
  return { kind: "stock_back", recipient: input.email,
    subject: `${input.neighborhoodName} est de retour en taille ${input.size}`,
    body: `Bonne nouvelle : le t-shirt 111 ${input.neighborhoodName} est de nouveau disponible en taille ${input.size}.\n\n${process.env.NEXT_PUBLIC_SITE_URL ?? "https://111.sunmedia.workers.dev"}/quartier/${input.slug}`,
    dedupe_key: `stock:${input.alertId}` };
}

export function reviewRequestJob(input: { orderId: string; orderNumber: string; email: string }): EmailJobInsert {
  return { kind: "review_request", recipient: input.email, subject: `Votre avis sur la commande ${input.orderNumber}`,
    body: `Votre commande 111 est arrivée. Vous pouvez partager votre avis vérifié ici :\n\n${process.env.NEXT_PUBLIC_SITE_URL ?? "https://111.sunmedia.workers.dev"}/avis\n\nRéférence : ${input.orderNumber}`,
    dedupe_key: `review:${input.orderId}` };
}
