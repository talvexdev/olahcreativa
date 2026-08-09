import type { MetadataRoute } from "next";
import { sanityClient, isSanityConfigured } from "@/lib/sanity/client";
import { allProjectSlugsQuery } from "@/lib/sanity/queries";
import { PORTFOLIO_PAGE_PATH } from "@/lib/sanity/page-slugs";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  if (!isSanityConfigured()) {
    return [
      { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ];
  }

  const projects = await sanityClient.fetch<{ slug: string }[]>(allProjectSlugsQuery).catch(() => []);

  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    {
      url: `${siteUrl}${PORTFOLIO_PAGE_PATH}`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...projects.map((p) => ({
      url: `${siteUrl}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
  ];
}
