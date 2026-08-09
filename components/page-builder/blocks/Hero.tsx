import Link from "next/link";

import { CloudinaryImage } from "@/components/media/cloudinary";
import { MuxVideoPlayer } from "@/components/media/MuxVideoPlayer";
import { hasCloudinaryAsset, toCloudinaryPoster } from "@/lib/cloudinary";
import { normalizeHeroShowcase, type HeroShowcaseClip } from "@/lib/page-builder/hero";
import type { BlockProps, HeroBlockData } from "@/lib/sanity/block-types";

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
        <p className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-full bg-bg/70 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-fg backdrop-blur">
          {clip.label}
        </p>
      )}
    </div>
  );
}

function HighlightCard({
  eyebrow,
  heading,
  description,
  className = "",
}: {
  eyebrow?: string;
  heading?: string;
  description?: string;
  className?: string;
}) {
  return (
    <div
      className={`flex min-h-40 flex-col justify-between rounded-2xl border border-line bg-card p-5 sm:min-h-0 ${className}`}
    >
      {eyebrow && (
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted">{eyebrow}</p>
      )}
      <div>
        {heading && (
          <p className="font-display text-3xl font-semibold leading-none tracking-tight sm:text-4xl">
            {heading}
          </p>
        )}
        {description && (
          <p className="mt-2 text-sm leading-relaxed text-muted">{description}</p>
        )}
      </div>
    </div>
  );
}

function HeroShowcase({ block }: { block: HeroBlockData }) {
  const showcase = normalizeHeroShowcase(block);
  if (!showcase) return null;

  const [primary, secondary, tertiary] = showcase.clips;
  const hasHighlight = Boolean(
    showcase.highlightEyebrow || showcase.highlightHeading || showcase.highlightDescription,
  );

  if (!primary && !secondary && !tertiary && hasHighlight) {
    return (
      <div className="mt-16 max-w-md">
        <HighlightCard
          eyebrow={showcase.highlightEyebrow}
          heading={showcase.highlightHeading}
          description={showcase.highlightDescription}
        />
      </div>
    );
  }

  const hasSide = Boolean(tertiary || hasHighlight);
  // Count only occupied tracks so partial showcases don't leave empty columns.
  const columnCount =
    (primary ? 1 : 0) + (secondary ? 1 : 0) + (hasSide ? 1 : 0);
  const gridCols =
    columnCount >= 3
      ? "lg:grid-cols-[2.2fr_1fr_1fr]"
      : columnCount === 2
        ? "lg:grid-cols-[2fr_1fr]"
        : "lg:grid-cols-1";

  return (
    <div className={`mt-16 grid gap-3.5 lg:h-[min(440px,50vh)] ${gridCols}`}>
      {primary ? (
        <ShowcaseMedia clip={primary} className="aspect-video lg:aspect-auto lg:h-full" />
      ) : null}

      {secondary ? (
        <ShowcaseMedia clip={secondary} className="aspect-video lg:aspect-auto lg:h-full" />
      ) : null}

      {hasSide ? (
        <div
          className={`grid gap-3.5 sm:grid-cols-2 lg:grid-cols-1 ${
            tertiary && hasHighlight ? "lg:grid-rows-2" : ""
          }`}
        >
          {tertiary ? (
            <ShowcaseMedia clip={tertiary} className="aspect-video lg:aspect-auto lg:h-full" />
          ) : null}

          {hasHighlight ? (
            <HighlightCard
              eyebrow={showcase.highlightEyebrow}
              heading={showcase.highlightHeading}
              description={showcase.highlightDescription}
              className={!tertiary ? "lg:h-full" : ""}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function HeroBlock({ block }: BlockProps<HeroBlockData>) {
  if (!block.heading) return null;

  return (
    <section className="relative mx-auto max-w-8xl px-6 pb-24 pt-32">
      <div
        aria-hidden
        className="pointer-events-none absolute -right-36 -top-32 -z-10 h-155 w-155 rounded-full bg-wash blur-2xl"
      />

      {block.eyebrow && (
        <p className="frame-label mb-10 flex items-center gap-3">
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

      <div className="mt-16 flex flex-wrap items-end justify-between gap-12">
        {block.description && (
          <p className="max-w-[46ch] text-lg leading-relaxed text-muted">
            {block.description}
          </p>
        )}

        <div className="flex flex-wrap gap-3.5">
          {block.ctaPrimary?.href && (
            <Link
              href={block.ctaPrimary.href}
              className="inline-flex items-center gap-2.5 rounded-full bg-accent px-8 py-4 font-medium text-white transition-transform hover:-translate-y-0.5"
            >
              {block.ctaPrimary.label} <span className="font-mono">→</span>
            </Link>
          )}
          {block.ctaSecondary?.href && (
            <Link
              href={block.ctaSecondary.href}
              className="inline-flex items-center rounded-full border border-fg/25 px-8 py-4 font-medium transition-colors hover:border-fg"
            >
              {block.ctaSecondary.label}
            </Link>
          )}
        </div>
      </div>

      <HeroShowcase block={block} />
    </section>
  );
}
