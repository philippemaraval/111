"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";
import type { Neighborhood } from "@/lib/types";

const InteractiveMap = dynamic(
  () => import("@/components/home/interactive-map").then((module) => module.InteractiveMap),
  { ssr: false, loading: () => <div className="mx-auto min-h-[720px] max-w-[1440px] animate-pulse rounded-[28px] bg-[#dff4fc]" aria-hidden="true" /> }
);

export function LazyInteractiveMap({ neighborhoods }: { neighborhoods: Neighborhood[] }) {
  const anchor = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const node = anchor.current;
    if (!node) return;
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) { setVisible(true); observer.disconnect(); }
    }, { rootMargin: "500px" });
    observer.observe(node);
    return () => observer.disconnect();
  }, []);
  return <div id="carte" className="scroll-mt-32" ref={anchor}>{visible ? <InteractiveMap neighborhoods={neighborhoods} /> : <div className="min-h-[720px]" aria-hidden="true" />}</div>;
}
