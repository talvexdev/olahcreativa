import { defineType, defineField, defineArrayMember } from "sanity";

/**
 * Portfolio section — a list of projects, each rendered as one card by
 * components/blocks/Portfolio.tsx.
 *
 * Media is deliberately absent for now: the component draws placeholder
 * frames so the layout can be reviewed before any asset exists. When the
 * Mux/Cloudinary pipeline is turned on, add `video` (muxVideo) to the project
 * object, and `image` (cloudinaryImage) to `clips` and `gallery` — the counts
 * and labels below already drive how many frames appear, so nothing about the
 * layout has to change.
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
                  ],
                  preview: { select: { title: "label", subtitle: "caption" } },
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
                      name: "alt",
                      title: "Texto alternativo",
                      type: "string",
                      description:
                        "Describe la foto — lo leen los lectores de pantalla y Google.",
                    }),
                  ],
                  preview: { select: { title: "label", subtitle: "alt" } },
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
