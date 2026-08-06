import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sanityClient, isSanityConfigured } from "@/lib/sanity.client";
import { projectBySlugQuery, allProjectSlugsQuery } from "@/lib/queries";
import { ProjectGallery } from "@/components/ProjectGallery";
import { projectJsonLd } from "@/lib/json-ld";

export async function generateStaticParams() {
  if (!isSanityConfigured()) return [];
  const slugs: { slug: string }[] = await sanityClient.fetch(allProjectSlugsQuery).catch(() => []);
  return slugs.map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const project = await sanityClient.fetch(projectBySlugQuery, { slug });
  if (!project) return {};
  return {
    title: project.seoTitle || project.title,
    description: project.seoDescription,
    openGraph: project.seoImage ? { images: [{ url: project.seoImage.url }] } : undefined,
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await sanityClient.fetch(projectBySlugQuery, { slug });
  if (!project) notFound();

  const galleryItems = project.media.map((item: Record<string, unknown>) => {
    if (item.playbackId) {
      return {
        type: "video" as const,
        playbackId: item.playbackId as string,
        poster: item.poster as { publicId: string; alt: string } | undefined,
        caption: item.caption as string | undefined,
        autoplayMuted: item.autoplayMuted as boolean | undefined,
      };
    }
    return {
      type: "image" as const,
      publicId: item.publicId as string,
      alt: item.alt as string,
      caption: item.caption as string | undefined,
    };
  });

  const jsonLd = projectJsonLd({
    title: project.title,
    slug,
    description: project.seoDescription,
    imageUrl: project.coverImage?.url,
  });

  return (
    <article>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <header className="mx-auto max-w-8xl px-6 pb-10 pt-16">
        <p className="frame-label mb-3">{project.category}{project.clientName ? ` — ${project.clientName}` : ""}</p>
        <h1 className="font-display text-4xl text-fg sm:text-6xl">{project.title}</h1>
      </header>

      <ProjectGallery items={galleryItems} />
    </article>
  );
}
