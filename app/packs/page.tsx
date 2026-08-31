import type { Metadata } from "next";

import { PackBuilder } from "@/components/packs/pack-builder";
import { listNeighborhoods } from "@/lib/neighborhoods";

export const metadata: Metadata = {
  title: "Packs de tee-shirts — 111 Marseille",
  description: "Composez un pack de tee-shirts de quartiers marseillais ou laissez-nous choisir trois quartiers surprise."
};

export const dynamic = "force-dynamic";

export default async function PacksPage() {
  const neighborhoods = await listNeighborhoods({ availability: "available", sort: "name" });

  return (
    <div className="mx-auto max-w-[1280px] px-4 py-12 pb-24 sm:px-6 lg:px-10 lg:py-20">
      <p className="section-kicker">Plusieurs quartiers, un seul pack</p>
      <h1 className="mt-4 max-w-4xl text-5xl font-black uppercase leading-[0.92] tracking-[-0.05em] sm:text-7xl">Marseille se porte au pluriel.</h1>
      <p className="mt-6 max-w-2xl text-lg leading-8 text-navy/60">Choisis chaque tee-shirt ou laisse la surprise faire son œuvre. Les packs permettent d’économiser jusqu’à 30 €.</p>
      <div className="mt-12"><PackBuilder neighborhoods={neighborhoods} /></div>
    </div>
  );
}
