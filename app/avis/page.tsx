import type { Metadata } from "next";
import { ReviewForm } from "@/components/review-form";
import { listNeighborhoods } from "@/lib/neighborhoods";

export const metadata: Metadata = { title: "Donner un avis | 111 Marseille", description: "Partagez votre avis vérifié sur votre t-shirt 111 Marseille." };

export default async function ReviewsPage() {
  const neighborhoods = await listNeighborhoods({ sort: "name" });
  return <main className="mx-auto max-w-5xl px-4 py-16 text-center sm:px-6"><p className="section-kicker">Après votre achat</p><h1 className="mt-3 text-5xl font-black uppercase sm:text-7xl">Votre avis compte.</h1><p className="mx-auto mb-10 mt-5 max-w-xl text-navy/65">La référence et l’e-mail servent uniquement à vérifier que l’avis correspond à un achat réel.</p><ReviewForm neighborhoods={neighborhoods.map(({ id, name }) => ({ id, name }))} /></main>;
}
