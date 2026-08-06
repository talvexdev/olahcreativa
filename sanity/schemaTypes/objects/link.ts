import { defineType, defineField } from "sanity";

export default defineType({
  name: "link",
  title: "Link",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Button text",
      type: "string",
    }),
    defineField({
      name: "href",
      title: "Where it goes",
      type: "string",
      description: "e.g. /contacto, #portafolio, or mailto:hola@olahcreativa.com",
    }),
  ],
});
