"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";

import { NeighborhoodCard } from "@/components/home/neighborhood-card";
import type { Neighborhood } from "@/lib/types";

export function FeaturedCollection({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  const [isExpanded, setIsExpanded] = useState(false);
  const firstNeighborhoods = neighborhoods.slice(0, 3);
  const remainingNeighborhoods = neighborhoods.slice(3);

  return (
    <>
      <div className={`grid gap-6 ${firstNeighborhoods.length === 1 ? "max-w-xl" : "md:grid-cols-2 xl:grid-cols-3"}`}>
        {firstNeighborhoods.map((item) => <NeighborhoodCard key={item.id} neighborhood={item} />)}
      </div>

      {remainingNeighborhoods.length > 0 && (
        <>
          <div
            id="collection-suite"
            className={`${isExpanded ? "mt-6 grid" : "hidden"} gap-6 md:mt-6 md:grid md:grid-cols-2 xl:grid-cols-3`}
          >
            {remainingNeighborhoods.map((item) => <NeighborhoodCard key={item.id} neighborhood={item} />)}
          </div>
          <button
            type="button"
            className="focus-ring mx-auto mt-8 flex w-full items-center justify-center gap-2 rounded-full bg-navy px-6 py-4 text-sm font-bold text-white hover:bg-sea md:hidden"
            aria-expanded={isExpanded}
            aria-controls="collection-suite"
            onClick={() => setIsExpanded((current) => !current)}
          >
            {isExpanded ? "Réduire la collection" : "Découvrir le reste de la collection"}
            {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
          </button>
        </>
      )}
    </>
  );
}
