import { walkSanityCloudinaryImage } from "@/lib/cloudinary/extract";

export type MediaAsset = {
  provider: "cloudinary";
  assetId: string;
};

type MediaAssetWithSource = MediaAsset & { sourceDocumentTitle: string };

/**
 * Walks known document shapes (project, page, siteSettings, pageBuilder blocks)
 * and collects Cloudinary public_id values for tombstone creation.
 */
export function extractMediaAssets(
  doc: Record<string, unknown>,
  sourceDocumentTitle: string
): MediaAssetWithSource[] {
  const assets: MediaAssetWithSource[] = [];
  const seen = new Set<string>();

  function add(assetId: string | undefined) {
    if (!assetId) return;
    const key = `cloudinary:${assetId}`;
    if (seen.has(key)) return;
    seen.add(key);
    assets.push({ provider: "cloudinary", assetId, sourceDocumentTitle });
  }

  function walkCloudinaryImage(obj: unknown) {
    walkSanityCloudinaryImage(obj, add);
  }

  function walkPageBuilder(blocks: unknown) {
    if (!Array.isArray(blocks)) return;
    for (const block of blocks) {
      if (!block || typeof block !== "object") continue;
      const b = block as Record<string, unknown>;
      if (b._type === "heroBlock") {
        const clips = b.showcaseClips as unknown[];
        clips?.forEach((clip) => {
          if (!clip || typeof clip !== "object") return;
          const c = clip as Record<string, unknown>;
          walkCloudinaryImage(c.video);
          walkCloudinaryImage(c.image);
        });
      }
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
          walkCloudinaryImage(p.heroVideo);
          const clips = p.clips as unknown[];
          clips?.forEach((clip) => {
            if (clip && typeof clip === "object") {
              const c = clip as Record<string, unknown>;
              walkCloudinaryImage(c.video);
              walkCloudinaryImage(c.image);
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
      if (m._type === "cloudinaryImage" || m._type === "cloudinaryVideo") walkCloudinaryImage(m);
    }
  }

  // Page fields
  walkCloudinaryImage(doc.seoImage);
  walkPageBuilder(doc.pageBuilder);

  // Site settings (singleton)
  walkCloudinaryImage(doc.logo);
  walkCloudinaryImage(doc.defaultSeoImage);

  return assets;
}

/** Returns assets in `oldDoc` that are not present in `newDoc`. */
export function diffRemovedMedia(
  oldDoc: Record<string, unknown>,
  newDoc: Record<string, unknown>,
  sourceDocumentTitle: string
): MediaAssetWithSource[] {
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
