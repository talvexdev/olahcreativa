import type { CloudinaryVariant, CloudinaryVariantConfig } from "./types";

/**
 * The only transformation sizes used on the public site. Each unique
 * width + q_auto + f_auto combo counts once per source image on Cloudinary;
 * cached repeats are free.
 */
export const CLOUDINARY_VARIANTS: Record<CloudinaryVariant, CloudinaryVariantConfig> = {
  thumbnail: {
    width: 400,
    sizes: "(max-width: 768px) 50vw, 200px",
    fallbackAspectRatio: 3 / 2,
  },
  grid: {
    width: 800,
    sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw",
    fallbackAspectRatio: 4 / 5,
  },
  portrait: {
    width: 640,
    sizes: "224px",
    fallbackAspectRatio: 3 / 4,
  },
  hero: {
    width: 1920,
    sizes: "100vw",
    fallbackAspectRatio: 16 / 9,
  },
  lightbox: {
    width: 2000,
    sizes: "100vw",
    fallbackAspectRatio: 3 / 2,
  },
};

export const CLOUDINARY_DELIVERY = {
  /** Best balance on free tier — sharper than `auto`, lighter than `auto:best`. */
  quality: "auto:good" as const,
  format: "auto" as const,
};

export function getCloudinaryVariant(variant: CloudinaryVariant): CloudinaryVariantConfig {
  return CLOUDINARY_VARIANTS[variant];
}
