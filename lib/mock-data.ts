import neighborhoodCatalog from "@/lib/marseille-neighborhoods.json";
import { getNeighborhoodCatalogStatus, isNeighborhoodAvailable, PRODUCT_PRICE_EUROS } from "@/lib/constants";
import { neighborhoodDescriptions } from "@/lib/neighborhood-descriptions";
import {
  hasPublishedProductImages,
  laJolietteGallery
} from "@/lib/product-illustrations";
import type {
  Neighborhood,
  ProductGalleryImage,
  SearchIndexItem,
  VoteRow,
  VoteSummary
} from "@/lib/types";

const neighborhoodStories: Record<string, string> = {
  noailles: "Épices, ruelles denses et énergie populaire.",
  "la-joliette": "Ports, docks et renouveau minéral face à la mer.",
  "belle-de-mai": "Friches créatives, culture brute et mémoire ouvrière.",
  "cinq-avenues": "Longchamp, boulevards vivants et élégance de quartier.",
  "le-camas": "Façades colorées, cafés tranquilles et ateliers d’artisans.",
  "notre-dame-du-mont": "Cours Julien, musique, création et nuits marseillaises.",
  "saint-victor": "Abbaye, vieux murs et horizon du Vieux-Port.",
  perier: "Avenues lumineuses, immeubles Art déco et rythme posé.",
  "sainte-anne": "Esprit village, places calmes et vie de proximité.",
  mazargues: "Portes du sud, entre collines et bastides.",
  "la-capelette": "Huveaune, mémoire industrielle et Marseille en mouvement.",
  "la-pomme": "Un ancien noyau villageois tourné vers l’est de la ville.",
  "saint-barnabe": "Bastides, métro discret et village très marseillais.",
  "saint-louis": "Village du nord, héritage industriel et horizon portuaire.",
  "l-estaque": "Peintres, tuiles, mer et horizon immense."
};

const definitions = neighborhoodCatalog.map((item) => ({
  ...item,
  vibe: neighborhoodStories[item.slug] ?? "Une identité locale faite de rues, de places et de souvenirs partagés."
}));

function galleryFor(label: string): ProductGalleryImage[] {
  return [
    {
      label: "Photo à plat",
      url: `https://placehold.co/960x1200/f9f4eb/183247?text=${encodeURIComponent(`111 ${label} Flat`)}`
    },
    {
      label: "Porté mannequin",
      url: `https://placehold.co/960x1200/d98943/f9f4eb?text=${encodeURIComponent(`111 ${label} Look`)}`
    }
  ];
}

export const mockNeighborhoods: Neighborhood[] = definitions.map((item, index) => {
  const slug = item.slug;
  const status = getNeighborhoodCatalogStatus(slug);
  const hasProductImages = hasPublishedProductImages(item.name);
  const isAvailable = isNeighborhoodAvailable(slug);
  const gallery = hasProductImages
    ? laJolietteGallery
    : galleryFor(item.name);
  const voteCount = 0;
  const salesCount = isAvailable ? 9 + (index % 5) * 3 : 0;
  const stockSeed = isAvailable ? 4 + (index % 3) * 2 : 0;

  return {
    id: `mock-${slug}`,
    name: item.name,
    slug,
    arrondissement: item.arrondissement,
    price: PRODUCT_PRICE_EUROS,
    stockBySize: {
      S: stockSeed,
      M: stockSeed + 2,
      L: stockSeed + 1,
      XL: Math.max(0, stockSeed - 1)
    },
    imageUrl: gallery[0].url,
    descriptionHistory: neighborhoodDescriptions[slug] ?? item.vibe,
    coordinates: item.coordinates,
    isAvailable,
    releaseDate: isAvailable ? "2026-05-15" : status === "project" ? "2026-06-20" : null,
    seo: {
      slug,
      title: `T-shirt ${item.name} | 111 Quartiers Marseille`,
      description: `Collection 111 Quartiers Marseille dédiée à ${item.name}, dans le ${item.arrondissement}e arrondissement.`,
      keywords: [
        item.name,
        `Marseille ${item.arrondissement}`,
        "t-shirt Marseille",
        "111 quartiers"
      ],
      image: gallery[0].url,
      gallery
    },
    voteCount,
    salesCount,
    popularityScore: voteCount + salesCount * 3,
    gallery
  };
});

export const mockSearchIndex: SearchIndexItem[] = mockNeighborhoods.map((item) => ({
  id: item.id,
  name: item.name,
  slug: item.slug,
  arrondissement: item.arrondissement,
  isAvailable: item.isAvailable
}));

export const mockVotes: VoteRow[] = [];

export const mockVoteSummaries: VoteSummary[] = mockNeighborhoods.map((item) => {
  const votes = mockVotes.filter((vote) => vote.neighborhood_id === item.id);

  return {
    neighborhoodId: item.id,
    neighborhoodName: item.name,
    arrondissement: item.arrondissement,
    totalVotes: item.voteCount,
    emails: votes.map((vote) => vote.email),
    newsletterEmails: votes.filter((vote) => vote.newsletter_consent).map((vote) => vote.email)
  };
});
