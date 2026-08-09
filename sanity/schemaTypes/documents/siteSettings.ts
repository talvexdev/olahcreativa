import { defineType, defineField } from "sanity";

import { SOCIAL_PLATFORM_OPTIONS } from "@/lib/site/social";

/** Singleton — global brand/nav/footer/contact settings. */
export default defineType({
  name: "siteSettings",
  title: "Ajustes del sitio",
  type: "document",
  fields: [
    defineField({
      name: "brandName",
      title: "Nombre de la marca",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({ name: "tagline", title: "Eslogan", type: "string" }),
    defineField({ name: "logo", title: "Logo", type: "cloudinaryImage" }),
    defineField({
      name: "navLinks",
      title: "Enlaces de navegación",
      type: "array",
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "label", title: "Texto", type: "string" }),
            defineField({ name: "href", title: "Enlace", type: "string" }),
          ],
        },
      ],
    }),
    defineField({ name: "contactEmail", title: "Correo de contacto", type: "string" }),
    defineField({
      name: "socialLinks",
      title: "Redes sociales",
      type: "array",
      description:
        "Se muestran como iconos en el pie de página. Elige la red y pega la URL. Puedes añadir, quitar o reordenar.",
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "platform",
              title: "Red",
              type: "string",
              options: { list: SOCIAL_PLATFORM_OPTIONS, layout: "dropdown" },
              validation: (R) => R.required(),
            }),
            defineField({
              name: "url",
              title: "URL",
              type: "url",
              validation: (R) => R.required().uri({ scheme: ["http", "https"] }),
            }),
          ],
          preview: {
            select: { title: "platform", subtitle: "url" },
            prepare({ title, subtitle }) {
              const label =
                SOCIAL_PLATFORM_OPTIONS.find((o) => o.value === title)?.title || title;
              return { title: label || "Red", subtitle };
            },
          },
        },
      ],
    }),
    defineField({ name: "defaultSeoTitle", title: "Título SEO por defecto", type: "string" }),
    defineField({
      name: "defaultSeoDescription",
      title: "Descripción SEO por defecto",
      type: "text",
      rows: 2,
    }),
    defineField({
      name: "defaultSeoImage",
      title: "Imagen para redes por defecto",
      type: "cloudinaryImage",
    }),
  ],
  preview: { select: { title: "brandName" } },
});
