import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPage } from "@/components/page-builder/CmsPage";
import { openGraphFromCloudinaryImage } from "@/lib/cloudinary";
import { omitWorkCtaBlocks } from "@/lib/page-builder";
import { pageByIdQuery } from "@/lib/sanity/queries";
import { sanityClient, isSanityConfigured } from "@/lib/sanity/client";
import { HOME_PAGE_ID, HOME_PAGE_PATH } from "@/lib/sanity/page-slugs";

// Static generation + on-demand revalidation only (no timed revalidate:N) —
// see architecture notes: ties Sanity API usage to publish events, not traffic.

export async function generateMetadata(): Promise<Metadata> {
  if (!isSanityConfigured()) return {};
  const page = await sanityClient.fetch(pageByIdQuery, { id: HOME_PAGE_ID }).catch(() => null);
  if (!page) return {};
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    ...openGraphFromCloudinaryImage(page.seoImage),
  };
}

export default async function HomePage() {
  if (!isSanityConfigured()) notFound();

  const page = await sanityClient.fetch(pageByIdQuery, { id: HOME_PAGE_ID }).catch(() => null);
  if (!page) notFound();

  // Inicio template never includes Más trabajos (`workCtaBlock`) — leftover CMS
  // blocks from the old seed must not render on `/`.
  const pageBuilder = omitWorkCtaBlocks(page.pageBuilder);

  return <CmsPage page={{ ...page, pageBuilder }} path={HOME_PAGE_PATH} />;
}
