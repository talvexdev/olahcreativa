import { defineType, defineField } from "sanity";

export default defineType({
  name: "link",
  title: "Enlace",
  type: "object",
  fields: [
    defineField({
      name: "label",
      title: "Texto del botón",
      type: "string",
    }),
    defineField({
      name: "href",
      title: "Destino",
      type: "string",
      description: "ej. /portfolio, #portafolio, #contacto o mailto:hola@olahcreativa.com",
    }),
  ],
});
