/** Fixed Studio document IDs (singletons) → public paths. */
export const HOME_PAGE_ID = "homepage";
export const PORTFOLIO_PAGE_ID = "pagePortfolio";

export const HOME_PAGE_PATH = "/";
export const PORTFOLIO_PAGE_PATH = "/portfolio";

const PATH_BY_ID: Record<string, string> = {
  [HOME_PAGE_ID]: HOME_PAGE_PATH,
  [PORTFOLIO_PAGE_ID]: PORTFOLIO_PAGE_PATH,
};

/** Public URL path for a page document id (`drafts.` prefix allowed). */
export function publicPathForPageId(id: string | undefined | null): string | null {
  if (!id) return null;
  const bare = id.replace(/^drafts\./, "");
  return PATH_BY_ID[bare] ?? null;
}
