import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sanityClient, isSanityConfigured } from "@/lib/sanity.client";
import { pageBySlugQuery, allPageSlugsQuery } from "@/lib/queries";
import { PageBuilder } from "@/components/PageBuilder";
import { webPageJsonLd } from "@/lib/json-ld";

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
    openGraph: page.seoImage ? { images: [{ url: page.seoImage.url }] } : undefined,
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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PageBuilder blocks={page.pageBuilder} />
    </>
  );
}
