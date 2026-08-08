import Link from "next/link";

import type { BlockProps, HeroBlockData } from "@/lib/sanity/block-types";

export function HeroBlock({ block }: BlockProps<HeroBlockData>) {
  return (
    <section className="relative mx-auto max-w-8xl px-6 pb-24 pt-32">
      {/* Soft red bloom from the design — decorative only. */}
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
    </section>
  );
}
