import type { MetadataRoute } from "next";

import { listNeighborhoods } from "@/lib/neighborhoods";
import { getSiteUrl } from "@/lib/utils";

const staticRoutes = [
  "",
  "/packs",
  "/histoire",
  "/guide-des-tailles",
  "/faq",
  "/contact",
  "/livraison-retours",
  "/conditions-generales-de-vente",
  "/confidentialite",
  "/mentions-legales"
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl();
  const neighborhoods = await listNeighborhoods({ sort: "name" });

  return [
    ...staticRoutes.map((route) => ({
      url: `${siteUrl}${route}`,
      changeFrequency: route === "" ? "weekly" as const : "monthly" as const,
      priority: route === "" ? 1 : 0.6
    })),
    ...neighborhoods.map((neighborhood) => ({
      url: `${siteUrl}/quartier/${neighborhood.slug}`,
      changeFrequency: "weekly" as const,
      priority: neighborhood.isAvailable ? 0.9 : 0.7
    }))
  ];
}
