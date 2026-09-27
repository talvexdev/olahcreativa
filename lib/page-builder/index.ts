export {
  mapProjectMediaToGalleryItems,
  type GalleryImageItem,
  type GalleryItem,
  type GalleryVideoItem,
} from "./project-gallery";

export {
  normalizePortfolioBlock,
  normalizePortfolioProject,
  type PortfolioBlockViewModel,
  type PortfolioClip,
  type PortfolioGalleryPhoto,
  type PortfolioProject,
} from "./portfolio";

export { normalizeProjectedMuxVideo, type ProjectedMuxVideo } from "./mux-video";

export {
  getImageGridColumnClass,
  getImageGridSizes,
  normalizeImageGridItems,
} from "./image-grid";

export {
  normalizeHeroShowcase,
  type HeroShowcaseClip,
  type HeroShowcaseView,
} from "./hero";

export { HERO_SECTION_ALIAS_ID, HERO_SECTION_ID, resolveSectionId, slugifyAnchor } from "./anchors";

export { ensureWorkCtaAfterPortfolio, omitWorkCtaBlocks } from "./work-cta";
