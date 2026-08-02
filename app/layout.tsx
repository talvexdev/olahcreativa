import type { Metadata } from "next";
import { Fraunces, Inter, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import { sanityClient, isSanityConfigured } from "@/lib/sanity.client";
import { siteSettingsQuery } from "@/lib/queries";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { websiteJsonLd } from "@/lib/json-ld";

const fraunces = Fraunces({ subsets: ["latin"], variable: "--font-fraunces", display: "swap" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });
const mono = IBM_Plex_Mono({ subsets: ["latin"], weight: ["400", "500"], variable: "--font-mono", display: "swap" });

export async function generateMetadata(): Promise<Metadata> {
  if (!isSanityConfigured()) {
    return { title: { default: "Portfolio", template: "%s — Portfolio" } };
  }
  const settings = await sanityClient.fetch(siteSettingsQuery).catch(() => null);
  return {
    title: { default: settings?.defaultSeoTitle || settings?.brandName || "Portfolio", template: `%s — ${settings?.brandName || "Portfolio"}` },
    description: settings?.defaultSeoDescription,
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const settings = isSanityConfigured()
    ? await sanityClient.fetch(siteSettingsQuery).catch(() => null)
    : null;
  const jsonLd = websiteJsonLd({
    brandName: settings?.brandName,
    tagline: settings?.tagline,
    contactEmail: settings?.contactEmail,
  });

  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable} ${mono.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Header brandName={settings?.brandName || "Studio"} navLinks={settings?.navLinks} />
        <main>{children}</main>
        <Footer
          brandName={settings?.brandName || "Studio"}
          contactEmail={settings?.contactEmail}
          socialLinks={settings?.socialLinks}
        />
      </body>
    </html>
  );
}
