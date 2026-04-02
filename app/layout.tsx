import type { Metadata } from "next";

import "@/app/globals.css";
import { CartDrawer } from "@/components/cart/cart-drawer";
import { Footer } from "@/components/footer";
import { Header } from "@/components/header";
import { MobileTabBar } from "@/components/mobile-tab-bar";
import { Providers } from "@/components/providers";
import { getAvailabilityCount, getNeighborhoodSearchIndex } from "@/lib/neighborhoods";

export const metadata: Metadata = {
  title: "111 Quartiers Marseille",
  description: "E-commerce SSR dédié à des t-shirts inspirés des 111 quartiers de Marseille.",
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000")
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
            <main className="mx-auto max-w-7xl px-4 py-6 md:px-6 md:py-8">{children}</main>
            <Footer />
            <CartDrawer />
            <MobileTabBar />
          </div>
        </Providers>
      </body>
    </html>
  );
}
