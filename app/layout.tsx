import type { Metadata } from "next";

import "@/app/globals.css";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Providers } from "@/components/providers";
import { getAvailabilityCount, getNeighborhoodSearchIndex } from "@/lib/neighborhoods";

export const metadata: Metadata = {
  title: "111 — Marseille, quartier par quartier",
  description: "Des t-shirts dessinés à Marseille pour porter haut les couleurs de chaque quartier.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  manifest: "/manifest.webmanifest",
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" }
    ],
    apple: [
      { url: "/apple-icon-180x180.png", sizes: "180x180", type: "image/png" }
    ]
  },
  other: {
    "msapplication-config": "/browserconfig.xml",
    "msapplication-TileColor": "#ffffff",
    "msapplication-TileImage": "/ms-icon-144x144.png"
  }
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [availableCount, searchIndex] = await Promise.all([
    getAvailabilityCount(),
    getNeighborhoodSearchIndex()
  ]);

  return (
    <html lang="fr">
      <body>
        <Providers>
          <div className="app-shell">
            <Header availableCount={availableCount} searchIndex={searchIndex} />
            <main>{children}</main>
            <Footer />
            <CartDrawer />
            <MobileTabBar />
          </div>
        </Providers>
      </body>
    </html>
  );
}
