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
      ...,
      showcaseClips[]{
        label,
        video ${muxVideoProjection},
        image ${cloudinaryImageProjection}
      }
    },
    _type == "aboutBlock" => { ... },
    _type == "workCtaBlock" => { ... },
    _type == "servicesBlock" => { ... },
    _type == "processBlock" => { ... },
    _type == "contactBlock" => { ... },
    _type == "imageGridBlock" => {
      ...,
      items[] ${cloudinaryImageProjection}
    },
    _type == "portfolioBlock" => {
      ...,
      projects[]{
        ...,
        heroVideo ${muxVideoProjection},
        heroImage ${cloudinaryImageProjection},
        clips[]{
          ...,
          video ${muxVideoProjection},
          image ${cloudinaryImageProjection}
        },
        gallery[]{
          ...,
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
