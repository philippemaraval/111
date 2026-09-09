import type { Metadata } from "next";
import Link from "next/link";
import type Stripe from "stripe";
import {
  ArrowRight,
  CheckCircle2,
  Clock3,
  Mail,
  MapPin,
  PackageCheck
} from "lucide-react";

import { OrderConfirmationClient } from "@/components/checkout/order-confirmation-client";
import { getStripeClient } from "@/lib/stripe";
import { formatCurrency } from "@/lib/utils";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Confirmation de commande — 111 Marseille",
  robots: { index: false, follow: false }
};

type ConfirmationPageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

function firstParam(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

function ConfirmationUnavailable() {
  return (
    <main className="mx-auto grid min-h-[65vh] max-w-2xl place-items-center px-4 py-16 text-center">
      <div>
        <p className="section-kicker">Confirmation indisponible</p>
        <h1 className="mt-4 text-4xl font-black uppercase tracking-[-0.04em] sm:text-6xl">
          Nous ne retrouvons pas cette commande.
        </h1>
        <p className="mx-auto mt-5 max-w-lg leading-7 text-navy/55">
          Si ton paiement a été débité, écris-nous avec l’adresse e-mail utilisée lors du paiement.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link href="/contact" className="focus-ring rounded-full bg-sea px-6 py-4 text-sm font-bold text-white hover:bg-navy">
            Nous contacter
          </Link>
          <Link href="/" className="focus-ring rounded-full border border-navy/15 px-6 py-4 text-sm font-bold hover:border-sea hover:text-sea">
            Retour à l’accueil
          </Link>
        </div>
      </div>
    </main>
  );
}

export default async function ConfirmationPage({ searchParams }: ConfirmationPageProps) {
  const sessionId = firstParam(searchParams?.session_id);
  const stripe = getStripeClient();

  if (!stripe || !sessionId || !/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return <ConfirmationUnavailable />;
  }

  let session: Stripe.Checkout.Session;

  try {
    session = await stripe.checkout.sessions.retrieve(sessionId);
  } catch {
    return <ConfirmationUnavailable />;
  }

  const paymentConfirmed =
    session.payment_status === "paid" ||
    session.payment_status === "no_payment_required";
  const orderNumber = `111-${session.id.slice(-8).toUpperCase()}`;
  const email = session.customer_details?.email ?? session.customer_email;
  const shippingLabel = session.metadata?.shipping_label ?? "Livraison suivie";
  const servicePointName = session.metadata?.service_point_name;
  const servicePointAddress = session.metadata?.service_point_address;

  return (
    <main className="mx-auto max-w-4xl px-4 py-12 pb-24 sm:px-6 sm:py-20">
      <OrderConfirmationClient paymentConfirmed={paymentConfirmed} />

      <section className="overflow-hidden rounded-[28px] border border-navy/10 bg-white shadow-sm">
        <div className={`px-6 py-10 text-center sm:px-10 ${paymentConfirmed ? "bg-olive/10" : "bg-sun/20"}`}>
          {paymentConfirmed
            ? <CheckCircle2 className="mx-auto h-14 w-14 text-olive" />
            : <Clock3 className="mx-auto h-14 w-14 text-navy" />}
          <p className="section-kicker mt-5">
            {paymentConfirmed ? "Commande confirmée" : "Paiement en cours"}
          </p>
          <h1 className="mt-2 text-4xl font-black uppercase tracking-[-0.04em] sm:text-6xl">
            {paymentConfirmed ? "Merci, Marseille !" : "Encore un instant."}
          </h1>
          <p className="mx-auto mt-4 max-w-xl leading-7 text-navy/60">
            {paymentConfirmed
              ? "Ton paiement est confirmé. Nous allons maintenant préparer ta commande avec soin."
              : "Ton paiement est encore en cours de validation. Nous t’écrirons dès qu’il sera confirmé."}
          </p>
        </div>

        <div className="grid gap-8 p-6 sm:p-10 md:grid-cols-2">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy/40">Commande</p>
            <p className="mt-2 text-2xl font-black">{orderNumber}</p>
            <p className="mt-2 text-sm text-navy/55">
              Total payé : <strong className="text-navy">{formatCurrency((session.amount_total ?? 0) / 100)}</strong>
            </p>
          </div>

          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-navy/40">Livraison</p>
            <p className="mt-2 font-black">{shippingLabel}</p>
            {servicePointName && (
              <div className="mt-3 flex items-start gap-2 text-sm text-navy/55">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-sea" />
                <p><strong className="block text-navy">{servicePointName}</strong>{servicePointAddress}</p>
              </div>
            )}
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-sand p-4">
            <Mail className="mt-0.5 h-5 w-5 shrink-0 text-sea" />
            <div>
              <p className="text-sm font-black">Adresse de contact</p>
              <p className="mt-1 text-xs leading-5 text-navy/50">
                {email ? `Nous utiliserons ${email} pour les informations liées à ta commande.` : "Nous utiliserons l’adresse saisie lors du paiement pour t’informer."}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-2xl bg-sand p-4">
            <PackageCheck className="mt-0.5 h-5 w-5 shrink-0 text-olive" />
            <div>
              <p className="text-sm font-black">Prochaine étape</p>
              <p className="mt-1 text-xs leading-5 text-navy/50">
                Tu recevras le suivi dès que ton colis sera confié à Mondial Relay.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="mt-8 text-center">
        <Link href="/#collection" className="focus-ring inline-flex items-center gap-2 rounded-full bg-navy px-6 py-4 text-sm font-bold text-white hover:bg-sea">
          Continuer à découvrir 111 <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    </main>
  );
}
