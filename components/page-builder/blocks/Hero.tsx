import Link from "next/link";

import { CloudinaryImage } from "@/components/media/cloudinary";
import { MuxVideoPlayer } from "@/components/media/MuxVideoPlayer";
import { hasCloudinaryAsset, toCloudinaryPoster } from "@/lib/cloudinary";
import { normalizeHeroShowcase, type HeroShowcaseClip } from "@/lib/page-builder/hero";
import type { BlockProps, HeroBlockData } from "@/lib/sanity/block-types";

/**
 * Fill the viewport under the sticky header.
 * `--site-header-height` is measured by HeaderShell (nav wrap, mobile/tablet).
 * `100dvh` tracks mobile browser chrome so a leftover strip doesn’t show at the bottom;
 * `100vh` is the fallback where `dvh` isn’t supported.
 */
const HERO_MIN_H = [
  "min-h-[calc(100vh-var(--site-header-height))]",
  "min-h-[calc(100dvh-var(--site-header-height))]",
].join(" ");

function ShowcaseMedia({
  clip,
  className = "",
}: {
  clip: HeroShowcaseClip;
  className?: string;
}) {
  return (
    <div className={`relative min-h-0 overflow-hidden rounded-2xl bg-card ${className}`}>
      {clip.video?.playbackId ? (
        <MuxVideoPlayer
          playbackId={clip.video.playbackId}
          status={clip.video.status}
          poster={toCloudinaryPoster(clip.video.poster)}
          autoplayMuted={clip.video.autoplayMuted ?? true}
          fillContainer
          posterVariant="grid"
          title={clip.label}
        />
      ) : hasCloudinaryAsset(clip.image) ? (
        <CloudinaryImage image={clip.image!} variant="grid" className="h-full w-full object-cover" />
      ) : (
        <div className="absolute inset-0 border border-dashed border-line" />
      )}

      {clip.label && (
        <p className="pointer-events-none absolute bottom-3 left-3 z-10 rounded-full bg-bg/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fg backdrop-blur sm:bottom-4 sm:left-4">
          {clip.label}
        </p>
      )}
    </div>
  );
}

function HeroShowcase({
  clips,
}: {
  clips: NonNullable<ReturnType<typeof normalizeHeroShowcase>>["clips"];
}) {
  const [primary, secondary, tertiary] = clips;
  const columnCount = clips.length;
  const gridCols =
    columnCount >= 3
      ? "md:grid-cols-2 lg:grid-cols-[2.2fr_1fr_1fr]"
      : columnCount === 2
        ? "md:grid-cols-2"
        : "grid-cols-1";

  return (
    <div
      className={[
        "grid w-full min-h-0 gap-3",
        // Mobile/tablet: natural aspect tiles (don’t force a short viewport squeeze)
        "auto-rows-auto",
        // Desktop: fill leftover hero space under the copy
        "lg:flex-1 lg:grid-rows-1 lg:gap-3.5",
        gridCols,
      ].join(" ")}
    >
      {primary ? (
        <ShowcaseMedia
          clip={primary}
          className={[
            "aspect-video w-full",
            columnCount >= 3 ? "md:col-span-2 lg:col-span-1" : "",
            "lg:aspect-auto lg:h-full lg:min-h-0",
          ].join(" ")}
        />
      ) : null}
      {secondary ? (
        <ShowcaseMedia
          clip={secondary}
          className="aspect-video w-full lg:aspect-auto lg:h-full lg:min-h-0"
        />
      ) : null}
      {tertiary ? (
        <ShowcaseMedia
          clip={tertiary}
          className="aspect-video w-full lg:aspect-auto lg:h-full lg:min-h-0"
        />
      ) : null}
    </div>
  );
}

export function HeroBlock({ block }: BlockProps<HeroBlockData>) {
  if (!block.heading) return null;

  const showcase = normalizeHeroShowcase(block);

  return (
    <section
      className={[
        "relative mx-auto flex w-full max-w-8xl flex-col px-6",
        HERO_MIN_H,
        // Grow past the fold if mobile + media would overflow (min-height, not fixed height)
        showcase
          ? "justify-center gap-8 py-10 sm:gap-10 sm:py-12 lg:justify-between lg:gap-12 lg:py-16"
          : "justify-center gap-8 py-12 sm:gap-10 sm:py-16 lg:py-20",
      ].join(" ")}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -right-36 -top-24 -z-10 h-155 w-155 rounded-full bg-wash blur-2xl sm:-top-32"
      />

      <div className="relative z-0 shrink-0">
        {block.eyebrow && (
          <p className="frame-label mb-6 flex items-center gap-3 sm:mb-8 lg:mb-10">
            <span className="block h-px w-8 bg-current" />
            {block.eyebrow}
          </p>
        )}

        <h2 className="text-hero max-w-[15ch] text-balance font-semibold">
          {block.heading}{" "}
          {block.headingAccent && (
            <span className="text-accent">{block.headingAccent}</span>
          )}
        </h2>

        <div className="mt-8 flex flex-col items-start justify-between gap-8 sm:mt-12 sm:gap-10 lg:mt-16 lg:flex-row lg:flex-wrap lg:items-end lg:gap-12">
          {block.description && (
            <p className="max-w-[46ch] text-base leading-relaxed text-muted sm:text-lg">
              {block.description}
            </p>
          )}

          <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:flex-wrap sm:gap-3.5">
            {block.ctaPrimary?.href && (
              <Link
                href={block.ctaPrimary.href}
                className="inline-flex items-center justify-center gap-2.5 rounded-full bg-accent px-8 py-4 font-medium text-white transition-transform hover:-translate-y-0.5"
              >
                {block.ctaPrimary.label} <span className="font-mono">→</span>
              </Link>
            )}
            {block.ctaSecondary?.href && (
              <Link
                href={block.ctaSecondary.href}
                className="inline-flex items-center justify-center rounded-full border border-fg/25 px-8 py-4 font-medium transition-colors hover:border-fg"
              >
                {block.ctaSecondary.label}
              </Link>
            )}
          </div>
        </div>
      </div>

      {showcase ? <HeroShowcase clips={showcase.clips} /> : null}
    </section>
  );
}
