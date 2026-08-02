const siteUrl = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export function websiteJsonLd(settings: {
  brandName?: string;
  tagline?: string;
  contactEmail?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: settings.brandName || "Portfolio",
    description: settings.tagline,
    url: siteUrl(),
    ...(settings.contactEmail && {
      contactPoint: {
        "@type": "ContactPoint",
        email: settings.contactEmail,
        contactType: "customer service",
      },
    }),
  };
}

export function projectJsonLd(project: {
  title: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "CreativeWork",
    name: project.title,
    description: project.description,
    url: `${siteUrl()}/work/${project.slug}`,
    ...(project.imageUrl && { image: project.imageUrl }),
  };
}

export function webPageJsonLd(page: {
  title: string;
  slug: string;
  description?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.title,
    description: page.description,
    url: `${siteUrl()}/${page.slug}`,
  };
}
