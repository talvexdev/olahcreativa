/**
 * Standard ficha técnica roles, in render order (fills the 3-column grid row by
 * row). Single source of truth: the Studio schema builds one optional string
 * field per entry from this list, and `normalizePortfolioCredits` reads them
 * back in the same order. Add a role here and it appears in both — never in one
 * alone.
 *
 * Kept dependency-free on purpose: the Studio schema imports it directly, so it
 * must not drag the Cloudinary/Mux barrel into the Studio bundle.
 */
export const PORTFOLIO_CREDIT_ROLES = [
  { field: "artist", label: "Artista" },
  { field: "direction", label: "Dirección" },
  { field: "production", label: "Producción" },
  { field: "script", label: "Guion" },
  { field: "cinematography", label: "Cinematografía" },
  { field: "musicProduction", label: "Prod. musical" },
  { field: "color", label: "Color" },
  { field: "gaffer", label: "Gaffer" },
  { field: "bts", label: "BTS" },
  { field: "editing", label: "Montaje" },
] as const;
