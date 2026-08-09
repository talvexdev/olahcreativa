import type { Template } from "sanity";

import { homepagePageSeed, portfolioPageSeed } from "./page-seed";

/**
 * Fixed page starters — Homepage (/) and Portfolio (/portfolio).
 * Routes come from singleton document IDs, not a Sanity slug field.
 * Content lives in `page-seed.ts` (shared with `npm run seed:pages`).
 * Header/footer come from site settings + root layout on every page.
 */
export const pageTemplates: Template[] = [
  {
    id: "page-homepage",
    title: "Inicio",
    description:
      "Raíz (/). Portada → Quiénes somos → Servicios → Más trabajos → Proceso → Contacto. Header/footer globales.",
    schemaType: "page",
    value: homepagePageSeed,
  },
  {
    id: "page-portfolio",
    title: "Portafolio",
    description:
      "Ruta /portfolio. Portafolio → Contacto; puedes añadir más módulos Portafolio debajo del primero. Header/footer globales.",
    schemaType: "page",
    value: portfolioPageSeed,
  },
];
