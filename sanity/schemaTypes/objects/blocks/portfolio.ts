import { defineType, defineField, defineArrayMember } from "sanity";

import { PORTFOLIO_CREDIT_ROLES } from "@/lib/page-builder/credit-roles";

import { anchorIdField } from "../anchorId";

/**
 * Portfolio section — rendered by components/page-builder/blocks/Portfolio.tsx.
 * Hero: optional Cloudinary video or still. Clips: short Cloudinary loops or stills/GIFs.
 * Default anchor: #portafolio (set Ancla when adding more than one Portafolio module).
 */
export default defineType({
  name: "portfolioBlock",
  title: "Portafolio",
  type: "object",
  options: { modal: { type: "dialog", width: 5 } },
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
      ...anchorIdField,
      description:
        "Opcional. Por defecto #portafolio. Si añades otro módulo Portafolio debajo, pon aquí un ancla distinta (ej. portafolio-eventos) y enlázala desde Ajustes del sitio si quieres.",
    }),
    defineField({
      name: "projects",
      title: "Proyectos",
      type: "array",
      of: [
        defineArrayMember({
          type: "object",
          name: "portfolioProject",
          options: { modal: { type: "dialog", width: 5 } },
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
              name: "creditRoles",
              title: "Ficha técnica",
              type: "object",
              description:
                "Escribe solo el nombre en los roles que apliquen. Los que dejes vacíos no se muestran en la web.",
              options: { collapsible: true, collapsed: false },
              // Roles come from PORTFOLIO_CREDIT_ROLES so Studio and the renderer
              // can never drift apart — add a role there, not here.
              fields: PORTFOLIO_CREDIT_ROLES.map(({ field, label }) =>
                defineField({ name: field, title: label, type: "string" }),
              ),
            }),
            defineField({
              name: "creditList",
              title: "Otros créditos",
              type: "array",
              description:
                "Opcional. Solo para roles que no estén en la Ficha técnica. Se muestran después de los anteriores.",
              of: [
                defineArrayMember({
                  type: "object",
                  name: "credit",
                  fields: [
                    defineField({
                      name: "role",
                      title: "Rol",
                      type: "string",
                      description: "ej. Estilismo, Maquillaje, Asistente de cámara",
                    }),
                    defineField({
                      name: "name",
                      title: "Nombre",
                      type: "string",
                      validation: (R) => R.required(),
                    }),
                  ],
                  preview: { select: { title: "name", subtitle: "role" } },
                }),
              ],
            }),
            defineField({
              name: "credits",
              title: "Créditos en texto libre (heredado)",
              type: "array",
              description:
                "Solo para proyectos antiguos. Se usa únicamente si la Ficha técnica y Otros créditos están vacíos.",
              of: [{ type: "string" }],
            }),
            defineField({
              name: "heroVideo",
              title: "Video principal",
              type: "cloudinaryVideo",
              description: "Clip 16:9. Si también hay imagen principal, se muestra el video.",
            }),
            defineField({
              name: "heroImage",
              title: "Imagen principal (alternativa al video)",
              type: "cloudinaryImage",
              description: "Use when there is no hero video yet — e.g. a key still or poster frame.",
            }),
            defineField({
              name: "clips",
              title: "En movimiento (clips cortos)",
              type: "array",
              description:
                "Mosaico de hasta 4 piezas: cada recuadro tiene su propio ancho y alto. Video corto en bucle, o una imagen o GIF.",
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
                      name: "video",
                      title: "Video corto",
                      type: "cloudinaryVideo",
                      description:
                        "Clips en bucle y sin audio: el sitio los reproduce en silencio al entrar en vista (se pausan si el visitante pide reducir movimiento). No subas GIFs aquí; usa la imagen.",
                    }),
                    defineField({
                      name: "image",
                      title: "Imagen / GIF",
                      type: "cloudinaryImage",
                      description:
                        "Stills o GIFs animados. El video tiene prioridad si ambos están definidos.",
                    }),
                  ],
                  preview: {
                    select: {
                      title: "label",
                      subtitle: "caption",
                      video: "video.asset",
                      image: "image.asset",
                    },
                    prepare({ title, subtitle, video, image }) {
                      return { title, subtitle, media: video ?? image };
                    },
                  },
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
