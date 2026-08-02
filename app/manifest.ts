import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "111 Marseille",
    short_name: "111",
    description: "Marseille, quartier par quartier.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0092cd",
    icons: [36, 48, 72, 96, 144, 192].map((size) => ({
      src: `/android-icon-${size}x${size}.png`,
      sizes: `${size}x${size}`,
      type: "image/png"
    }))
  };
}
