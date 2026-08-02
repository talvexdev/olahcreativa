export type MediaAsset = {
  provider: "cloudinary" | "mux";
  assetId: string;
};

/**
 * Walks known document shapes (project, page, pageBuilder blocks) and collects
 * Cloudinary public_id values and Mux asset IDs for tombstone creation.
 */
export function extractMediaAssets(
  doc: Record<string, unknown>,
  sourceDocumentTitle: string
): (MediaAsset & { sourceDocumentTitle: string })[] {
  const assets: (MediaAsset & { sourceDocumentTitle: string })[] = [];
  const seen = new Set<string>();

  function add(provider: "cloudinary" | "mux", assetId: string | undefined) {
    if (!assetId) return;
    const key = `${provider}:${assetId}`;
    if (seen.has(key)) return;
    seen.add(key);
    assets.push({ provider, assetId, sourceDocumentTitle });
  }

  function walkCloudinaryImage(obj: unknown) {
    if (!obj || typeof obj !== "object") return;
    const image = obj as Record<string, unknown>;
    const asset = image.asset as Record<string, unknown> | undefined;
    if (asset?.public_id && typeof asset.public_id === "string") {
      add("cloudinary", asset.public_id);
    }
  }

  function walkMuxVideo(obj: unknown) {
    if (!obj || typeof obj !== "object") return;
    const video = obj as Record<string, unknown>;
    const asset = video.asset as Record<string, unknown> | undefined;
    if (asset?.assetId && typeof asset.assetId === "string") {
      add("mux", asset.assetId);
    }
    walkCloudinaryImage(video.poster);
  }

  function walkPageBuilder(blocks: unknown) {
    if (!Array.isArray(blocks)) return;
    for (const block of blocks) {
      if (!block || typeof block !== "object") continue;
      const b = block as Record<string, unknown>;
      if (b._type === "heroBlock") {
        const media = b.media as Record<string, unknown> | undefined;
        walkCloudinaryImage(media?.image);
        walkMuxVideo(media?.video);
      }
      if (b._type === "imageGridBlock") {
        const items = b.items as unknown[];
        items?.forEach(walkCloudinaryImage);
      }
    }
  }

  // Project fields
  walkCloudinaryImage(doc.coverImage);
  walkCloudinaryImage(doc.seoImage);
  if (Array.isArray(doc.media)) {
    for (const item of doc.media) {
      if (!item || typeof item !== "object") continue;
      const m = item as Record<string, unknown>;
      if (m._type === "cloudinaryImage") walkCloudinaryImage(m);
      if (m._type === "muxVideo") walkMuxVideo(m);
    }
  }

  // Page fields
  walkCloudinaryImage(doc.seoImage);
  walkPageBuilder(doc.pageBuilder);

  return assets;
}

/** Returns assets in `oldDoc` that are not present in `newDoc`. */
export function diffRemovedMedia(
  oldDoc: Record<string, unknown>,
  newDoc: Record<string, unknown>,
  sourceDocumentTitle: string
): (MediaAsset & { sourceDocumentTitle: string })[] {
  const oldAssets = extractMediaAssets(oldDoc, sourceDocumentTitle);
  const newKeys = new Set(
    extractMediaAssets(newDoc, sourceDocumentTitle).map((a) => `${a.provider}:${a.assetId}`)
  );
  return oldAssets.filter((a) => !newKeys.has(`${a.provider}:${a.assetId}`));
}

export function tombstoneId(provider: string, assetId: string): string {
  const safe = assetId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 80);
  return `mediaTombstone.${provider}.${safe}`;
}

export function permanentDeleteAfter(): string {
  const d = new Date();
  d.setDate(d.getDate() + 14);
  return d.toISOString();
}
