import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PageBuilder } from "@/components/PageBuilder";
import { openGraphFromCloudinaryImage } from "@/lib/cloudinary";
import { webPageJsonLd } from "@/lib/json-ld";
import { pageBySlugQuery, allPageSlugsQuery } from "@/lib/queries";
import { sanityClient, isSanityConfigured } from "@/lib/sanity.client";
import { getPageAccessibleHeading } from "@/lib/sanity/page-heading";

export async function generateStaticParams() {
  if (!isSanityConfigured()) return [];
  const slugs: { slug: string }[] = await sanityClient.fetch(allPageSlugsQuery).catch(() => []);
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const page = await sanityClient.fetch(pageBySlugQuery, { slug });
  if (!page) return {};
  return {
    title: page.seoTitle || page.title,
    description: page.seoDescription,
    ...openGraphFromCloudinaryImage(page.seoImage),
  };
}

export default async function FlexPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const page = await sanityClient.fetch(pageBySlugQuery, { slug });
  if (!page) notFound();

  const jsonLd = webPageJsonLd({
    title: page.title,
    slug,
    description: page.seoDescription,
  });

  const accessibleHeading = getPageAccessibleHeading(page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">{accessibleHeading}</h1>
      <PageBuilder blocks={page.pageBuilder} />
    </>
  );
}
