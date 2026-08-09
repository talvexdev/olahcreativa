/**
 * Shared page / site seed payloads — used by page templates and `npm run seed:pages`.
 * Spanish user-facing copy only. No Mux/Cloudinary assets (add media in the CMS editor).
 *
 * Header + footer are global (`siteSettings` + root layout), not page-builder modules.
 */

export type PageSeedValue = {
  title: string;
  pageBuilder: Record<string, unknown>[];
};

export type SiteSettingsSeedValue = {
  brandName: string;
  tagline?: string;
  navLinks?: { label: string; href: string }[];
  contactEmail?: string;
  socialLinks?: { platform: string; url: string }[];
  defaultSeoTitle?: string;
  defaultSeoDescription?: string;
};

/** Global header / footer / SEO — shared by every page via `app/layout.tsx`. */
export const siteSettingsSeed: SiteSettingsSeedValue = {
  brandName: "Olah Creativa",
  tagline: "Productora audiovisual · foto & video",
  navLinks: [
    { label: "Inicio", href: "/" },
    { label: "Servicios", href: "/#servicios" },
    { label: "Portafolio", href: "/portfolio" },
    { label: "Contacto", href: "/#contacto" },
  ],
  contactEmail: "Contact@olahcreativa.com",
  socialLinks: [
    {
      platform: "Instagram",
      url: "https://instagram.com/olahcreativa",
    },
  ],
  defaultSeoTitle: "Olah Creativa",
  defaultSeoDescription:
    "Productora audiovisual que ayuda a empresas a promocionar sus servicios con contenido creativo y dinámico.",
};

/** Inicio (/) — Portada → Quiénes somos → Servicios → Más trabajos → Proceso → Contacto. */
export const homepagePageSeed: PageSeedValue = {
  title: "Inicio",
  pageBuilder: [
    {
      _key: "homeHero",
      _type: "heroBlock",
      eyebrow: "GRABANDO · PRODUCTORA AUDIOVISUAL",
      heading: "Contamos la historia de tu marca",
      headingAccent: "como se merece.",
      description:
        "Olah Creativa es una productora audiovisual que ayuda a empresas a promocionar sus servicios con contenido creativo y dinámico: videos que se ven bien y que además cumplen un objetivo.",
      ctaPrimary: {
        label: "Cuéntanos tu proyecto",
        href: "#contacto",
      },
      ctaSecondary: {
        label: "Ver servicios",
        href: "#servicios",
      },
      highlightEyebrow: "PRODUCTORA AUDIOVISUAL",
      highlightHeading: "Idea → entrega",
      highlightDescription: "dirección, rodaje, edición y color",
    },
    {
      _key: "homeAbout",
      _type: "aboutBlock",
      eyebrow: "QUIÉNES SOMOS",
      heading: "Una productora hecha para marcas que quieren verse",
      headingAccent: "distintas.",
      paragraphs: [
        "En Olah Creativa creemos que el video sigue siendo la forma más efectiva de conectar con las personas. Por eso trabajamos con empresas que quieren promocionar sus servicios de una manera creativa y dinámica, sin caer en lo genérico.",
        "Acompañamos cada proyecto desde la idea hasta la entrega final: dirección, rodaje, edición y color, siempre pensando en el objetivo real detrás del video — vender, comunicar o posicionar una marca.",
      ],
      brandMark: "Olah",
      brandMarkAccent: ".",
      brandMarkSubtitle: "creativa",
    },
    {
      _key: "homeServices",
      _type: "servicesBlock",
      eyebrow: "LO QUE GRABAMOS",
      heading: "Servicios,",
      headingAccent: "plano por plano.",
      services: [
        {
          _key: "homeService1",
          badge: "PLANO 01",
          title: "Video corporativo",
          description:
            "Piezas institucionales que presentan tu empresa, tu equipo y tu propuesta de valor con claridad.",
        },
        {
          _key: "homeService2",
          badge: "PLANO 02",
          title: "Contenido para redes",
          description:
            "Videos cortos y dinámicos pensados para Instagram, TikTok y YouTube que dan ganas de seguir viendo.",
        },
        {
          _key: "homeService3",
          badge: "PLANO 03",
          title: "Comerciales",
          description:
            "Spots publicitarios con dirección de arte propia, hechos para vender un producto o servicio.",
        },
        {
          _key: "homeService4",
          badge: "PLANO 04",
          title: "Documentales de marca",
          description:
            "Historias reales detrás de una empresa: su gente, su proceso, su porqué.",
        },
        {
          _key: "homeService5",
          badge: "PLANO 05",
          title: "Cobertura de eventos",
          description:
            "Registro audiovisual completo de lanzamientos, conferencias y activaciones de marca.",
        },
        {
          _key: "homeService6",
          badge: "PLANO 06",
          title: "Motion graphics",
          description:
            "Animación y edición gráfica para explicar ideas complejas de forma simple y visual.",
        },
      ],
    },
    {
      _key: "homeWorkCta",
      _type: "workCtaBlock",
      heading: "¿Quieres ver más trabajos como este?",
      description:
        "Vamos a seguir sumando proyectos a este portafolio. Mientras tanto, síguenos en Instagram o escríbenos y con gusto compartimos más ejemplos directamente contigo.",
      cta: {
        label: "@olahcreativa",
        href: "https://instagram.com/olahcreativa",
      },
    },
    {
      _key: "homeProcess",
      _type: "processBlock",
      eyebrow: "CÓMO TRABAJAMOS",
      heading: "De la idea a la entrega,",
      headingAccent: "en tres cortes.",
      steps: [
        {
          _key: "homeStep1",
          label: "PRE",
          title: "Pre-producción",
          description:
            "Entendemos tu marca y tu objetivo, definimos guion, locaciones y dirección de arte antes de encender una sola cámara.",
        },
        {
          _key: "homeStep2",
          label: "PRO",
          title: "Producción",
          description:
            "Rodaje con equipo profesional. Dirigimos cada plano para que el resultado se sienta cuidado y a la vez natural.",
        },
        {
          _key: "homeStep3",
          label: "POST",
          title: "Postproducción",
          description:
            "Edición, color y sonido. Entregamos el video listo para publicar en el formato que tu canal necesite.",
        },
      ],
    },
    {
      _key: "homeContact",
      _type: "contactBlock",
      eyebrow: "HABLEMOS",
      heading: "¿Listo para grabar algo",
      headingAccent: "increíble?",
      description:
        "Cuéntanos qué necesita tu marca y te contactamos para conversar sobre tu proyecto.",
    },
  ],
};

/**
 * Portafolio (/portfolio) — one Portafolio module + Contacto.
 * Editors can insert additional Portafolio modules below the first in the page builder.
 */
export const portfolioPageSeed: PageSeedValue = {
  title: "Portafolio",
  pageBuilder: [
    {
      _key: "portfolioMain",
      _type: "portfolioBlock",
      eyebrow: "NUESTRO TRABAJO",
      heading: "Portafolio",
      description:
        "Una selección de piezas recientes. Seguimos sumando proyectos a este espacio.",
      projects: [],
    },
    {
      _key: "portfolioContact",
      _type: "contactBlock",
      eyebrow: "HABLEMOS",
      heading: "¿Listo para grabar algo",
      headingAccent: "increíble?",
      description:
        "Cuéntanos qué necesita tu marca y te contactamos para conversar sobre tu proyecto.",
    },
  ],
};
