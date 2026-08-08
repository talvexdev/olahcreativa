/**
 * Reads Mux asset IDs from Sanity document shapes (webhook/history payloads).
 * Used by the media-cleanup tombstone pipeline.
 *
 * @see sanity-plugin-mux-input — `muxVideo.asset` is usually a reference to
 * `mux.videoAsset`, which stores the Mux API `assetId`.
 */

/** Mux API asset ID from an expanded `mux.videoAsset` or projected GROQ field. */
export function getMuxAssetId(obj: unknown): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;

  const video = obj as Record<string, unknown>;
  const asset = video.asset as Record<string, unknown> | undefined;
  if (!asset) return undefined;

  if (typeof asset.assetId === "string" && asset.assetId) {
    return asset.assetId;
  }

  const data = asset.data as Record<string, unknown> | undefined;
  if (typeof data?.id === "string" && data.id) {
    return data.id;
  }

  return undefined;
}

/** Sanity document `_id` / `_ref` for an unresolved `mux.videoAsset` reference. */
export function getMuxVideoAssetDocumentId(obj: unknown): string | undefined {
  if (!obj || typeof obj !== "object") return undefined;

  const asset = (obj as Record<string, unknown>).asset as Record<string, unknown> | undefined;
  if (!asset) return undefined;

  if (typeof asset._ref === "string" && asset._ref) {
    return asset._ref;
  }

  if (asset._type === "mux.videoAsset" && typeof asset._id === "string" && asset._id) {
    return asset._id;
  }

  return undefined;
}

export function walkSanityMuxVideo(
  obj: unknown,
  handlers: {
    onAssetId: (assetId: string) => void;
    onUnresolvedRef?: (documentId: string) => void;
  }
): void {
  const assetId = getMuxAssetId(obj);
  if (assetId) {
    handlers.onAssetId(assetId);
    return;
  }

  const documentId = getMuxVideoAssetDocumentId(obj);
  if (documentId) {
    handlers.onUnresolvedRef?.(documentId);
  }
}
