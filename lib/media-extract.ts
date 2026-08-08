import { walkSanityCloudinaryImage } from "@/lib/cloudinary/extract";
import { walkSanityMuxVideo } from "@/lib/mux/extract";

export type MediaAsset = {
  provider: "cloudinary" | "mux";
  assetId: string;
};

type MediaAssetWithSource = MediaAsset & { sourceDocumentTitle: string };

export type ExtractMediaAssetsOptions = {
  /** Resolves `mux.videoAsset` document IDs to Mux API asset IDs. */
  resolveMuxRefs?: (documentIds: string[]) => Promise<string[]>;
};

/**
 * Walks known document shapes (project, page, siteSettings, pageBuilder blocks)
 * and collects Cloudinary public_id values and Mux asset IDs for tombstone creation.
 */
export async function extractMediaAssets(
  doc: Record<string, unknown>,
  sourceDocumentTitle: string,
  options?: ExtractMediaAssetsOptions
): Promise<MediaAssetWithSource[]> {
  const assets: MediaAssetWithSource[] = [];
  const seen = new Set<string>();
  const muxRefs = new Set<string>();

  function add(provider: "cloudinary" | "mux", assetId: string | undefined) {
    if (!assetId) return;
    const key = `${provider}:${assetId}`;
    if (seen.has(key)) return;
    seen.add(key);
    assets.push({ provider, assetId, sourceDocumentTitle });
  }

  function walkCloudinaryImage(obj: unknown) {
    walkSanityCloudinaryImage(obj, (publicId) => add("cloudinary", publicId));
  }

  function walkMuxVideo(obj: unknown) {
    if (!obj || typeof obj !== "object") return;

    walkSanityMuxVideo(obj, {
      onAssetId: (assetId) => add("mux", assetId),
      onUnresolvedRef: (documentId) => muxRefs.add(documentId),
    });

    walkCloudinaryImage((obj as Record<string, unknown>).poster);
  }

  function walkPageBuilder(blocks: unknown) {
    if (!Array.isArray(blocks)) return;
    for (const block of blocks) {
      if (!block || typeof block !== "object") continue;
      const b = block as Record<string, unknown>;
      if (b._type === "imageGridBlock") {
        const items = b.items as unknown[];
        items?.forEach(walkCloudinaryImage);
      }
      if (b._type === "portfolioBlock") {
        const projects = b.projects as unknown[];
        if (!Array.isArray(projects)) continue;
        for (const project of projects) {
          if (!project || typeof project !== "object") continue;
          const p = project as Record<string, unknown>;
          walkCloudinaryImage(p.heroImage);
          walkMuxVideo(p.heroVideo);
          const clips = p.clips as unknown[];
          clips?.forEach((clip) => {
            if (clip && typeof clip === "object") {
              walkCloudinaryImage((clip as Record<string, unknown>).image);
            }
          });
          const gallery = p.gallery as unknown[];
          gallery?.forEach((photo) => {
            if (!photo || typeof photo !== "object") return;
            walkCloudinaryImage((photo as Record<string, unknown>).image);
          });
        }
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

  // Site settings (singleton)
  walkCloudinaryImage(doc.logo);
  walkCloudinaryImage(doc.defaultSeoImage);

  if (muxRefs.size > 0 && options?.resolveMuxRefs) {
    const resolved = await options.resolveMuxRefs([...muxRefs]);
    for (const assetId of resolved) {
      add("mux", assetId);
    }
  }

  return assets;
}

/** Returns assets in `oldDoc` that are not present in `newDoc`. */
export async function diffRemovedMedia(
  oldDoc: Record<string, unknown>,
  newDoc: Record<string, unknown>,
  sourceDocumentTitle: string,
  options?: ExtractMediaAssetsOptions
): Promise<MediaAssetWithSource[]> {
  const oldAssets = await extractMediaAssets(oldDoc, sourceDocumentTitle, options);
  const newKeys = new Set(
    (await extractMediaAssets(newDoc, sourceDocumentTitle, options)).map(
      (a) => `${a.provider}:${a.assetId}`
    )
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
