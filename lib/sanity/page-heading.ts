type BlockWithHeading = {
  _type?: string;
  heading?: string;
  headingAccent?: string;
};

function formatBlockHeading(block: BlockWithHeading): string | undefined {
  if (typeof block.heading !== "string" || !block.heading) return undefined;

  if (typeof block.headingAccent === "string" && block.headingAccent) {
    return `${block.heading} ${block.headingAccent}`;
  }

  return block.heading;
}

/**
 * Accessible page title for the single sr-only `<h1>` on CMS pages.
 * Prefers the first hero/portfolio block heading so screen readers match
 * the primary visible headline; falls back to the document title.
 */
export function getPageAccessibleHeading(page: {
  title?: string;
  pageBuilder?: unknown;
}): string {
  const blocks = Array.isArray(page.pageBuilder) ? page.pageBuilder : [];

  for (const raw of blocks) {
    if (!raw || typeof raw !== "object") continue;
    const block = raw as BlockWithHeading;

    if (block._type === "heroBlock" || block._type === "portfolioBlock") {
      const heading = formatBlockHeading(block);
      if (heading) return heading;
    }
  }

  return typeof page.title === "string" && page.title ? page.title : "Page";
}
