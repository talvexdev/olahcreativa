/** Named delivery preset — add new use cases here, never ad-hoc widths in components. */
export type CloudinaryVariant = "thumbnail" | "grid" | "hero" | "lightbox" | "portrait";

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

/** Minimal fields for Mux lazy placeholders and other non-Sanity consumers. */
export type CloudinaryPoster = Pick<SanityCloudinaryImage, "publicId" | "alt">;

export type CloudinaryVariantConfig = {
  width: number;
  sizes: string;
  /** Used when Sanity does not store intrinsic dimensions. */
  fallbackAspectRatio: number;
};
