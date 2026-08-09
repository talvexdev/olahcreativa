import { defineType, defineField, defineArrayMember } from "sanity";

export default defineType({
  name: "heroBlock", // must match PageBuilder registry key
  title: "Portada",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Subtítulo pequeño (arriba del título)",
      type: "string",
      description: "ej. PRODUCTORA AUDIOVISUAL · FOTO & VIDEO",
    }),
    defineField({
      name: "heading",
      title: "Título",
      type: "string",
      validation: (R) => R.required(),
    }),
    defineField({
      name: "headingAccent",
      title: "Título — parte en color de acento",
      type: "string",
      description: 'ej. "como se merece."',
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      rows: 3,
    }),
    defineField({ name: "ctaPrimary", title: "Botón 1 (sólido)", type: "link" }),
    defineField({ name: "ctaSecondary", title: "Botón 2 (contorno)", type: "link" }),
    defineField({
      name: "showcaseClips",
      title: "Clips del reel (opcional)",
      type: "array",
      description:
        "Hasta 3 clips para la grilla bajo el hero (como en la portada de referencia). Usa Mux con poster Cloudinary.",
      validation: (R) => R.max(3),
      of: [
        defineArrayMember({
          type: "object",
          name: "showcaseClip",
          fields: [
            defineField({
              name: "label",
              title: "Etiqueta sobre el clip",
              type: "string",
              description: "ej. REEL 2026",
            }),
            defineField({
              name: "video",
              title: "Video (Mux)",
              type: "muxVideo",
            }),
            defineField({
              name: "image",
              title: "Imagen (si no hay video)",
              type: "cloudinaryImage",
            }),
          ],
          preview: {
            select: { title: "label", media: "image.asset" },
            prepare({ title }) {
              return { title: title || "Clip" };
            },
          },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },
  },
});
