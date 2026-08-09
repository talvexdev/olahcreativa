import Link from "next/link";

import type { BlockProps, WorkCtaBlockData } from "@/lib/sanity/block-types";

function isHttpHref(href: string) {
  return /^https?:/i.test(href);
}

function isAppPath(href: string) {
  return href.startsWith("/") || href.startsWith("#");
}

const ctaClassName =
  "inline-flex shrink-0 items-center gap-2.5 rounded-full bg-accent px-8 py-4 font-medium text-white transition-transform hover:-translate-y-0.5";

function WorkCtaLink({ href, label }: { href: string; label: string }) {
  if (isHttpHref(href)) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={ctaClassName}>
        {label} <span className="font-mono">→</span>
      </a>
    );
  }

  // mailto:/tel: stay same-tab; internal paths use Next Link.
  if (!isAppPath(href)) {
    return (
      <a href={href} className={ctaClassName}>
        {label} <span className="font-mono">→</span>
      </a>
    );
  }

  return (
    <Link href={href} className={ctaClassName}>
      {label} <span className="font-mono">→</span>
    </Link>
  );
}

/**
 * Full-width work CTA banner — bordered row with copy + solid button.
 * Theme tokens only so light/dark stay consistent with the rest of the site.
 *
 * Sits in the reduced gap between Servicios (`pb-12`) and Proceso (`pt-12`).
 * Do not use negative margins — they overlap neighbors and break hash scroll.
 */
export function WorkCtaBlock({ block }: BlockProps<WorkCtaBlockData>) {
  if (!block.heading) return null;

  const href = block.cta?.href?.trim();
  const label = block.cta?.label?.trim();

  return (
    <section
      className="mx-auto max-w-8xl px-6"
      aria-labelledby="work-cta-heading"
    >
      <div className="flex flex-col items-start justify-between gap-6 rounded-2xl border border-line bg-card p-7 sm:gap-8 sm:p-9 lg:flex-row lg:items-center lg:gap-10">
        <div className="min-w-0 flex-1">
          <h2
            id="work-cta-heading"
            className="max-w-[28ch] text-balance text-2xl font-semibold tracking-tight sm:text-3xl"
          >
            {block.heading}
          </h2>
          {block.description && (
            <p className="mt-3 max-w-[62ch] text-base leading-relaxed text-muted">
              {block.description}
            </p>
          )}
        </div>

        {href && label ? <WorkCtaLink href={href} label={label} /> : null}
      </div>
    </section>
  );
}
