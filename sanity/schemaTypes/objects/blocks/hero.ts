import { defineType, defineField } from "sanity";

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
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },
  },
});
