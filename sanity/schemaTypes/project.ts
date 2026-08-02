import { defineType, defineField } from "sanity";

/**
 * The core content type: a single gallery/shoot. Media is a mixed array —
 * photos and video clips interleaved in one editable, reorderable list,
 * matching how a photographer actually thinks about a shoot's edit.
 */
export default defineType({
  name: "project",
  title: "Project",
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
      name: "category",
      title: "Category",
      type: "string",
      group: "content",
      options: {
        list: ["Wedding", "Portrait", "Editorial", "Commercial", "Documentary", "Other"],
      },
    }),
    defineField({ name: "clientName", title: "Client name (optional)", type: "string", group: "content" }),
    defineField({ name: "shootDate", title: "Shoot date", type: "date", group: "content" }),
    defineField({
      name: "coverImage",
      title: "Cover image",
      type: "cloudinaryImage",
      group: "content",
      description: "Used on the homepage grid and project listing.",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "media",
      title: "Media",
      type: "array",
      group: "content",
      of: [{ type: "cloudinaryImage" }, { type: "muxVideo" }],
      description: "Photos and video clips, in display order.",
      validation: (R) => R.min(1),
    }),
    defineField({ name: "featured", title: "Featured on homepage", type: "boolean", group: "content", initialValue: false }),
    defineField({ name: "order", title: "Display order", type: "number", group: "content", description: "Lower numbers show first." }),
    defineField({ name: "seoTitle", title: "SEO title", type: "string", group: "seo" }),
    defineField({ name: "seoDescription", title: "SEO description", type: "text", rows: 2, group: "seo" }),
    defineField({ name: "seoImage", title: "Social share image (optional)", type: "cloudinaryImage", group: "seo" }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});
