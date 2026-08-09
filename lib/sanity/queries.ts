import { groq } from "next-sanity";

import { cloudinaryImageProjection, muxVideoProjection } from "@/lib/sanity/projections";

/**
 * One combined query per page (not several small ones) — reduces request
 * count per build/revalidation cycle, per the free-tier-conscious design.
 */

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  brandName,
  tagline,
  logo ${cloudinaryImageProjection},
  navLinks,
  contactEmail,
  socialLinks,
  defaultSeoTitle,
  defaultSeoDescription,
  defaultSeoImage ${cloudinaryImageProjection}
}`;

export const projectBySlugQuery = groq`*[_type == "project" && slug.current == $slug][0]{
  title,
  category,
  clientName,
  shootDate,
  coverImage ${cloudinaryImageProjection},
  media[]{
    _type == "cloudinaryImage" => ${cloudinaryImageProjection},
    _type == "muxVideo" => ${muxVideoProjection}
  },
  seoTitle,
  seoDescription,
  seoImage ${cloudinaryImageProjection}
}`;

export const allProjectSlugsQuery = groq`*[_type == "project" && defined(slug.current)]{ "slug": slug.current }`;

const pageProjection = groq`{
  title,
  pageBuilder[]{
    ...,
    _type == "heroBlock" => {
      eyebrow,
      heading,
      headingAccent,
      description,
      ctaPrimary,
      ctaSecondary
    },
    _type == "imageGridBlock" => {
      heading, columns,
      items[] ${cloudinaryImageProjection}
    },
    _type == "portfolioBlock" => {
      eyebrow,
      heading,
      headingAccent,
      description,
      projects[]{
        label,
        category,
        title,
        description,
        credits,
        heroVideo ${muxVideoProjection},
        heroImage ${cloudinaryImageProjection},
        clips[]{
          label,
          caption,
          video ${muxVideoProjection},
          image ${cloudinaryImageProjection}
        },
        gallery[]{
          label,
          image ${cloudinaryImageProjection}
        }
      }
    }
  },
  seoTitle,
  seoDescription,
  seoImage ${cloudinaryImageProjection}
}`;

/** Fixed page singletons — fetch by document id (`homepage`, `pagePortfolio`). */
export const pageByIdQuery = groq`*[_type == "page" && _id == $id][0]${pageProjection}`;
