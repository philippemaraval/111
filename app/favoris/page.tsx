import type { Metadata } from "next";
import { FavoritesList } from "@/components/favorites-list";
import { getNeighborhoodSearchIndex } from "@/lib/neighborhoods";

export const metadata: Metadata = { title: "Mes favoris | 111 Marseille", robots: { index: false, follow: false } };
export default async function FavoritesPage() {
  const neighborhoods = await getNeighborhoodSearchIndex();
  return <main className="mx-auto min-h-[60vh] max-w-5xl px-4 py-16 sm:px-6"><p className="section-kicker">Votre sélection</p><h1 className="mb-10 mt-3 text-5xl font-black uppercase sm:text-7xl">Mes favoris.</h1><FavoritesList neighborhoods={neighborhoods} /></main>;
}
