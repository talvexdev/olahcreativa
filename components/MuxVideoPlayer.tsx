"use client";

import { useEffect, useRef, useState } from "react";
import MuxPlayer from "@mux/mux-player-react";
import { CloudinaryPhoto } from "./CloudinaryPhoto";

type Props = {
  playbackId: string;
  poster?: { publicId: string; alt: string } | null;
  autoplayMuted?: boolean;
};

/**
 * Lazy-mounted: the player (and its HLS manifest request) is only created
 * once the component nears the viewport — a still poster renders until then.
 * This is the design decision that keeps Mux delivered-minutes tied to real
 * engagement rather than page-load, per the free-tier architecture.
 */
export function MuxVideoPlayer({ playbackId, poster, autoplayMuted = false }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: "200px" }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="relative aspect-video w-full overflow-hidden bg-ink">
      {inView ? (
        <MuxPlayer
          playbackId={playbackId}
          streamType="on-demand"
          autoPlay={autoplayMuted ? "muted" : false}
          muted={autoplayMuted}
          loop={autoplayMuted}
          playsInline
          defaultHiddenCaptions={false}
          accentColor="#A9793B"
          style={{ height: "100%", width: "100%" }}
        />
      ) : poster ? (
        <CloudinaryPhoto publicId={poster.publicId} alt={poster.alt} variant="hero" />
      ) : (
        <div className="h-full w-full bg-moss/30" aria-hidden />
      )}
    </div>
  );
}
