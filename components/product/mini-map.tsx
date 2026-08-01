import type { Coordinates } from "@/lib/types";

export function MiniMap({ coordinates }: { coordinates: Coordinates }) {
  const left = `${Math.min(87, Math.max(13, 13 + ((coordinates.lng - 5.28) / 0.25) * 74))}%`;
  const top = `${Math.min(88, Math.max(11, 11 + ((43.42 - coordinates.lat) / 0.24) * 77))}%`;

  return (
    <div className="relative min-h-[430px] overflow-hidden rounded-[24px] bg-[#c8efff]">
      <svg viewBox="0 0 600 430" aria-hidden="true" className="absolute inset-0 h-full w-full">
        <path d="M145 14C246 3 418 30 510 92c63 43 64 99 37 153-24 48-29 99-83 135-54 36-129 44-197 32-76-13-116-54-127-101-10-43-70-67-64-119 7-60 66-82 68-131 1-20-8-33 1-47Z" fill="#fff" stroke="#129fd4" strokeWidth="3" />
        <path d="M83 250c55 22 73 64 84 103 10 35 54 53 94 61-76 18-156-4-185-60-15-30-18-75 7-104Z" fill="#8adfff" opacity=".7" />
        <path d="M136 126c111 28 203-28 373-6M128 235c112-27 219 31 396 0M183 341c119-29 198 13 296-15M247 36c-17 91 10 168-6 266M385 35c-23 82 2 137-13 226" fill="none" stroke="#12202f" strokeOpacity=".08" strokeWidth="2" />
      </svg>
      <div className="absolute h-7 w-7 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-terracotta shadow-card ring-8 ring-terracotta/15" style={{ left, top }} />
      <div className="absolute bottom-5 left-5 rounded-full bg-white px-4 py-2 text-[10px] font-bold uppercase tracking-[0.16em] text-navy shadow-soft">Marseille</div>
    </div>
  );
}
