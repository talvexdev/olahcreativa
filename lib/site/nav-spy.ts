import {
  HERO_SECTION_ALIAS_ID,
  HERO_SECTION_ID,
} from "@/lib/page-builder/anchors";

/** Hashes that mean “top of Inicio / Portada”, including leftover CMS values. */
const HOME_HERO_HASHES = new Set([
  "",
  HERO_SECTION_ID,
  HERO_SECTION_ALIAS_ID,
  "home",
  "hero",
  "top",
]);

/** Tab labels editors still use for the first Inicio item. */
const HOME_HERO_LABELS = new Set(["inicio", "portada", "home"]);

/** Document scroll at or below this counts as the top of the page. */
export const DOCUMENT_TOP_PX = 16;

export type SpySection = { id: string; top: number; bottom: number };

export function isHomeHeroHash(hash: string): boolean {
  return HOME_HERO_HASHES.has(hash.trim().toLowerCase());
}

/**
 * True when this nav item is the homepage “top” tab (Portada, leftover Inicio
 * `/` or `/#inicio`, or a tab still labelled Inicio/Portada).
 */
export function isHomeHeroLink(
  path: string,
  hash: string,
  label: string,
  pathname: string,
): boolean {
  if (pathname !== "/" || path !== "/") return false;
  if (isHomeHeroHash(hash)) return true;
  return HOME_HERO_LABELS.has(label.trim().toLowerCase());
}

/**
 * Portada box in the DOM: `#portada`, leftover `#inicio`, or the first
 * `<section>` in `<main>` if the id is missing from a stale render.
 */
export function queryHomeHeroElement(): HTMLElement | null {
  return (
    document.getElementById(HERO_SECTION_ID) ||
    document.getElementById(HERO_SECTION_ALIAS_ID) ||
    document.querySelector("main > section")
  );
}

/**
 * Which hashed section owns the line just under the sticky header.
 *
 * The sticky header overlays Portada (`#portada` starts at y = 0). While that
 * box still contains the probe — or the document is at the top — the home tab
 * stays active. Never keep Quiénes somos while Portada still fills the viewport
 * under the header.
 */
export function pickSpySection({
  scrollY,
  probeY,
  sections,
  homeHeroId,
}: {
  scrollY: number;
  probeY: number;
  sections: SpySection[];
  homeHeroId?: string | null;
}): string {
  const y = Number.isFinite(scrollY) ? scrollY : 0;
  const located = [...sections].sort((a, b) => a.top - b.top);

  if (homeHeroId && y <= DOCUMENT_TOP_PX) return homeHeroId;

  const hero = homeHeroId
    ? located.find((row) => row.id === homeHeroId)
    : undefined;
  // Header sits on top of Portada: probe is inside the hero while its box
  // still covers the line just below the bar (hero.top may be 0 or negative).
  if (hero && hero.top <= probeY && hero.bottom > probeY) return homeHeroId!;

  let current = "";
  for (const row of located) {
    if (row.top <= probeY) current = row.id;
  }

  if (!current && homeHeroId) return homeHeroId;
  if (current && homeHeroId && isHomeHeroHash(current)) return homeHeroId;
  return current;
}
