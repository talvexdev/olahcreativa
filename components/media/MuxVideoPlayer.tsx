"use client";

import MuxPlayer from "@mux/mux-player-react/lazy";

import { CloudinaryImage } from "@/components/media/cloudinary";
import {
  cloudinaryImageUrl,
  type CloudinaryPoster,
  type CloudinaryVariant,
} from "@/lib/cloudinary";

type MuxAssetStatus = "preparing" | "ready" | "errored";

type Props = {
  playbackId: string;
  status?: MuxAssetStatus;
  poster?: CloudinaryPoster | null;
  autoplayMuted?: boolean;
  title?: string;
  /** When true, fills a sized parent (e.g. portfolio clip tiles) instead of enforcing 16:9. */
  fillContainer?: boolean;
  posterVariant?: CloudinaryVariant;
};

/**
 * Uses Mux's official lazy player (`loading="viewport"`) so HLS only loads when
 * the clip nears the viewport. Cloudinary posters serve as placeholders — no
 * image.mux.com requests. `capRenditionToPlayerSize` keeps delivery minutes
 * down on smaller viewports (free-tier delivery budget).
 */
export function MuxVideoPlayer({
  playbackId,
  status = "ready",
  poster,
  autoplayMuted = false,
  title,
  fillContainer = false,
  posterVariant = "hero",
}: Props) {
  const placeholder = poster
    ? cloudinaryImageUrl(poster.publicId, posterVariant)
    : undefined;

  const shellClass = fillContainer
    ? "relative h-full w-full overflow-hidden bg-card"
    : "relative aspect-video w-full overflow-hidden bg-card";

  if (status === "errored") {
    return (
      <div className={`${shellClass} flex items-center justify-center`}>
        <p className="frame-label text-muted">Video unavailable</p>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className={shellClass}>
        {poster ? (
          <CloudinaryImage image={poster} variant={posterVariant} />
        ) : (
          <div className="h-full w-full bg-card" aria-hidden />
        )}
        <p className="frame-label absolute bottom-4 left-6 text-muted">Processing video…</p>
      </div>
    );
  }

  return (
    <div className={shellClass}>
      <MuxPlayer
        loading="viewport"
        playbackId={playbackId}
        streamType="on-demand"
        placeholder={placeholder}
        autoPlay={autoplayMuted ? "muted" : false}
        muted={autoplayMuted}
        loop={autoplayMuted}
        playsInline
        preload="none"
        defaultHiddenCaptions={false}
        accentColor="#A9793B"
        capRenditionToPlayerSize
        metadata={title ? { video_title: title } : undefined}
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}
