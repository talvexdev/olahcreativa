import { defineType, defineField } from "sanity";

/**
 * Flexible page-builder document — this is what gives the photographers
 * "add/update/delete pages" without a developer. Each pageBuilder entry
 * maps 1:1 to a React component in /components/blocks.
 */
export default defineType({
  name: "page",
  title: "Page",
  type: "document",
  groups: [
    { name: "content", title: "Content", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "Title", type: "string", group: "content", validation: (R) => R.required() }),
    defineField({
      name: "slug",
      title: "Slug",
      type: "slug",
      group: "content",
      options: { source: "title", maxLength: 96 },
      validation: (R) => R.required(),
    }),
    defineField({
      name: "pageBuilder",
      title: "Page content",
      type: "array",
      group: "content",
      of: [
        { type: "heroBlock" },
        { type: "imageGridBlock" },
        { type: "textBlock" },
        { type: "testimonialBlock" },
        { type: "ctaBlock" },
        { type: "processBlock" },
        { type: "servicesBlock" },
        { type: "contactBlock" },
        { type: "portfolioBlock" },
      ],
    }),
    defineField({ name: "seoTitle", title: "SEO title", type: "string", group: "seo" }),
    defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 2, group: "seo" }),
    defineField({ name: "seoImage", title: "Social share image", type: "cloudinaryImage", group: "seo" }),
  ],
  preview: { select: { title: "title" } },
});
