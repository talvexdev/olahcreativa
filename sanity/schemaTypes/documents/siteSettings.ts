import { defineType, defineField } from "sanity";

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
      of: [
        {
          type: "object",
          fields: [
            defineField({ name: "platform", title: "Plataforma", type: "string" }),
            defineField({ name: "url", title: "URL", type: "url" }),
          ],
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
