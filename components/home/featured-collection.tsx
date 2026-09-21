import { NeighborhoodCard } from "@/components/home/neighborhood-card";
import type { Neighborhood } from "@/lib/types";

export function FeaturedCollection({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  return (
    <div
      data-testid="featured-collection"
      aria-label="Tee-shirts disponibles"
      className={`-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain px-4 pb-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden md:mx-0 md:grid md:gap-6 md:overflow-visible md:px-0 md:pb-0 ${neighborhoods.length === 1 ? "md:max-w-xl" : "md:grid-cols-2 xl:grid-cols-3"}`}
    >
      {neighborhoods.map((item) => (
        <div key={item.id} className="w-[82vw] max-w-[360px] shrink-0 snap-start md:w-auto md:max-w-none">
          <NeighborhoodCard neighborhood={item} />
        </div>
      ))}
    </div>
  );
}
