import type { CloudinaryPoster, SanityCloudinaryImage } from "./types";

export function hasCloudinaryAsset(
  image: SanityCloudinaryImage | CloudinaryPoster | null | undefined
): image is SanityCloudinaryImage | CloudinaryPoster {
  return Boolean(image?.publicId);
}

/** Normalizes GROQ results or partial objects into a consistent image shape. */
export function normalizeCloudinaryImage(value: unknown): SanityCloudinaryImage | null {
  if (!value || typeof value !== "object") return null;

  const record = value as Record<string, unknown>;
  const publicId = record.publicId;
  const alt = record.alt;

  if (typeof publicId !== "string" || !publicId) return null;
  if (typeof alt !== "string" || !alt) return null;

  return {
    publicId,
    alt,
    url: typeof record.url === "string" ? record.url : undefined,
    width: typeof record.width === "number" ? record.width : undefined,
    height: typeof record.height === "number" ? record.height : undefined,
    caption: typeof record.caption === "string" ? record.caption : undefined,
  };
}

export function toCloudinaryPoster(
  image: SanityCloudinaryImage | null | undefined
): CloudinaryPoster | null {
  if (!hasCloudinaryAsset(image)) return null;
  return { publicId: image.publicId, alt: image.alt };
}
