/**
 * Reads Cloudinary public_id values from Sanity document shapes.
 * Used by the media-cleanup tombstone pipeline.
 */
export function getCloudinaryPublicId(obj: unknown): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;

  const record = obj as Record<string, unknown>;

  // Projected SanityCloudinaryImage from GROQ
  if (typeof record.publicId === "string" && record.publicId) {
    return record.publicId;
  }

  // Raw cloudinaryImage object in webhook payloads
  const asset = record.asset as Record<string, unknown> | undefined;
  if (asset?.public_id && typeof asset.public_id === "string") {
    return asset.public_id;
  }

  return undefined;
}

export function walkSanityCloudinaryImage(
  obj: unknown,
  onPublicId: (publicId: string) => void
): void {
  const publicId = getCloudinaryPublicId(obj);
  if (publicId) onPublicId(publicId);
}
