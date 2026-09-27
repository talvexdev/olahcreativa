import { getCldImageUrl, getCldVideoUrl } from "next-cloudinary";

import { cloudinaryDeliveryTransformOptions } from "./format";
import { getCloudinaryVariant, getCloudinaryVideoVariant } from "./variants";
import type { CloudinaryDeliveryMeta } from "./format";
import type { CloudinaryVariant, CloudinaryVideoVariant, SanityCloudinaryImage } from "./types";
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
export function buildCloudinaryDeliveryUrl(
  publicId: string,
  width: number,
  meta?: CloudinaryDeliveryMeta | null
): string {
  const { format, flags, quality } = cloudinaryDeliveryTransformOptions(meta);

  return getCldImageUrl({
    src: publicId,
    width,
    crop: "limit",
    quality,
    format,
    ...(flags ? { flags } : {}),
  });
}

function cloudinaryVideoDeliveryWidth(variant: CloudinaryVideoVariant, sourceWidth?: number): number {
  const { width } = getCloudinaryVideoVariant(variant);
  if (typeof sourceWidth === "number" && sourceWidth > 0) {
    return Math.min(width, sourceWidth);
  }
  return width;
}

/** One cached MP4 per preset. Do not pass `f_auto` — that stores a derivative per browser. */
export function cloudinaryVideoUrl(
  publicId: string,
  variant: CloudinaryVideoVariant,
  sourceWidth?: number
): string {
  return getCldVideoUrl({
    src: publicId,
    width: cloudinaryVideoDeliveryWidth(variant, sourceWidth),
    crop: "limit",
    quality: "auto:good",
    format: "mp4",
  });
}

/** First-frame still. One JPEG per preset, generated from the same width as playback. */
export function cloudinaryVideoPosterUrl(
  publicId: string,
  variant: CloudinaryVideoVariant,
  sourceWidth?: number
): string {
  return getCldVideoUrl({
    src: publicId,
    width: cloudinaryVideoDeliveryWidth(variant, sourceWidth),
    crop: "limit",
    quality: "auto:good",
    format: "jpg",
    rawTransformations: ["so_0"],
  });
}

/** Builds a delivery URL when a plain string is required (lightbox, OG fallbacks). */
export function cloudinaryImageUrl(
  publicId: string,
  variant: CloudinaryVariant,
  meta?: CloudinaryDeliveryMeta | null
): string {
  const { width } = getCloudinaryVariant(variant);
  return buildCloudinaryDeliveryUrl(publicId, width, meta);
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
