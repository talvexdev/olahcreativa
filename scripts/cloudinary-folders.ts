import { PORTFOLIO_PAGE_ID } from "../lib/sanity/page-slugs";

/**
 * JP & PECA on /portfolio, filled by `npm run content:sync`.
 * Video principal is the long film. The four short Secuencia clips fill
 * CLIP 01, CLIP 02, CLIP 03, and STILL. Stills fill the gallery.
 */
export type CloudinaryPortfolioFolder = {
  folder: string;
  pageId: string;
  projectTitle: string;
};

export const CLOUDINARY_PORTFOLIO_FOLDERS: CloudinaryPortfolioFolder[] = [
  {
    folder: "JP-PECA Portfolio",
    pageId: PORTFOLIO_PAGE_ID,
    projectTitle: "JP & PECA",
  },
];
