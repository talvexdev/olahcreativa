import { portfolioPageSeed } from "@/sanity/lib/page-seed";

function blockType(block: unknown): string | undefined {
  if (!block || typeof block !== "object" || !("_type" in block)) return undefined;
  const type = (block as { _type?: unknown })._type;
  return typeof type === "string" ? type : undefined;
}

/** Inicio must never render Más trabajos, even if a leftover CMS block remains. */
export function omitWorkCtaBlocks(blocks: unknown): unknown[] {
  if (!Array.isArray(blocks)) return [];
  return blocks.filter((block) => blockType(block) !== "workCtaBlock");
}

function defaultPortfolioWorkCta(): Record<string, unknown> {
  const fromSeed = portfolioPageSeed.pageBuilder.find(
    (block) => block._type === "workCtaBlock",
  );
  return fromSeed
    ? structuredClone(fromSeed)
    : {
        _key: "portfolioWorkCta",
        _type: "workCtaBlock",
        heading: "¿Quieres ver más trabajos como este?",
      };
}

/**
 * Portafolio template: Más trabajos sits immediately after the first
 * Portafolio module (before Contacto). Inserts the seed CTA if missing.
 */
export function ensureWorkCtaAfterPortfolio(blocks: unknown): unknown[] {
  const list = Array.isArray(blocks) ? [...blocks] : [];
  const existing = list.find((block) => blockType(block) === "workCtaBlock");
  const without = list.filter((block) => blockType(block) !== "workCtaBlock");
  const portfolioIdx = without.findIndex(
    (block) => blockType(block) === "portfolioBlock",
  );
  const at = portfolioIdx >= 0 ? portfolioIdx + 1 : without.length;
  without.splice(at, 0, existing ?? defaultPortfolioWorkCta());
  return without;
}
