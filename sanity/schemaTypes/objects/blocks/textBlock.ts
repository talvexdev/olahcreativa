import { defineType, defineField } from "sanity";

export default defineType({
  name: "textBlock",
  title: "Texto",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Título (opcional)", type: "string" }),
    defineField({
      name: "content",
      title: "Contenido",
      type: "array",
      of: [{ type: "block" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "width",
      title: "Ancho de columna",
      type: "string",
      options: {
        list: [
          { title: "Estrecho (lectura)", value: "narrow" },
          { title: "Ancho completo", value: "full" },
        ],
      },
      initialValue: "narrow",
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Texto" }) },
});
