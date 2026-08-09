import { normalizeCloudinaryImage } from "@/lib/cloudinary";
import type { SanityCloudinaryImage } from "@/lib/cloudinary";

export type ProjectedMuxVideo = {
  playbackId: string;
  status?: "preparing" | "ready" | "errored";
  poster?: SanityCloudinaryImage;
  caption?: string;
  autoplayMuted?: boolean;
};

const MUX_STATUSES = new Set<ProjectedMuxVideo["status"]>(["preparing", "ready", "errored"]);

function normalizeMuxStatus(raw: unknown): ProjectedMuxVideo["status"] | undefined {
  if (typeof raw !== "string") return undefined;
  return MUX_STATUSES.has(raw as ProjectedMuxVideo["status"])
    ? (raw as ProjectedMuxVideo["status"])
    : undefined;
}

/** Normalizes a GROQ `muxVideoProjection` result (or nested heroVideo field). */
export function normalizeProjectedMuxVideo(raw: unknown): ProjectedMuxVideo | undefined {
  if (!raw || typeof raw !== "object") return undefined;

  const record = raw as Record<string, unknown>;
  if (typeof record.playbackId !== "string" || !record.playbackId) return undefined;

  return {
    playbackId: record.playbackId,
    status: normalizeMuxStatus(record.status),
    poster: normalizeCloudinaryImage(record.poster) ?? undefined,
    caption: typeof record.caption === "string" ? record.caption : undefined,
    autoplayMuted:
      typeof record.autoplayMuted === "boolean" ? record.autoplayMuted : undefined,
  };
}
