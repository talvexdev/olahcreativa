/**
 * Cloudinary image infrastructure — see docs/AGENT-STANDARDS.md §4–§7 for usage rules.
 */

export type {
  CloudinaryPoster,
  CloudinaryVariant,
  CloudinaryVariantConfig,
  SanityCloudinaryImage,
} from "./types";

export { CLOUDINARY_DELIVERY, CLOUDINARY_VARIANTS, getCloudinaryVariant } from "./variants";

export {
  buildCloudinaryDeliveryUrl,
  cloudinaryImageDimensions,
  cloudinaryImageUrl,
  cloudinaryMaxDeliveryWidth,
  cloudinarySeoUrl,
} from "./url";

export {
  buildCloudinarySrcSet,
  cloudinarySrcSetWidths,
  CLOUDINARY_SRCSET_WIDTHS,
} from "./srcset";

export {
  hasCloudinaryAsset,
  normalizeCloudinaryImage,
  toCloudinaryPoster,
} from "./guards";

export { getCloudinaryPublicId, walkSanityCloudinaryImage } from "./extract";

export { openGraphFromCloudinaryImage } from "./seo";
