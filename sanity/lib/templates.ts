import type { Template } from "sanity";

/**
 * Fixed page starters — Homepage (/) and Portfolio (/portfolio).
 * Routes come from singleton document IDs, not a Sanity slug field.
 *
 * Homepage module order: Hero → (About / Quiénes somos — not built yet) → Services → Process → Contact.
 * Seed content strings are Spanish (user-facing).
 */
export const pageTemplates: Template[] = [
  {
    id: "page-homepage",
    title: "Inicio",
    description:
      "Raíz del sitio (/). Módulos: Portada → Servicios → Proceso → Contacto. Falta Quiénes somos.",
    schemaType: "page",
    value: {
      title: "Inicio",
      pageBuilder: [
        {
          _key: "homeHero",
          _type: "heroBlock",
          heading: "Tu historia,",
          headingAccent: "como se merece.",
        },
        // About / Quiénes somos — add when aboutBlock exists.
        {
          _key: "homeServices",
          _type: "servicesBlock",
          eyebrow: "LO QUE GRABAMOS",
          heading: "Lo que",
          headingAccent: "grabamos.",
          services: [{ _key: "homeService1", title: "Servicio" }],
        },
        {
          _key: "homeProcess",
          _type: "processBlock",
          eyebrow: "CÓMO TRABAJAMOS",
          heading: "Cómo",
          headingAccent: "trabajamos.",
          steps: [
            { _key: "homeStep1", title: "Etapa 1" },
            { _key: "homeStep2", title: "Etapa 2" },
          ],
        },
        {
          _key: "homeContact",
          _type: "contactBlock",
          eyebrow: "CONTACTO",
          heading: "Hablemos",
          headingAccent: "de tu proyecto.",
        },
      ],
    },
  },
  {
    id: "page-portfolio",
    title: "Portafolio",
    description: "Ruta /portfolio. Añade módulos del page-builder en el orden que necesites.",
    schemaType: "page",
    value: {
      title: "Portafolio",
      pageBuilder: [],
    },
  },
];
