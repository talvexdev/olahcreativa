import { defineType, defineField } from "sanity";

export default defineType({
  name: "testimonialBlock",
  title: "Testimonial",
  type: "object",
  fields: [
    defineField({ name: "quote", title: "Quote", type: "text", rows: 3, validation: (R) => R.required() }),
    defineField({ name: "attribution", title: "Attribution", type: "string", description: "e.g. \"Sarah & James, married Sept 2025\"" }),
  ],
  preview: { select: { title: "attribution", subtitle: "quote" } },
});
