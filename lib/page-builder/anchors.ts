/** Section anchors for in-page nav (`/#servicios`, unique ids when blocks repeat). */

const SLUG_RE = /[^a-z0-9]+/g;

/** Default HTML id for Portada (`heroBlock`) — first header tab target. */
export const HERO_SECTION_ID = "portada";

/** Leftover Inicio hash (`/#inicio`) — same module as `HERO_SECTION_ID`. */
export const HERO_SECTION_ALIAS_ID = "inicio";

/** Normalize CMS / fallback values into a safe HTML id fragment. */
export function slugifyAnchor(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(SLUG_RE, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 64);
}

type ResolveSectionIdOptions = {
  /** Optional CMS override (English slug, e.g. `portafolio-marca`). */
  anchorId?: string | null;
  /** Default id when override is empty (`nosotros`, `servicios`, …). */
  fallback: string;
  /** Sanity block `_key` — used when the fallback must stay unique. */
  key?: string | null;
  /**
   * When true and no custom `anchorId`, append a short key so repeated modules
   * (e.g. multiple Portafolio blocks) never share the same DOM id.
   */
  uniquifyFallback?: boolean;
};

/**
 * Resolves the `id` for a page-builder section.
 * Custom `anchorId` always wins; otherwise `fallback`, optionally uniquified.
 */
export function resolveSectionId({
  anchorId,
  fallback,
  key,
  uniquifyFallback = false,
}: ResolveSectionIdOptions): string {
  const custom = typeof anchorId === "string" ? slugifyAnchor(anchorId) : "";
  if (custom) return custom;

  const base = slugifyAnchor(fallback) || "section";
  if (!uniquifyFallback) return base;

  const suffix = typeof key === "string" ? slugifyAnchor(key).slice(0, 12) : "";
  return suffix ? `${base}-${suffix}` : base;
}
