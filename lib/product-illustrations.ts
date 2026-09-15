import type { ProductGalleryImage } from "@/lib/types";

function galleryFor(slug: string): ProductGalleryImage[] {
  return [
    {
      label: "À plat · dos",
      url: `/illustrations/${slug}-plat-dos.webp?v=webp-3`
    },
    {
      label: "À plat · face",
      url: `/illustrations/${slug}-plat-face.webp?v=webp-3`
    },
    {
      label: "Porté · face",
      url: `/illustrations/${slug}-porte-face.webp?v=webp-3`
    },
    {
      label: "Porté · dos",
      url: `/illustrations/${slug}-porte-dos.webp?v=webp-3`
    }
  ];
}

const publishedProductGalleries: Record<string, ProductGalleryImage[]> = {
  "La Joliette": galleryFor("la-joliette"),
  "Cinq-Avenues": galleryFor("cinq-avenues"),
  "Notre-Dame-du-Mont": galleryFor("notre-dame-du-mont"),
  "Sainte-Anne": galleryFor("sainte-anne"),
  Mazargues: galleryFor("mazargues")
};

export function getPublishedProductGallery(name: string) {
  return publishedProductGalleries[name];
}
