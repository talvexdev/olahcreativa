import { CLOUDINARY_DELIVERY } from "./variants";
import type { SanityCloudinaryImage } from "./types";

/** Cloudinary asset metadata used for delivery transforms (GIF, animated WebP, etc.). */
export type CloudinaryDeliveryMeta = Pick<
  SanityCloudinaryImage,
  "publicId" | "format" | "resourceType" | "pages"
>;

/** True when the source should keep animation (GIF, animated WebP). */
export function isAnimatedCloudinaryImage(
  image: CloudinaryDeliveryMeta | null | undefined
): boolean {
  if (!image?.publicId) return false;

  if (typeof image.pages === "number" && image.pages > 1) return true;

  const format = image.format?.toLowerCase();
  if (format === "gif") return true;

  const resourceType = image.resourceType?.toLowerCase();
  if (resourceType === "gif") return true;

  return image.publicId.toLowerCase().endsWith(".gif");
}

/**
 * Delivery options for `getCldImageUrl`.
 * GIF sources use `f_gif` so animation is never stripped by `f_auto`.
 * Other animated assets (e.g. animated WebP) use `f_auto` + `fl_animated`.
 */
export function cloudinaryDeliveryTransformOptions(
  image?: CloudinaryDeliveryMeta | null
): {
  format: string;
  flags?: ["animated"];
  quality: string;
} {
  if (!isAnimatedCloudinaryImage(image)) {
    return {
      format: CLOUDINARY_DELIVERY.format,
      quality: CLOUDINARY_DELIVERY.quality,
    };
  }

  const format = image?.format?.toLowerCase();
  if (format === "gif" || image?.publicId.toLowerCase().endsWith(".gif")) {
    return { format: "gif", quality: "auto" };
  }

  return {
    format: "auto",
    flags: ["animated"],
    quality: "auto",
  };
}
