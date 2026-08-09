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
  highlightEyebrow?: string;
  highlightHeading?: string;
  highlightDescription?: string;
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

/** Normalizes optional hero media collage + highlight card. */
export function normalizeHeroShowcase(raw: unknown): HeroShowcaseView | null {
  if (!raw || typeof raw !== "object") return null;
  const record = raw as Record<string, unknown>;

  const clips = (Array.isArray(record.showcaseClips) ? record.showcaseClips : [])
    .map(normalizeShowcaseClip)
    .filter((clip): clip is HeroShowcaseClip => clip !== null)
    .slice(0, 3);

  const highlightEyebrow =
    typeof record.highlightEyebrow === "string" ? record.highlightEyebrow : undefined;
  const highlightHeading =
    typeof record.highlightHeading === "string" ? record.highlightHeading : undefined;
  const highlightDescription =
    typeof record.highlightDescription === "string" ? record.highlightDescription : undefined;

  const hasHighlight = Boolean(highlightEyebrow || highlightHeading || highlightDescription);
  if (clips.length === 0 && !hasHighlight) return null;

  return {
    clips,
    highlightEyebrow,
    highlightHeading,
    highlightDescription,
  };
}
