import { InteractiveMap } from "@/components/home/interactive-map";
import type { Neighborhood } from "@/lib/types";

export function LazyInteractiveMap({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  return <div id="carte" className="scroll-mt-32"><InteractiveMap neighborhoods={neighborhoods} /></div>;
}
