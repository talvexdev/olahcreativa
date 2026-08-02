import { defineType, defineField } from "sanity";

export default defineType({
  name: "imageGridBlock",
  title: "Image grid",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading (optional)", type: "string" }),
    defineField({
      name: "columns",
      title: "Columns (desktop)",
      type: "string",
      options: { list: ["2", "3", "4"] },
      initialValue: "3",
    }),
    defineField({
      name: "items",
      title: "Images",
      type: "array",
      of: [{ type: "cloudinaryImage" }],
      validation: (R) => R.min(1),
    }),
  ],
  preview: {
    select: { title: "heading", items: "items" },
    prepare({ title, items }) {
      return { title: title || "Image grid", subtitle: `${items?.length || 0} image(s)` };
    },
  },
});
