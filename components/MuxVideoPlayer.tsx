"use client";

import MuxPlayer from "@mux/mux-player-react/lazy";

import { CloudinaryImage } from "@/components/cloudinary";
import {
  cloudinaryImageUrl,
  type CloudinaryPoster,
} from "@/lib/cloudinary";

type MuxAssetStatus = "preparing" | "ready" | "errored";

type Props = {
  playbackId: string;
  status?: MuxAssetStatus;
  poster?: CloudinaryPoster | null;
  autoplayMuted?: boolean;
  title?: string;
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
}: Props) {
  const placeholder = poster ? cloudinaryImageUrl(poster.publicId, "hero") : undefined;

  if (status === "errored") {
    return (
      <div className="relative flex aspect-video w-full items-center justify-center overflow-hidden bg-card">
        <p className="frame-label text-muted">Video unavailable</p>
      </div>
    );
  }

  if (status !== "ready") {
    return (
      <div className="relative aspect-video w-full overflow-hidden bg-card">
        {poster ? (
          <CloudinaryImage image={poster} variant="hero" />
        ) : (
          <div className="h-full w-full bg-card" aria-hidden />
        )}
        <p className="frame-label absolute bottom-4 left-6 text-muted">Processing video…</p>
      </div>
    );
  }

  return (
    <div className="relative aspect-video w-full overflow-hidden bg-card">
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
