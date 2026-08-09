import { defineType, defineField } from "sanity";

/**
 * “Quiénes somos” — two-column about section: copy + brand mark.
 * Matches the reference landing layout (id #nosotros).
 */
export default defineType({
  name: "aboutBlock",
  title: "Quiénes somos",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Subtítulo pequeño (arriba del título)",
      type: "string",
      description: "ej. QUIÉNES SOMOS",
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
    }),
    defineField({
      name: "paragraphs",
      title: "Párrafos",
      type: "array",
      of: [{ type: "text", rows: 3 }],
      validation: (R) => R.min(1).max(4),
    }),
    defineField({
      name: "brandMark",
      title: "Marca (línea grande)",
      type: "string",
      description: 'ej. "Olah"',
      initialValue: "Olah",
    }),
    defineField({
      name: "brandMarkAccent",
      title: "Acento de la marca",
      type: "string",
      description: 'ej. "."',
      initialValue: ".",
    }),
    defineField({
      name: "brandMarkSubtitle",
      title: "Subtítulo de la marca",
      type: "string",
      description: 'ej. "creativa"',
      initialValue: "creativa",
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },
  },
});
