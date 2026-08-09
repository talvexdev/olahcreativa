import { defineType, defineField } from "sanity";

/**
 * Full-width “más trabajos” banner — copy + CTA (e.g. Instagram / portafolio).
 * Distinct from the centered `ctaBlock` (Llamada a la acción).
 */
export default defineType({
  name: "workCtaBlock",
  title: "Más trabajos",
  type: "object",
  fields: [
    defineField({
      name: "heading",
      title: "Título",
      type: "string",
      validation: (R) => R.required(),
      description: 'ej. "¿Quieres ver más trabajos como este?"',
    }),
    defineField({
      name: "description",
      title: "Descripción",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "cta",
      title: "Botón",
      type: "link",
      description: "ej. Instagram (@olahcreativa) o enlace a /portfolio",
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "cta.label" },
  },
});
