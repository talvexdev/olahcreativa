import { defineType, defineField } from "sanity";

/**
 * Fixed page-builder documents — Homepage (/) and Portfolio (/portfolio).
 * Public routes are tied to Studio singleton document IDs, not a slug field.
 * Each pageBuilder entry maps 1:1 to a React component in components/page-builder/blocks.
 */
export default defineType({
  name: "page",
  title: "Página",
  type: "document",
  groups: [
    { name: "content", title: "Contenido", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "string",
      group: "content",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "pageBuilder",
      title: "Contenido de la página",
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
    defineField({ name: "seoTitle", title: "Título SEO", type: "string", group: "seo" }),
    defineField({
      name: "seoDescription",
      title: "Descripción SEO",
      type: "text",
      rows: 2,
      group: "seo",
    }),
    defineField({
      name: "seoImage",
      title: "Imagen para redes",
      type: "cloudinaryImage",
      group: "seo",
    }),
  ],
  preview: { select: { title: "title" } },
});
