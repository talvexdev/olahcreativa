import { defineType, defineField } from "sanity";

export default defineType({
  name: "ctaBlock",
  title: "Llamada a la acción",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Título", type: "string", validation: (R) => R.required() }),
    defineField({
      name: "buttonLabel",
      title: "Texto del botón",
      type: "string",
      initialValue: "Escríbenos",
    }),
    defineField({
      name: "buttonHref",
      title: "Enlace del botón",
      type: "string",
      description: "ej. /portfolio, #contacto o mailto:hola@olahcreativa.com",
    }),
  ],
  preview: { select: { title: "heading" } },
});
