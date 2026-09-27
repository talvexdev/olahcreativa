"use client";

import { useEffect, useRef, useState } from "react";

import {
  cloudinaryVideoPosterUrl,
  cloudinaryVideoUrl,
  type CloudinaryVideoVariant,
} from "@/lib/cloudinary";

type Props = {
  publicId: string;
  alt: string;
  sourceWidth?: number;
  autoplayMuted?: boolean;
  /**
   * When `autoplayMuted` is on, also autoplay below `lg`.
   * Portada: first clip only. Portafolio clips: all (viewport-lazy, muted).
   */
  allowMobileAutoplay?: boolean;
  /** Decorative muted clips should pass true so playback loops even after a manual play. */
  loop?: boolean;
  /**
   * `true` — never show controls (Portafolio clips).
   * `false` — always show controls (Portafolio main video).
   * omitted — hide controls only while muted autoplay is running (Portada).
   */
  hideControls?: boolean;
  /** When true, fills a sized parent (clip tiles) with `object-cover`. Editorial 16:9 uses `contain`. */
  fillContainer?: boolean;
  variant?: CloudinaryVideoVariant;
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
 * Native `<video>` for a Cloudinary MP4. The file is requested only once the
 * shell nears the viewport. Decorative clips that must not autoplay (reduced
 * motion, or Portada below `lg`) stay on the poster still and never fetch video.
 */
export function CloudinaryVideo({
  publicId,
  alt,
  sourceWidth,
  autoplayMuted = false,
  allowMobileAutoplay = false,
  loop,
  hideControls,
  fillContainer = false,
  variant = "film",
}: Props) {
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [near, setNear] = useState(false);
  const [seen, setSeen] = useState(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  const reducedMotion = useMatchMedia(REDUCE_MOTION, true);
  const isDesktop = useMatchMedia(LG_MIN);
  const shouldAutoplay = autoplayMuted && !reducedMotion && (isDesktop || allowMobileAutoplay);
  const shouldLoop = loop ?? shouldAutoplay;
  const chromeHidden =
    !autoplayBlocked && (hideControls === false ? false : hideControls === true || shouldAutoplay);
  const suppressVideo = hideControls === true && !shouldAutoplay && !autoplayBlocked;
  const showVideo = seen && !suppressVideo;

  const src = cloudinaryVideoUrl(publicId, variant, sourceWidth);
  const poster = cloudinaryVideoPosterUrl(publicId, variant, sourceWidth);

  useEffect(() => {
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        const hitting = Boolean(entry?.isIntersecting);
        setNear(hitting);
        if (hitting) setSeen(true);
      },
      { rootMargin: "200px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const node = videoRef.current;
    if (!node || !showVideo) return;

    // React's muted prop is not enough for autoplay in every browser.
    node.muted = Boolean(autoplayMuted || shouldAutoplay);

    if (near && shouldAutoplay && !autoplayBlocked) {
      void node.play().catch(() => setAutoplayBlocked(true));
      return;
    }

    if (!near || reducedMotion) node.pause();
  }, [showVideo, near, shouldAutoplay, autoplayBlocked, autoplayMuted, reducedMotion, src]);

  const shellClass = fillContainer
    ? "relative h-full w-full min-h-0 overflow-hidden bg-card"
    : "relative aspect-video w-full overflow-hidden bg-card";
  const fitClass = `h-full w-full ${fillContainer ? "object-cover" : "object-contain"}`;

  return (
    <div ref={rootRef} className={shellClass} aria-hidden={chromeHidden || undefined}>
      {showVideo ? (
        <video
          ref={videoRef}
          className={fitClass}
          src={src}
          poster={poster}
          aria-label={chromeHidden ? undefined : alt}
          autoPlay={shouldAutoplay}
          muted={autoplayMuted || shouldAutoplay}
          loop={shouldLoop}
          playsInline
          preload="none"
          controls={!chromeHidden}
        />
      ) : (
        // Poster is already one Cloudinary JPEG; next/image would request another derivative.
        // eslint-disable-next-line @next/next/no-img-element
        <img src={poster} alt={chromeHidden ? "" : alt} className={fitClass} loading="lazy" />
      )}
    </div>
  );
}
