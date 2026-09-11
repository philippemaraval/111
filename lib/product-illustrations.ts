import type { ProductGalleryImage } from "@/lib/types";

export const laJolietteGallery: ProductGalleryImage[] = [
  {
    label: "À plat · dos",
    url: "/illustrations/la-joliette-plat-dos.webp?v=webp-1"
  },
  {
    label: "À plat · face",
    url: "/illustrations/la-joliette-plat-face.webp?v=webp-1"
  },
  {
    label: "Porté · face",
    url: "/illustrations/la-joliette-porte-face.webp?v=webp-1"
  },
  {
    label: "Porté · dos",
    url: "/illustrations/la-joliette-porte-dos.webp?v=webp-1"
  }
];

export function hasPublishedProductImages(name: string) {
  return name === "La Joliette";
}
