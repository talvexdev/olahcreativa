import type { MetadataRoute } from "next";
import { sanityClient, isSanityConfigured } from "@/lib/sanity.client";
import { allProjectSlugsQuery, allPageSlugsQuery } from "@/lib/queries";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  if (!isSanityConfigured()) {
    return [
      { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ];
  }

  const [projects, pages] = await Promise.all([
    sanityClient.fetch<{ slug: string }[]>(allProjectSlugsQuery).catch(() => []),
    sanityClient.fetch<{ slug: string }[]>(allPageSlugsQuery).catch(() => []),
  ]);

  return [
    { url: siteUrl, lastModified: now, changeFrequency: "weekly", priority: 1 },
    ...projects.map((p) => ({
      url: `${siteUrl}/work/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...pages.map((p) => ({
      url: `${siteUrl}/${p.slug}`,
      lastModified: now,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
