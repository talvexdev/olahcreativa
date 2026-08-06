import { defineType, defineField } from "sanity";

/**
 * Timeline section — the steps are scrubbed by a playhead that follows the
 * reader's scroll, so the order of `steps` is the order of playback.
 */
export default defineType({
  name: "processBlock",
  title: "Proceso (línea de tiempo)",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Subtítulo pequeño (arriba del título)",
      type: "string",
      description: "ej. CÓMO TRABAJAMOS",
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
      description: 'ej. "en tres cortes."',
    }),
    defineField({
      name: "steps",
      title: "Etapas",
      type: "array",
      validation: (R) => R.min(2).max(5),
      of: [
        {
          type: "object",
          fields: [
            defineField({
              name: "title",
              title: "Nombre de la etapa",
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
              name: "timecode",
              title: "Timecode",
              type: "string",
              description: "Opcional — si lo dejas vacío se genera solo (00:00, 00:01…)",
            }),
            defineField({
              name: "label",
              title: "Etiqueta corta",
              type: "string",
              description: "ej. PRE, PRO, POST",
            }),
          ],
          preview: {
            select: { title: "title", subtitle: "label" },
          },
        },
      ],
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },
  },
});
