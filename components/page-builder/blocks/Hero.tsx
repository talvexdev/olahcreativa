import Link from "next/link";

import { CloudinaryImage } from "@/components/media/cloudinary";
import { MuxVideoPlayer } from "@/components/media/MuxVideoPlayer";
import { hasCloudinaryAsset, toCloudinaryPoster } from "@/lib/cloudinary";
import { normalizeHeroShowcase, type HeroShowcaseClip } from "@/lib/page-builder/hero";
import type { BlockProps, HeroBlockData } from "@/lib/sanity/block-types";

/**
 * Portada fills the first viewport and sits *under* the sticky header:
 * pull up by `--site-header-height` so `#portada` starts at y = 0, then pad
 * content so it isn’t hidden under the bar. `100dvh` tracks mobile chrome;
 * `100vh` is the fallback where `dvh` isn’t supported.
 */
const HERO_SHELL = [
  "-mt-[var(--site-header-height)]",
  "min-h-[100vh] min-h-[100dvh]",
  "scroll-mt-0",
].join(" ");

/** Floor so leftover-fill at `lg` cannot shrink tiles to a cropped strip. */
const TILE_FLOOR = "min-h-[12.5rem] lg:min-h-[16rem]";
const TILE_GROW = "aspect-video w-full lg:aspect-auto lg:h-full";

const SIZES_FULL = "100vw";
const SIZES_SPLIT_MD = "(max-width: 767px) 100vw, 50vw";
const SIZES_PRIMARY_3 = "(max-width: 1023px) 100vw, 50vw";
const SIZES_SIDE_3 = "(max-width: 767px) 100vw, (max-width: 1023px) 50vw, 25vw";

function ShowcaseMedia({
  clip,
  className = "",
  sizes,
  allowMobileAutoplay = false,
}: {
  clip: HeroShowcaseClip;
  className?: string;
  sizes: string;
  allowMobileAutoplay?: boolean;
}) {
  return (
    <div className={`relative ${TILE_FLOOR} overflow-hidden rounded-2xl bg-card ${className}`}>
      {clip.video?.playbackId ? (
        <MuxVideoPlayer
          playbackId={clip.video.playbackId}
          status={clip.video.status}
          poster={toCloudinaryPoster(clip.video.poster)}
          autoplayMuted={clip.video.autoplayMuted ?? true}
          allowMobileAutoplay={allowMobileAutoplay}
          fillContainer
          posterVariant="grid"
          title={clip.label}
        />
      ) : hasCloudinaryAsset(clip.image) ? (
        <CloudinaryImage
          image={clip.image!}
          variant="grid"
          sizes={sizes}
          className="h-full w-full object-cover"
        />
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

  const primarySizes =
    columnCount >= 3 ? SIZES_PRIMARY_3 : columnCount === 2 ? SIZES_SPLIT_MD : SIZES_FULL;
  const sideSizes = columnCount >= 3 ? SIZES_SIDE_3 : SIZES_SPLIT_MD;

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
          sizes={primarySizes}
          allowMobileAutoplay
          className={[
            TILE_GROW,
            columnCount >= 3 ? "md:col-span-2 lg:col-span-1" : "",
          ].join(" ")}
        />
      ) : null}
      {secondary ? (
        <ShowcaseMedia clip={secondary} sizes={sideSizes} className={TILE_GROW} />
      ) : null}
      {tertiary ? (
        <ShowcaseMedia clip={tertiary} sizes={sideSizes} className={TILE_GROW} />
      ) : null}
    </div>
  );
}

export function HeroBlock({ block }: BlockProps<HeroBlockData>) {
  if (!block.heading) return null;

  const showcase = normalizeHeroShowcase(block);

  return (
    <section
      id="portada"
      className={[
        "relative mx-auto flex w-full max-w-8xl flex-col px-6",
        HERO_SHELL,
        // Grow past the fold if mobile + media would overflow (min-height, not fixed height).
        // Top padding includes the sticky header so copy sits below it.
        showcase
          ? "justify-center gap-8 pb-10 pt-[calc(var(--site-header-height)+2.5rem)] sm:gap-10 sm:pb-12 sm:pt-[calc(var(--site-header-height)+3rem)] lg:justify-between lg:gap-12 lg:pb-16 lg:pt-[calc(var(--site-header-height)+4rem)]"
          : "justify-center gap-8 pb-12 pt-[calc(var(--site-header-height)+3rem)] sm:gap-10 sm:pb-16 sm:pt-[calc(var(--site-header-height)+4rem)] lg:pb-20 lg:pt-[calc(var(--site-header-height)+5rem)]",
      ].join(" ")}
    >
      {/* Leftover CMS hash `/#inicio` lands on the same Portada module. */}
      <div
        id="inicio"
        aria-hidden="true"
        className="pointer-events-none absolute top-0 h-0 w-0 overflow-hidden"
      />
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
