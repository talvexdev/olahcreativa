import { getCldImageUrl } from "next-cloudinary";

import { CLOUDINARY_DELIVERY, getCloudinaryVariant } from "./variants";
import type { CloudinaryVariant, SanityCloudinaryImage } from "./types";
import { hasCloudinaryAsset } from "./guards";

/** Max delivery width for a variant — never upscale beyond the source asset. */
export function cloudinaryMaxDeliveryWidth(
  image: SanityCloudinaryImage,
  variant: CloudinaryVariant
): number {
  const { width: variantWidth } = getCloudinaryVariant(variant);

  if (typeof image.width === "number" && image.width > 0) {
    return Math.min(variantWidth, image.width);
  }

  return variantWidth;
}

/** Builds a transformed Cloudinary delivery URL at an explicit width. */
export function buildCloudinaryDeliveryUrl(publicId: string, width: number): string {
  return getCldImageUrl({
    src: publicId,
    width,
    crop: "limit",
    quality: CLOUDINARY_DELIVERY.quality,
    format: CLOUDINARY_DELIVERY.format,
  });
}

/** Builds a delivery URL when a plain string is required (lightbox, OG fallbacks, Mux placeholders). */
export function cloudinaryImageUrl(publicId: string, variant: CloudinaryVariant): string {
  const { width } = getCloudinaryVariant(variant);
  return buildCloudinaryDeliveryUrl(publicId, width);
}

/** Width/height for `<CloudinaryImage />` — delivery width comes from the variant; aspect ratio from Sanity when available. */
export function cloudinaryImageDimensions(
  image: SanityCloudinaryImage,
  variant: CloudinaryVariant
): { width: number; height: number } {
  const maxWidth = cloudinaryMaxDeliveryWidth(image, variant);
  const { fallbackAspectRatio } = getCloudinaryVariant(variant);
  const aspectRatio =
    image.width && image.height ? image.width / image.height : fallbackAspectRatio;

  return {
    width: maxWidth,
    height: Math.round(maxWidth / aspectRatio),
  };
}

/** Prefer Sanity's stored HTTPS URL; fall back to a transformed delivery URL. */
export function cloudinarySeoUrl(image: SanityCloudinaryImage | null | undefined): string | undefined {
  if (!image) return undefined;
  if (image.url) return image.url;
  if (hasCloudinaryAsset(image)) return cloudinaryImageUrl(image.publicId, "hero");
  return undefined;
}
