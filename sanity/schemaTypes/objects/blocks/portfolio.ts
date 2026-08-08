import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * Portfolio section — each project card is rendered by components/blocks/Portfolio.tsx.
 * Hero: optional Mux video or Cloudinary still. Clips and gallery use cloudinaryImage.
 */
export default defineType({
  name: "portfolioBlock",
  title: "Portafolio (proyectos)",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Subtítulo pequeño (arriba del título)",
      type: "string",
      description: "ej. NUESTRO TRABAJO",
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
      name: "description",
      title: "Descripción de la sección",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "projects",
      title: "Proyectos",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "portfolioProject",
          fields: [
            defineField({
              name: "label",
              title: "Etiqueta",
              type: "string",
              description: "ej. PROYECTO 01. Si lo dejas vacío se numera solo.",
            }),
            defineField({
              name: "category",
              title: "Categoría",
              type: "string",
              description: "ej. VIDEO MUSICAL",
            }),
            defineField({
              name: "title",
              title: "Nombre del proyecto",
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
              name: "credits",
              title: "Créditos",
              type: "array",
              description:
                "Una línea por renglón, tal como quieres que se lea. ej. Dirección FlyGuy · Producción Giorgi Studios",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "heroVideo",
              title: "Video principal",
              type: "muxVideo",
              description: "16:9 hero clip. Takes priority over the hero still when both are set.",
            }),
            defineField({
              name: "heroImage",
              title: "Imagen principal (alternativa al video)",
              type: "cloudinaryImage",
              description: "Use when there is no hero video yet — e.g. a key still or poster frame.",
            }),
            defineField({
              name: "clips",
              title: "Clips cortos",
              type: "array",
              description: "La fila de recuadros pequeños. Máximo 4.",
              validation: (R) => R.max(4),
              of: [
                defineArrayMember({
                  type: "object",
                  name: "clip",
                  fields: [
                    defineField({
                      name: "label",
                      title: "Etiqueta sobre el clip",
                      type: "string",
                      description: "ej. CLIP 01, STILL",
                    }),
                    defineField({ name: "caption", title: "Pie", type: "string" }),
                    defineField({
                      name: "image",
                      title: "Imagen / still",
                      type: "cloudinaryImage",
                    }),
                  ],
                  preview: { select: { title: "label", subtitle: "caption", media: "image.asset" } },
                }),
              ],
            }),
            defineField({
              name: "gallery",
              title: "Galería",
              type: "array",
              description: "Las fotos que se deslizan horizontalmente.",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "photo",
                  fields: [
                    defineField({ name: "label", title: "Etiqueta", type: "string" }),
                    defineField({
                      name: "image",
                      title: "Foto",
                      type: "cloudinaryImage",
                    }),
                  ],
                  preview: { select: { title: "label", subtitle: "image.alt", media: "image.asset" } },
                }),
              ],
            }),
          ],
          preview: { select: { title: "title", subtitle: "category" } },
        }),
      ],
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },
  },
});
