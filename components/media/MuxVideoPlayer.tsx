"use client";

import { useEffect, useState } from "react";
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
  /**
   * When `autoplayMuted` is on, also autoplay below `lg`.
   * Portada: first clip only. Portafolio clips: all (viewport-lazy, muted).
   */
  allowMobileAutoplay?: boolean;
  /** Decorative muted clips should pass true so playback loops even after a manual play. */
  loop?: boolean;
  /**
   * `true` — never show Mux chrome (Portafolio clips).
   * `false` — always show chrome (Portafolio main video).
   * omitted — hide chrome only while muted autoplay is running (Portada).
   */
  hideControls?: boolean;
  title?: string;
  /** When true, fills a sized parent (e.g. portfolio clip tiles) instead of enforcing 16:9. */
  fillContainer?: boolean;
  posterVariant?: CloudinaryVariant;
};

const LG_MIN = "(min-width: 1024px)";
const REDUCE_MOTION = "(prefers-reduced-motion: reduce)";

function useMatchMedia(query: string, initial = false): boolean {
  const [matches, setMatches] = useState(initial);

  useEffect(() => {
    const mq = window.matchMedia(query);
    const update = () => setMatches(mq.matches);
    update();
    mq.addEventListener("change", update);
    return () => mq.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/**
 * Uses Mux's official lazy player (`loading="viewport"`) so HLS only loads when
 * the clip nears the viewport. Cloudinary posters serve as placeholders — no
 * image.mux.com requests. `capRenditionToPlayerSize` keeps delivery minutes
 * down on smaller viewports (free-tier delivery budget).
 *
 * `fillContainer` uses `object-fit: cover` so tiles match CloudinaryImage;
 * editorial 16:9 shells keep `contain`.
 */
export function MuxVideoPlayer({
  playbackId,
  status = "ready",
  poster,
  autoplayMuted = false,
  allowMobileAutoplay = false,
  loop,
  hideControls,
  title,
  fillContainer = false,
  posterVariant = "hero",
}: Props) {
  // Assume reduced motion until matchMedia runs so autoplay never flashes on.
  const reducedMotion = useMatchMedia(REDUCE_MOTION, true);
  const isDesktop = useMatchMedia(LG_MIN);
  const shouldAutoplay =
    autoplayMuted && !reducedMotion && (isDesktop || allowMobileAutoplay);
  const shouldLoop = loop ?? shouldAutoplay;
  const chromeHidden = hideControls === false ? false : hideControls === true || shouldAutoplay;

  const placeholder = poster
    ? cloudinaryImageUrl(poster.publicId, posterVariant)
    : undefined;

  const shellClass = fillContainer
    ? "relative h-full w-full min-h-0 overflow-hidden bg-card"
    : "relative aspect-video w-full overflow-hidden bg-card";

  if (status === "errored") {
    return (
      <div className={`${shellClass} flex items-center justify-center`}>
        <p className="frame-label text-muted">Video unavailable</p>
      </div>
    );
  }

  if (status === "preparing") {
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
    <div className={shellClass} aria-hidden={chromeHidden || undefined}>
      <MuxPlayer
        loading="viewport"
        playbackId={playbackId}
        streamType="on-demand"
        placeholder={placeholder}
        autoPlay={shouldAutoplay ? "muted" : false}
        muted={autoplayMuted}
        loop={shouldLoop}
        playsInline
        preload="none"
        nohotkeys={chromeHidden}
        defaultHiddenCaptions={autoplayMuted || chromeHidden}
        accentColor="#A9793B"
        capRenditionToPlayerSize
        metadata={title ? { video_title: title } : undefined}
        style={{
          height: "100%",
          width: "100%",
          "--media-object-fit": fillContainer ? "cover" : "contain",
          ...(chromeHidden ? { "--controls": "none" } : {}),
        }}
      />
    </div>
  );
}
