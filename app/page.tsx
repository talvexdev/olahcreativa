import { sanityClient, isSanityConfigured } from "@/lib/sanity.client";
import { homepageProjectsQuery, siteSettingsQuery } from "@/lib/queries";
import { ProjectGrid } from "@/components/ProjectGrid";

// Static generation + on-demand revalidation only (no timed revalidate:N) —
// see architecture notes: ties Sanity API usage to publish events, not traffic.
export default async function HomePage() {
  const [projects, settings] = isSanityConfigured()
    ? await Promise.all([
        sanityClient.fetch(homepageProjectsQuery).catch(() => []),
        sanityClient.fetch(siteSettingsQuery).catch(() => null),
      ])
    : [[], null];

  const tagline =
    settings?.tagline ||
    "Photography that holds still long enough to be believed.";

  return (
    <>
      <section className="mx-auto max-w-8xl px-6 pb-16 pt-20">
        <p className="frame-label mb-4">Selected work</p>
        <h1 className="text-hero font-display max-w-4xl text-paper">
          {tagline}
        </h1>
      </section>
      <ProjectGrid projects={projects} />
    </>
  );
}
