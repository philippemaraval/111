import { HeroSection } from "@/components/home/hero-section";
import { InteractiveMap } from "@/components/home/interactive-map";
import { NeighborhoodCard } from "@/components/home/neighborhood-card";
import { ProductFilters } from "@/components/home/product-filters";
import { listNeighborhoods } from "@/lib/neighborhoods";

export const dynamic = "force-dynamic";

type HomePageProps = {
  searchParams?: Record<string, string | string[] | undefined>;
};

export default async function HomePage({ searchParams }: HomePageProps) {
  const q = typeof searchParams?.q === "string" ? searchParams.q : undefined;
  const sort =
    typeof searchParams?.sort === "string" &&
    ["popular", "recent", "name"].includes(searchParams.sort)
      ? (searchParams.sort as "popular" | "recent" | "name")
      : "popular";
  const availability =
    typeof searchParams?.availability === "string" &&
    ["all", "available", "coming-soon"].includes(searchParams.availability)
      ? (searchParams.availability as "all" | "available" | "coming-soon")
      : "all";
  const arrondissement =
    typeof searchParams?.arrondissement === "string"
      ? Number(searchParams.arrondissement)
      : undefined;

  const neighborhoods = await listNeighborhoods({
    q,
    sort,
    availability,
    arrondissement: arrondissement || undefined
  });

  return (
    <div className="space-y-8 pb-24 md:pb-8">
      <HeroSection />
      <InteractiveMap neighborhoods={neighborhoods} />
      <section id="catalogue" className="space-y-5">
        <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.28em] text-sea">Catalogue SSR</p>
            <h2 className="font-display text-4xl text-navy">Trier, filtrer, activer les prochains drops</h2>
          </div>
          <p className="max-w-xl text-sm text-navy/65">
            Les quartiers non disponibles restent visibles en mode grisé pour capter les votes et préparer les prochains lancements.
          </p>
        </div>

        <ProductFilters />

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {neighborhoods.map((item) => (
            <NeighborhoodCard key={item.id} neighborhood={item} />
          ))}
        </div>
      </section>
    </div>
  );
}
