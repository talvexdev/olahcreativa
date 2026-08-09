import { defineType, defineField } from "sanity";

export default defineType({
  name: "imageGridBlock",
  title: "Galería",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Título (opcional)", type: "string" }),
    defineField({
      name: "columns",
      title: "Columnas (escritorio)",
      type: "string",
      options: { list: ["2", "3", "4"] },
      initialValue: "3",
    }),
    defineField({
      name: "items",
      title: "Imágenes",
      type: "array",
      of: [{ type: "cloudinaryImage" }],
      validation: (R) => R.min(1),
    }),
  ],
  preview: {
    select: { title: "heading", items: "items" },
    prepare({ title, items }) {
      return { title: title || "Galería", subtitle: `${items?.length || 0} imagen(es)` };
    },
  },
});
