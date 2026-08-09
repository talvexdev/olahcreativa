import { normalizeCloudinaryImage } from "@/lib/cloudinary";
import type { SanityCloudinaryImage } from "@/lib/cloudinary";

import { normalizeProjectedMuxVideo, type ProjectedMuxVideo } from "./mux-video";

export type HeroShowcaseClip = {
  label?: string;
  video?: ProjectedMuxVideo;
  image?: SanityCloudinaryImage;
};

export type HeroShowcaseView = {
  clips: HeroShowcaseClip[];
};

function normalizeShowcaseClip(raw: unknown): HeroShowcaseClip | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;
  const video = normalizeProjectedMuxVideo(record.video);
  const image = normalizeCloudinaryImage(record.image) ?? undefined;

  if (!video?.playbackId && !image) return null;

  return {
    label: typeof record.label === "string" ? record.label : undefined,
    video,
    image,
  };
}

/** Normalizes optional hero media collage (up to 3 clips). */
export function normalizeHeroShowcase(raw: unknown): HeroShowcaseView | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;

  const clips = (Array.isArray(record.showcaseClips) ? record.showcaseClips : [])
    .map(normalizeShowcaseClip)
    .filter((clip): clip is HeroShowcaseClip => clip !== null)
    .slice(0, 3);

  if (clips.length === 0) return null;

  return { clips };
}
