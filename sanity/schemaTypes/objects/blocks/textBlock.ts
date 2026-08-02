import { defineType, defineField } from "sanity";

export default defineType({
  name: "textBlock",
  title: "Text",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading (optional)", type: "string" }),
    defineField({
      name: "content",
      title: "Content",
      type: "array",
      of: [{ type: "block" }],
      validation: (R) => R.required(),
    }),
    defineField({
      name: "width",
      title: "Column width",
      type: "string",
      options: { list: [{ title: "Narrow (readable)", value: "narrow" }, { title: "Full width", value: "full" }] },
      initialValue: "narrow",
    }),
  ],
  preview: { select: { title: "heading" }, prepare: ({ title }) => ({ title: title || "Text block" }) },
});
