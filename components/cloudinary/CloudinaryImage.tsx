import {
  buildCloudinaryDeliveryUrl,
  buildCloudinarySrcSet,
  cloudinaryImageDimensions,
  cloudinaryMaxDeliveryWidth,
  getCloudinaryVariant,
  hasCloudinaryAsset,
  type CloudinaryPoster,
  type CloudinaryVariant,
  type SanityCloudinaryImage,
} from "@/lib/cloudinary";

type Props = {
  image: SanityCloudinaryImage | CloudinaryPoster | null | undefined;
  variant: CloudinaryVariant;
  priority?: boolean;
  className?: string;
};

/**
 * Single image component for the whole app. Always pass a SanityCloudinaryImage
 * (from GROQ projection) and a named variant — never inline widths elsewhere.
 *
 * Server Component: builds `src` + `srcSet` strings on the server (no `next/image`
 * loader, no `CldImage`) so nothing non-serializable crosses into Client Components.
 */
export function CloudinaryImage({
  image,
  variant,
  priority = false,
  className = "h-full w-full object-cover",
}: Props) {
  if (!hasCloudinaryAsset(image)) return null;

  const maxWidth = cloudinaryMaxDeliveryWidth(image, variant);
  const { width, height } = cloudinaryImageDimensions(image, variant);
  const { sizes } = getCloudinaryVariant(variant);
  const src = buildCloudinaryDeliveryUrl(image.publicId, maxWidth);
  const srcSet = buildCloudinarySrcSet(image.publicId, maxWidth);

  return (
    // eslint-disable-next-line @next/next/no-img-element -- Cloudinary delivers optimized srcset; next/image loader is RSC-incompatible
    <img
      src={src}
      srcSet={srcSet}
      sizes={sizes}
      alt={image.alt}
      width={width}
      height={height}
      className={className}
      loading={priority ? "eager" : "lazy"}
      decoding="async"
      fetchPriority={priority ? "high" : "auto"}
    />
  );
}
