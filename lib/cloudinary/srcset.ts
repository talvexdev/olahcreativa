import { buildCloudinaryDeliveryUrl } from "./url";

/**
 * Bounded srcset widths — keep aligned with `next.config.js` `images.deviceSizes`
 * / `imageSizes`. Only these widths become Cloudinary derivatives.
 */
export const CLOUDINARY_SRCSET_WIDTHS = [200, 224, 400, 640, 800, 1080, 1920, 2000] as const;

export function cloudinarySrcSetWidths(maxWidth: number): number[] {
  const capped = Math.max(1, Math.ceil(maxWidth));
  const widths = CLOUDINARY_SRCSET_WIDTHS.filter((w) => w <= capped);

  if (widths.length === 0 || widths[widths.length - 1] !== capped) {
    return [...widths, capped].sort((a, b) => a - b);
  }

  return widths;
}

/** Server-safe responsive srcset string — no functions cross the RSC boundary. */
export function buildCloudinarySrcSet(publicId: string, maxWidth: number): string {
  return cloudinarySrcSetWidths(maxWidth)
    .map((w) => `${buildCloudinaryDeliveryUrl(publicId, w)} ${w}w`)
    .join(", ");
}
