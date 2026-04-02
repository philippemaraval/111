import { slugify } from "@/lib/utils";
import type {
  Neighborhood,
  ProductGalleryImage,
  SearchIndexItem,
  VoteRow,
  VoteSummary
} from "@/lib/types";

const arrondissementCoordinates: Record<number, { lat: number; lng: number }> = {
  1: { lat: 43.2967, lng: 5.3764 },
  2: { lat: 43.3037, lng: 5.3664 },
  3: { lat: 43.3112, lng: 5.3847 },
  4: { lat: 43.3041, lng: 5.3995 },
  5: { lat: 43.2896, lng: 5.4025 },
  6: { lat: 43.2863, lng: 5.3819 },
  7: { lat: 43.2826, lng: 5.3638 },
  8: { lat: 43.2571, lng: 5.3754 },
  9: { lat: 43.2543, lng: 5.4208 },
  10: { lat: 43.2789, lng: 5.4368 },
  11: { lat: 43.2924, lng: 5.4656 },
  12: { lat: 43.3084, lng: 5.4353 },
  13: { lat: 43.3289, lng: 5.4057 },
  14: { lat: 43.3404, lng: 5.3768 },
  15: { lat: 43.3512, lng: 5.3558 },
  16: { lat: 43.3639, lng: 5.3086 }
};

