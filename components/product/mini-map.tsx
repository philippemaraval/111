import type { Coordinates } from "@/lib/types";

type MiniMapProps = {
  coordinates: Coordinates;
};

export function MiniMap({ coordinates }: MiniMapProps) {
  const left = `${Math.min(86, Math.max(14, ((coordinates.lng - 5.2) / 0.35) * 100))}%`;
  const top = `${Math.min(86, Math.max(14, ((43.42 - coordinates.lat) / 0.18) * 100))}%`;

  return (
    <div className="relative h-60 overflow-hidden rounded-[28px] border border-navy/10 bg-gradient-to-br from-sea/15 via-foam to-sand">
      <div className="absolute inset-y-0 left-0 w-1/4 bg-sea/25" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(24,50,71,0.06),transparent_40%),linear-gradient(rgba(24,50,71,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(24,50,71,0.08)_1px,transparent_1px)] bg-[length:auto,24px_24px,24px_24px]" />
      <div
        className="absolute h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-4 border-white bg-terracotta shadow-card"
        style={{ left, top }}
      />
      <div className="absolute bottom-4 left-4 rounded-full bg-white/80 px-3 py-2 text-xs uppercase tracking-[0.18em] text-navy">
        {coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)}
      </div>
    </div>
  );
}
