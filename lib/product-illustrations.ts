import type { ProductGalleryImage } from "@/lib/types";

export const laJolietteGallery: ProductGalleryImage[] = [
  {
    label: "À plat · dos",
    url: "/illustrations/la-joliette-plat-dos.png?v=hd-2"
  },
  {
    label: "À plat · face",
    url: "/illustrations/la-joliette-plat-face.png?v=hd-2"
  },
  {
    label: "Porté · face",
    url: "/illustrations/la-joliette-porte-face.png?v=hd-2"
  },
  {
    label: "Porté · dos",
    url: "/illustrations/la-joliette-porte-dos.png?v=hd-2"
  }
];

export function hasPublishedProductImages(name: string) {
  return name === "La Joliette";
}
