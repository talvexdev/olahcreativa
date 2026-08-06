import { defineType, defineField } from "sanity";

export default defineType({
  name: "servicesBlock",
  title: "Servicios (tarjetas)",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Subtítulo pequeño (arriba del título)",
      type: "string",
      description: "ej. LO QUE GRABAMOS",
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
      name: "services",
      title: "Servicios",
      type: "array",
      description:
        "La grilla se acomoda sola: 3 servicios van en una fila, 4 en 2×2, 5 o 6 de a tres por fila.",
      validation: (R) => R.min(1).max(6),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Nombre del servicio",
              type: "string",
              validation: (R) => R.required(),
            }),
            defineField({
              name: "description",
              title: "Descripción",
              type: "text",
              rows: 3,
            }),
            defineField({
              name: "badge",
              title: "Etiqueta",
              type: "string",
              description: "Opcional — si lo dejas vacío se genera solo (PLANO 01, PLANO 02…)",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "badge" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },
  },
});
