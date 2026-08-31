"use client";

import { useMemo, useState } from "react";
import { Check, Gift, Package, ShoppingBag } from "lucide-react";

import { useCart } from "@/contexts/cart-context";
import { MYSTERY_PACK_PRICE_EUROS, PACK_PRICES_EUROS, SIZE_ORDER } from "@/lib/constants";
import type { CartSelection, Neighborhood, Size } from "@/lib/types";
import { cn, formatCurrency } from "@/lib/utils";

type PackSize = 3 | 4 | 5;

export function PackBuilder({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  const { addItem } = useCart();
  const [packSize, setPackSize] = useState<PackSize>(3);
  const [mystery, setMystery] = useState(false);
  const [selections, setSelections] = useState<Array<{ neighborhoodId: string; size: Size }>>(
    Array.from({ length: 3 }, () => ({ neighborhoodId: "", size: "M" as Size }))
  );
  const [added, setAdded] = useState(false);

  const available = useMemo(
    () => neighborhoods.filter((item) => item.isAvailable),
    [neighborhoods]
  );
  const isComplete = selections.every((selection) =>
    mystery
      ? available.some((item) => item.stockBySize[selection.size] > 0)
      : available.some(
          (item) => item.id === selection.neighborhoodId && item.stockBySize[selection.size] > 0
        )
  );

  function chooseSize(size: PackSize) {
    setPackSize(size);
    setMystery(false);
    setSelections((current) => Array.from({ length: size }, (_, index) => current[index] ?? { neighborhoodId: "", size: "M" }));
    setAdded(false);
  }

  function chooseMystery() {
    setMystery(true);
    setPackSize(3);
    setSelections((current) => Array.from({ length: 3 }, (_, index) => ({ neighborhoodId: "", size: current[index]?.size ?? "M" })));
    setAdded(false);
  }

  function updateSelection(index: number, update: Partial<{ neighborhoodId: string; size: Size }>) {
    setSelections((current) => current.map((selection, itemIndex) => itemIndex === index ? { ...selection, ...update } : selection));
    setAdded(false);
  }

  function addPack() {
    if (!isComplete) return;

    const chosen: CartSelection[] = mystery
      ? selections.map((selection, index) => ({
          neighborhoodId: `mystery-${index + 1}`,
          slug: "surprise",
          name: "Quartier surprise",
          size: selection.size,
          imageUrl: "/favicon-96x96.png"
        }))
      : selections.map((selection) => {
          const neighborhood = available.find((item) => item.id === selection.neighborhoodId)!;
          return {
            neighborhoodId: neighborhood.id,
            slug: neighborhood.slug,
            name: neighborhood.name,
            size: selection.size,
            imageUrl: neighborhood.imageUrl
          };
        });

    const price = mystery ? MYSTERY_PACK_PRICE_EUROS : PACK_PRICES_EUROS[packSize];
    addItem({
      id: `${mystery ? "mystery" : `pack-${packSize}`}-${Date.now()}`,
      kind: mystery ? "mystery-pack" : "pack",
      name: mystery ? "Pack surprise · 3 quartiers" : `Pack au choix · ${packSize} tee-shirts`,
      quantity: 1,
      unitPrice: price,
      imageUrl: chosen[0]?.imageUrl ?? "/favicon-96x96.png",
      selections: chosen
    });
    setAdded(true);
  }

  return (
    <div className="grid gap-8 lg:grid-cols-[0.75fr_1.25fr]">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
        {([3, 4, 5] as const).map((size) => (
          <button key={size} type="button" onClick={() => chooseSize(size)} className={cn("focus-ring rounded-[24px] border p-6 text-left transition", !mystery && packSize === size ? "border-sea bg-sea text-white" : "border-navy/10 bg-white hover:border-sea")}>
            <Package className="h-6 w-6" />
            <span className="mt-5 block text-2xl font-black">{size} tee-shirts</span>
            <span className={cn("mt-1 block text-sm", !mystery && packSize === size ? "text-white/70" : "text-navy/50")}>Au choix · {formatCurrency(PACK_PRICES_EUROS[size])}</span>
          </button>
        ))}
        <button type="button" onClick={chooseMystery} className={cn("focus-ring rounded-[24px] border p-6 text-left transition sm:col-span-2 lg:col-span-1", mystery ? "border-terracotta bg-terracotta text-white" : "border-navy/10 bg-white hover:border-terracotta")}>
          <Gift className="h-6 w-6" />
          <span className="mt-5 block text-2xl font-black">Pack surprise</span>
          <span className={cn("mt-1 block text-sm", mystery ? "text-white/70" : "text-navy/50")}>3 quartiers différents · {formatCurrency(MYSTERY_PACK_PRICE_EUROS)}</span>
        </button>
      </div>

      <div className="rounded-[28px] bg-sand p-5 sm:p-8">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div><p className="section-kicker">Compose ton pack</p><h2 className="mt-2 text-3xl font-black">{mystery ? "Choisis seulement les tailles." : "Un quartier et une taille par tee-shirt."}</h2></div>
          <p className="text-3xl font-black text-sea">{formatCurrency(mystery ? MYSTERY_PACK_PRICE_EUROS : PACK_PRICES_EUROS[packSize])}</p>
        </div>
        {mystery && <p className="mt-4 rounded-xl bg-white/70 p-4 text-sm leading-6 text-navy/60">Les trois quartiers, tous différents, seront attribués automatiquement selon les stocks disponibles.</p>}
        <div className="mt-7 space-y-3">
          {selections.map((selection, index) => (
            <div key={index} className="grid gap-3 rounded-2xl bg-white p-4 sm:grid-cols-[auto_1fr_0.65fr] sm:items-center">
              <span className="grid h-9 w-9 place-items-center rounded-full bg-navy text-sm font-black text-white">{index + 1}</span>
              {!mystery && (
                <select value={selection.neighborhoodId} onChange={(event) => updateSelection(index, { neighborhoodId: event.target.value })} className="focus-ring min-w-0 rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm font-bold">
                  <option value="">Choisir un quartier</option>
                  {available.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}
                </select>
              )}
              {mystery && <p className="font-bold">Quartier surprise</p>}
              <select value={selection.size} onChange={(event) => updateSelection(index, { size: event.target.value as Size })} className="focus-ring rounded-xl border border-navy/10 bg-white px-4 py-3 text-sm font-bold">
                {SIZE_ORDER.map((size) => <option key={size} value={size}>Taille {size}</option>)}
              </select>
            </div>
          ))}
        </div>
        <button type="button" onClick={addPack} disabled={!isComplete} className="focus-ring mt-7 flex w-full items-center justify-center gap-3 rounded-full bg-navy px-6 py-4 text-sm font-bold text-white hover:bg-sea disabled:cursor-not-allowed disabled:opacity-40">
          {added ? <Check className="h-5 w-5" /> : <ShoppingBag className="h-5 w-5" />}{added ? "Pack ajouté au panier" : "Ajouter ce pack au panier"}
        </button>
      </div>
    </div>
  );
}
