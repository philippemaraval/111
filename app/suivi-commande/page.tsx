import type { Metadata } from "next";

import { OrderTrackingForm } from "@/components/order-tracking-form";

export const metadata: Metadata = { title: "Suivi de commande | 111 Marseille", robots: { index: false, follow: false } };

export default function OrderTrackingPage() {
  return <main className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6"><p className="section-kicker">Après votre achat</p><h1 className="mt-3 text-5xl font-black uppercase tracking-tight sm:text-7xl">Suivre ma commande.</h1><p className="mx-auto mb-10 mt-5 max-w-xl text-navy/60">Saisissez la référence reçue après le paiement et l’adresse e-mail utilisée pour commander.</p><OrderTrackingForm /></main>;
}
