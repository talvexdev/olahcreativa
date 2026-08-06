import { defineType, defineField } from "sanity";

/**
 * Copy only — the form fields and the email sending live in code
 * (components/BriefForm.tsx and lib/actions/contact.ts). Where the message
 * gets delivered is set with CONTACT_TO_EMAIL, not here, so an editor can
 * never accidentally reroute the inbox.
 */
export default defineType({
  name: "contactBlock",
  title: "Contacto (formulario)",
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Subtítulo pequeño (arriba del título)",
      type: "string",
      description: "ej. CONTACTO",
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
      title: "Descripción",
      type: "text",
      rows: 3,
    }),
    defineField({
      name: "links",
      title: "Datos de contacto visibles",
      type: "array",
      description:
        "Correo, teléfono, redes. Usa mailto: para correo y tel: para teléfono.",
      validation: (R) => R.max(4),
      of: [{ type: "link" }],
    }),
    defineField({
      name: "formTitle",
      title: "Título del panel",
      type: "string",
      initialValue: "BRIEF RÁPIDO",
    }),
    defineField({
      name: "interests",
      title: "Opciones de interés",
      type: "array",
      description:
        "Las pastillas seleccionables. Déjalo vacío si no las quieres.",
      of: [{ type: "string" }],
      options: { layout: "tags" },
    }),
    defineField({
      name: "submitLabel",
      title: "Texto del botón",
      type: "string",
      initialValue: "Enviar brief",
    }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },
  },
});
