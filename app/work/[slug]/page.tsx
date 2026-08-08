import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { sanityClient, isSanityConfigured } from "@/lib/sanity.client";
import { projectBySlugQuery, allProjectSlugsQuery } from "@/lib/queries";
import { ProjectGallery } from "@/components/ProjectGallery";
import { projectJsonLd } from "@/lib/json-ld";
import { cloudinarySeoUrl, openGraphFromCloudinaryImage } from "@/lib/cloudinary";
import { mapProjectMediaToGalleryItems } from "@/lib/media/gallery";

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
    ...openGraphFromCloudinaryImage(project.seoImage),
  };
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await sanityClient.fetch(projectBySlugQuery, { slug });
  if (!project) notFound();

  const galleryItems = mapProjectMediaToGalleryItems(project.media);

  const jsonLd = projectJsonLd({
    title: project.title,
    slug,
    description: project.seoDescription,
    imageUrl: cloudinarySeoUrl(project.coverImage),
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