const definitions = [
  { name: "Belsunce", arrondissement: 1, available: true, vibe: "Marchés, passages et façades patinées par le soleil." },
  { name: "Noailles", arrondissement: 1, available: true, vibe: "Épices, ruelles denses et énergie populaire." },
  { name: "Le Panier", arrondissement: 2, available: true, vibe: "Escaliers pastel, linge aux fenêtres et ateliers cachés." },
  { name: "La Joliette", arrondissement: 2, available: false, vibe: "Ports, docks et renouveau minéral face à la mer." },
  { name: "Belle de Mai", arrondissement: 3, available: true, vibe: "Friches créatives, culture brute et mémoire ouvrière." },
  { name: "Saint-Lazare", arrondissement: 3, available: false, vibe: "Un quartier de passage, traversé par les rythmes du rail." },
  { name: "Les Chartreux", arrondissement: 4, available: true, vibe: "Village intérieur, places calmes et terrasses de quartier." },
  { name: "La Blancarde", arrondissement: 4, available: true, vibe: "Tramways, ateliers et Marseille en version quotidienne." },
  { name: "Baille", arrondissement: 5, available: true, vibe: "Étudiante, populaire, toujours en mouvement." },
  { name: "Le Camas", arrondissement: 5, available: false, vibe: "Façades bourgeoises, cafés tranquilles et ateliers d’artisans." },
  { name: "Vauban", arrondissement: 6, available: true, vibe: "Montée lumineuse, belvédères et adresses de confiance." },
  { name: "Castellane", arrondissement: 6, available: true, vibe: "Carrefour central, flux urbains et élégance dense." },
  { name: "Saint-Victor", arrondissement: 7, available: true, vibe: "Abbaye, vieux murs et horizon du Vieux-Port." },
  { name: "Endoume", arrondissement: 7, available: true, vibe: "Esprit cabanon, pêcheurs et lumière rasante." },
  { name: "Périer", arrondissement: 8, available: true, vibe: "Avenue chic, immeubles Art déco et rythme posé." },
  { name: "Bonneveine", arrondissement: 8, available: false, vibe: "Pins, plages proches et douceur résidentielle." },
  { name: "Mazargues", arrondissement: 9, available: true, vibe: "Portes du sud, entre collines et bastides." },
  { name: "Sormiou", arrondissement: 9, available: false, vibe: "Calanque mythique, roches blanches et mer profonde." },
  { name: "Saint-Loup", arrondissement: 10, available: true, vibe: "Mémoire industrielle, ateliers et rues en pente." },
  { name: "Pont-de-Vivaux", arrondissement: 10, available: false, vibe: "Entrée est, carrefours vifs et culture populaire." },
  { name: "La Valentine", arrondissement: 11, available: true, vibe: "Commerces, collines et Marseille côté traverses." },
  { name: "Les Accates", arrondissement: 11, available: false, vibe: "Esprit village, jardins et lumière provençale." },
  { name: "Saint-Barnabé", arrondissement: 12, available: true, vibe: "Bastides, métro discret et village très marseillais." },
  { name: "Montolivet", arrondissement: 12, available: true, vibe: "Hauteurs paisibles, places ensoleillées et famille." },
  { name: "Château-Gombert", arrondissement: 13, available: true, vibe: "Village perché, technopôle et accents provençaux." },
  { name: "Malpassé", arrondissement: 13, available: false, vibe: "Barres, collines et réalités contrastées." },
  { name: "Sainte-Marthe", arrondissement: 14, available: true, vibe: "Hauteurs du nord, tissus résidentiels et traverses." },
  { name: "Le Merlan", arrondissement: 14, available: false, vibe: "Campus, centres commerciaux et mosaïque urbaine." },
  { name: "Les Aygalades", arrondissement: 15, available: true, vibe: "Cascade cachée, friches et promesses industrielles." },
  { name: "La Cabucelle", arrondissement: 15, available: false, vibe: "Port, logistique et patrimoine ouvrier." },
  { name: "L’Estaque", arrondissement: 16, available: true, vibe: "Peintres, tuiles, mer et horizon immense." },
  { name: "Saint-Henri", arrondissement: 16, available: true, vibe: "Tuileries, terrasses et Marseille nord authentique." }
] as const;

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
  const slug = slugify(item.name);
  const baseCoordinates = arrondissementCoordinates[item.arrondissement];
  const gallery = galleryFor(item.name);
  const voteCount = item.available ? 28 + index * 2 : 44 + index * 3;
  const salesCount = item.available ? 9 + (index % 5) * 3 : 0;
  const stockSeed = item.available ? 4 + (index % 3) * 2 : 0;

  return {
    id: `mock-${slug}`,
    name: item.name,
    slug,
    arrondissement: item.arrondissement,
    price: item.available ? 39 + (index % 3) * 4 : 42,
    stockBySize: {
      S: stockSeed,
      M: stockSeed + 2,
      L: stockSeed + 1,
      XL: Math.max(0, stockSeed - 1)
    },
    imageUrl: gallery[0].url,
    descriptionHistory: `${item.name} incarne un Marseille de proximité et de caractère. ${item.vibe} Chaque design de la série 111 capture cette mémoire locale avec une composition typographique rétro, des teintes de terre cuite et un marquage inspiré des vieilles enseignes du quartier.`,
    coordinates: {
      lat: Number((baseCoordinates.lat + (index % 3) * 0.0021).toFixed(4)),
      lng: Number((baseCoordinates.lng - (index % 2) * 0.0024).toFixed(4))
    },
    isAvailable: item.available,
    releaseDate: item.available ? "2026-05-15" : "2026-06-20",
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

export const mockVotes: VoteRow[] = mockNeighborhoods.flatMap((item, index) =>
  Array.from({ length: Math.max(2, Math.floor(item.voteCount / 18)) }, (_, voteIndex) => ({
    id: `${item.id}-vote-${voteIndex + 1}`,
    email: `fan${index + voteIndex + 1}@quartiers111.fr`,
    neighborhood_id: item.id,
    created_at: `2026-03-${String((voteIndex % 9) + 10).padStart(2, "0")}T08:15:00.000Z`
  }))
);

export const mockVoteSummaries: VoteSummary[] = mockNeighborhoods.map((item) => {
  const votes = mockVotes.filter((vote) => vote.neighborhood_id === item.id);

  return {
    neighborhoodId: item.id,
    neighborhoodName: item.name,
    arrondissement: item.arrondissement,
    totalVotes: item.voteCount,
    emails: votes.map((vote) => vote.email)
  };
});
