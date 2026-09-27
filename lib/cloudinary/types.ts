/** Named delivery preset — add new use cases here, never ad-hoc widths in components. */
export type CloudinaryVariant = "thumbnail" | "grid" | "hero" | "lightbox" | "portrait";

/** Named video delivery preset. One MP4 width per preset — see `variants.ts`. */
export type CloudinaryVideoVariant = "clip" | "film";

/** Shape returned by GROQ `cloudinaryImageProjection` across the app. */
export type SanityCloudinaryImage = {
  publicId: string;
  alt: string;
  url?: string;
  width?: number;
  height?: number;
  caption?: string;
  /** From Cloudinary asset metadata — used for GIF / animated delivery. */
  format?: string;
  resourceType?: string;
  /** Frame count — values > 1 indicate animated GIF/WebP. */
  pages?: number;
};

/** Minimal fields for a still used as a video placeholder. */
export type CloudinaryPoster = Pick<SanityCloudinaryImage, "publicId" | "alt">;

/** Shape returned by GROQ `cloudinaryVideoProjection`. */
export type SanityCloudinaryVideo = {
  publicId: string;
  alt: string;
  width?: number;
  height?: number;
  caption?: string;
  autoplayMuted?: boolean;
  resourceType?: string;
};

export type CloudinaryVariantConfig = {
  width: number;
  sizes: string;
  /** Used when Sanity does not store intrinsic dimensions. */
  fallbackAspectRatio: number;
};
