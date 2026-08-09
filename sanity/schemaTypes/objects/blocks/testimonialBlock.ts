import { defineType, defineField } from "sanity";

export default defineType({
  name: "testimonialBlock",
  title: "Testimonio",
  type: "object",
  fields: [
    defineField({
      name: "quote",
      title: "Cita",
      type: "text",
      rows: 3,
      validation: (R) => R.required(),
    }),
    defineField({
      name: "attribution",
      title: "Atribución",
      type: "string",
      description: 'ej. "Cliente — marca"',
    }),
  ],
  preview: { select: { title: "attribution", subtitle: "quote" } },
});
