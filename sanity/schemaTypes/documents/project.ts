import { defineType, defineField } from "sanity";

/**
 * The core content type: a single gallery/shoot. Media is a mixed array —
 * photos and video clips interleaved in one editable, reorderable list,
 * matching how a photographer actually thinks about a shoot's edit.
 */
export default defineType({
  name: "project",
  title: "Proyecto",
  type: "document",
  groups: [
    { name: "content", title: "Contenido", default: true },
    { name: "seo", title: "SEO" },
  ],
  fields: [
    defineField({ name: "title", title: "Título", type: "string", group: "content", validation: (R) => R.required() }),
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
      title: "Categoría",
      type: "string",
      group: "content",
      options: {
        list: [
          { title: "Boda", value: "Wedding" },
          { title: "Retrato", value: "Portrait" },
          { title: "Editorial", value: "Editorial" },
          { title: "Comercial", value: "Commercial" },
          { title: "Documental", value: "Documentary" },
          { title: "Otro", value: "Other" },
        ],
      },
    }),
    defineField({ name: "clientName", title: "Cliente (opcional)", type: "string", group: "content" }),
    defineField({ name: "shootDate", title: "Fecha de rodaje", type: "date", group: "content" }),
    defineField({
      name: "coverImage",
      title: "Imagen de portada",
      type: "cloudinaryImage",
      group: "content",
      description: "Se usa en la página del proyecto (/work/…).",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "media",
      title: "Media",
      type: "array",
      group: "content",
      of: [{ type: "cloudinaryImage" }, { type: "muxVideo" }],
      description: "Fotos y clips, en el orden de visualización.",
      validation: (R) => R.min(1),
    }),
    defineField({
      name: "order",
      title: "Orden",
      type: "number",
      group: "content",
      description: "Números más bajos aparecen primero.",
    }),
    defineField({ name: "seoTitle", title: "Título SEO", type: "string", group: "seo" }),
    defineField({ name: "seoDescription", title: "Descripción SEO", type: "text", rows: 2, group: "seo" }),
    defineField({
      name: "seoImage",
      title: "Imagen para redes (opcional)",
      type: "cloudinaryImage",
      group: "seo",
    }),
  ],
  preview: {
    select: { title: "title", subtitle: "category", media: "coverImage" },
  },
});

