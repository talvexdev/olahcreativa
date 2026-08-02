import { CldImage } from "next-cloudinary";

type Props = {
  publicId: string;
  alt: string;
  variant: "thumbnail" | "grid" | "hero" | "lightbox";
  priority?: boolean;
};

/**
 * The ONLY place image sizes are defined. Per the free-tier-conscious
 * architecture: a fixed, small set of named variants bounds Cloudinary
 * transformation-credit usage to a predictable number, instead of every
 * component inventing its own width/quality combo.
 */
const VARIANTS: Record<Props["variant"], { width: number; sizes: string }> = {
  thumbnail: { width: 400, sizes: "(max-width: 768px) 50vw, 200px" },
  grid:      { width: 800, sizes: "(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw" },
  hero:      { width: 1920, sizes: "100vw" },
  lightbox:  { width: 2000, sizes: "100vw" },
};

export function CloudinaryPhoto({ publicId, alt, variant, priority = false }: Props) {
  const { width, sizes } = VARIANTS[variant];
  return (
    <CldImage
      src={publicId}
      alt={alt}
      width={width}
      height={Math.round((width * 2) / 3)}
      sizes={sizes}
      priority={priority}
      quality="auto"
      format="auto"
      className="h-full w-full object-cover"
    />
  );
}
