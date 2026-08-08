import type { Metadata } from "next";
import { PortfolioBlock } from "@/components/blocks/Portfolio";

export const metadata: Metadata = {
  title: "Portafolio (preview)",
  description: "Vista previa de maquetación — no es la página pública.",
  // Design scaffold, not content: keep it out of search results. It's already
  // absent from sitemap.ts, but that only declines to advertise it — this is
  // what actually tells crawlers not to index it if they find it anyway.
  robots: { index: false, follow: false },
};

/**
 * Static preview of the portfolio section, with placeholder media.
 *
 * Deliberately NOT at /portafolio: a static route shadows the dynamic /[slug]
 * one, so owning that path here would silently swallow the real Sanity page.
 * /portafolio stays free for Sarah to create in the Studio with the
 * portfolioBlock, and this route is only a layout scaffold — safe to delete
 * once the real page exists.
 */
const demo = {
  eyebrow: "Nuestro trabajo",
  heading: "Portafolio",
  description:
    "Una muestra de lo que hemos producido: video musical, comercial y contenido de marca, de la idea al montaje final.",
  projects: [
    {
      label: "Proyecto 01",
      category: "Video musical",
      title: "JP & PECA",
      description:
        'Producción audiovisual completa para el sencillo "JP & Peca", de Chatelain ft. Bnitez: dirección, rodaje, dirección de arte y montaje.',
      credits: [
        "Chatelain ft Bnitez · Dirección FlyGuy · Producción Giorgi Studios",
        "Guion FlyGuy · Cinematografía Juan Caballero · Producción musical Cjay_prod",
        "Color Juan Caballero · Gaffer Miguel Ortega · BTS Daniel Torrado",
        "Montaje FlyGuy — Giorgi Studios",
      ],
      clips: [
        { label: "Clip 01" },
        { label: "Clip 02" },
        { label: "Clip 03" },
        { label: "Still" },
      ],
      gallery: Array.from({ length: 8 }, (_, i) => ({
        label: String(i + 1).padStart(2, "0"),
      })),
    },
    {
      label: "Proyecto 02",
      category: "Comercial",
      title: "Nombre del proyecto",
      description:
        "Espacio de ejemplo para el segundo proyecto — misma estructura: video principal, descripción, créditos, clips y galería.",
      credits: [
        "Cliente · Dirección · Producción",
        "Cinematografía · Color · Montaje",
      ],
      clips: [{ label: "Clip 01" }, { label: "Clip 02" }, { label: "Still" }],
      gallery: Array.from({ length: 5 }, (_, i) => ({
        label: String(i + 1).padStart(2, "0"),
      })),
    },
  ],
};

export default function PortafolioPage() {
  return <PortfolioBlock block={demo} />;
}
