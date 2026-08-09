import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { CmsPage } from "@/components/page-builder/CmsPage";
import { openGraphFromCloudinaryImage } from "@/lib/cloudinary";
import { pageByIdQuery } from "@/lib/sanity/queries";
import { sanityClient, isSanityConfigured } from "@/lib/sanity/client";
import { PORTFOLIO_PAGE_ID, PORTFOLIO_PAGE_PATH } from "@/lib/sanity/page-slugs";

export async function generateMetadata(): Promise<Metadata> {
  if (!isSanityConfigured()) return {};
  const page = await sanityClient.fetch(pageByIdQuery, { id: PORTFOLIO_PAGE_ID }).catch(() => null);
  if (!page) return {};
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    ...openGraphFromCloudinaryImage(page.seoImage),
  };
}

export default async function PortfolioPage() {
  if (!isSanityConfigured()) notFound();

  const page = await sanityClient.fetch(pageByIdQuery, { id: PORTFOLIO_PAGE_ID }).catch(() => null);
  if (!page) notFound();

  return <CmsPage page={page} path={PORTFOLIO_PAGE_PATH} />;
}
