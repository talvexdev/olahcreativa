/**
 * Cloudinary image infrastructure — see docs/AGENT-STANDARDS.md §4–§7 for usage rules.
 */

export type {
  CloudinaryPoster,
  CloudinaryVariant,
  CloudinaryVariantConfig,
  CloudinaryVideoVariant,
  SanityCloudinaryImage,
  SanityCloudinaryVideo,
} from "./types";

export {
  CLOUDINARY_DELIVERY,
  CLOUDINARY_VARIANTS,
  CLOUDINARY_VIDEO_VARIANTS,
  getCloudinaryVariant,
  getCloudinaryVideoVariant,
} from "./variants";

export {
  buildCloudinaryDeliveryUrl,
  cloudinaryImageDimensions,
  cloudinaryImageUrl,
  cloudinaryMaxDeliveryWidth,
  cloudinarySeoUrl,
  cloudinaryVideoPosterUrl,
  cloudinaryVideoUrl,
} from "./url";

export {
  buildCloudinarySrcSet,
  cloudinarySrcSetWidths,
  CLOUDINARY_SRCSET_WIDTHS,
} from "./srcset";

export {
  hasCloudinaryAsset,
  normalizeCloudinaryImage,
  normalizeCloudinaryVideo,
  toCloudinaryPoster,
} from "./guards";

export { getCloudinaryPublicId, walkSanityCloudinaryImage } from "./extract";

export { isAnimatedCloudinaryImage, cloudinaryDeliveryTransformOptions } from "./format";

export { openGraphFromCloudinaryImage } from "./seo";
