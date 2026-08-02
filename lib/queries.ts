import { groq } from "next-sanity";

/**
 * One combined query per page (not several small ones) — reduces request
 * count per build/revalidation cycle, per the free-tier-conscious design.
 */

const cloudinaryImageProjection = `{
  "publicId": asset->public_id,
  "url": asset->url,
  "width": asset->width,
  "height": asset->height,
  alt,
  caption
}`;

const muxVideoProjection = `{
  "playbackId": asset->playbackId,
  "status": asset->status,
  poster ${cloudinaryImageProjection},
  caption,
  autoplayMuted
}`;

export const siteSettingsQuery = groq`*[_type == "siteSettings"][0]{
  brandName,
  tagline,
  logo ${cloudinaryImageProjection},
  navLinks,
  contactEmail,
  socialLinks
}`;

export const homepageProjectsQuery = groq`*[_type == "project" && featured == true] | order(order asc){
  _id,
  title,
  "slug": slug.current,
  category,
  coverImage ${cloudinaryImageProjection}
}`;

export const allProjectsQuery = groq`*[_type == "project"] | order(order asc){
  _id,
  title,
  "slug": slug.current,
  category,
  coverImage ${cloudinaryImageProjection}
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

export const pageBySlugQuery = groq`*[_type == "page" && slug.current == $slug][0]{
  title,
  pageBuilder[]{
    ...,
    _type == "heroBlock" => {
      heading, subheading,
      media{
        image ${cloudinaryImageProjection},
        video ${muxVideoProjection}
      }
    },
    _type == "imageGridBlock" => {
      heading, columns,
      items[] ${cloudinaryImageProjection}
    }
  },
  seoTitle,
  seoDescription,
  seoImage ${cloudinaryImageProjection}
}`;

export const allPageSlugsQuery = groq`*[_type == "page" && defined(slug.current)]{ "slug": slug.current }`;
