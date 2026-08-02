import type { ProductGalleryImage } from "@/lib/types";

export const laJolietteGallery: ProductGalleryImage[] = [
  {
    label: "À plat · dos",
    url: "/illustrations/la-joliette-plat-dos.jpg"
  },
  {
    label: "À plat · face",
    url: "/illustrations/la-joliette-plat-face.jpg"
  },
  {
    label: "Porté · face",
    url: "/illustrations/la-joliette-porte-face.jpg"
  },
  {
    label: "Porté · dos",
    url: "/illustrations/la-joliette-porte-dos.jpg"
  }
];

export function hasPublishedProductImages(name: string) {
  return name === "La Joliette";
}
