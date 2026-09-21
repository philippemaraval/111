"use client";

import { useRef, useState, type TouchEvent } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { ProductImage } from "@/components/product-image";
import type { ProductGalleryImage } from "@/lib/types";

type ProductGalleryProps = {
  images: ProductGalleryImage[];
  neighborhoodName: string;
};

export function ProductGallery({ images, neighborhoodName }: ProductGalleryProps) {
  const [activeImage, setActiveImage] = useState(0);
  const touchStartX = useRef<number | null>(null);
  const image = images[activeImage] ?? images[0];

  function showPrevious() {
    setActiveImage((current) => (current - 1 + images.length) % images.length);
  }

  function showNext() {
    setActiveImage((current) => (current + 1) % images.length);
  }

  function handleTouchStart(event: TouchEvent<HTMLDivElement>) {
    touchStartX.current = event.touches[0]?.clientX ?? null;
  }

  function handleTouchEnd(event: TouchEvent<HTMLDivElement>) {
    if (touchStartX.current === null) return;
    const distance = (event.changedTouches[0]?.clientX ?? touchStartX.current) - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(distance) < 45) return;
    if (distance > 0) showPrevious();
    else showNext();
  }

  if (!image) return null;

  return (
    <>
      <div
        className="relative touch-pan-y overflow-hidden rounded-[20px] bg-[#f2f2f2] sm:hidden"
        role="region"
        aria-roledescription="carrousel"
        aria-label={`Photos du tee-shirt ${neighborhoodName}`}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <ProductImage
          key={image.url}
          priority
          src={image.url}
          sizes="100vw"
          alt={`${neighborhoodName}, ${image.label}`}
          className="aspect-[4/5] w-full animate-[reveal-up_300ms_ease-out] object-contain"
        />
        <span className="absolute right-4 top-4 rounded-full bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-navy shadow-soft">
          {image.label}
        </span>

        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={showPrevious}
              className="focus-ring absolute left-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-navy shadow-soft hover:bg-sun"
              aria-label={`Photo précédente de ${neighborhoodName}`}
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              type="button"
              onClick={showNext}
              className="focus-ring absolute right-3 top-1/2 z-10 grid h-11 w-11 -translate-y-1/2 place-items-center rounded-full bg-white/95 text-navy shadow-soft hover:bg-sun"
              aria-label={`Photo suivante de ${neighborhoodName}`}
            >
              <ChevronRight className="h-5 w-5" />
            </button>
            <div
              className="absolute bottom-4 left-1/2 z-10 flex -translate-x-1/2 gap-1 rounded-full bg-white/90 px-2 py-1 shadow-soft"
              role="group"
              aria-label={`Photo ${activeImage + 1} sur ${images.length}`}
            >
              {images.map((galleryImage, index) => (
                <button
                  key={galleryImage.url}
                  type="button"
                  onClick={() => setActiveImage(index)}
                  className="focus-ring grid h-8 w-8 place-items-center rounded-full"
                  aria-label={`Afficher ${galleryImage.label}`}
                  aria-current={index === activeImage ? "true" : undefined}
                >
                  <span className={`h-2 rounded-full transition-all ${index === activeImage ? "w-5 bg-sea" : "w-2 bg-navy/25"}`} />
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      <div className="hidden gap-3 sm:grid sm:grid-cols-2">
        {images.map((galleryImage, index) => (
          <div key={`${galleryImage.label}-${index}`} className="group relative overflow-hidden rounded-[20px] bg-[#f2f2f2]">
            <ProductImage
              priority={index === 0}
              src={galleryImage.url}
              sizes="(max-width: 1023px) 50vw, 29vw"
              alt={`${neighborhoodName}, ${galleryImage.label}`}
              className="aspect-[4/5] w-full object-contain transition duration-700 group-hover:scale-[1.015]"
            />
            <span className="absolute bottom-4 left-4 rounded-full bg-white/90 px-3 py-2 text-[10px] font-bold uppercase tracking-[0.15em] text-navy">
              {galleryImage.label}
            </span>
          </div>
        ))}
      </div>
    </>
  );
}
