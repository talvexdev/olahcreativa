import Link from "next/link";

import type { BlockProps, CtaBlockData } from "@/lib/sanity/block-types";

export function CtaBlock({ block }: BlockProps<CtaBlockData>) {
  return (
    <section className="mx-auto max-w-8xl px-6 py-24 text-center">
      <h2 className="font-display text-3xl text-fg sm:text-4xl">{block.heading}</h2>
      {block.buttonHref && (
        <Link
          href={block.buttonHref}
          className="mt-8 inline-block border border-accent px-8 py-3 frame-label text-accent transition-colors hover:bg-accent hover:text-white"
        >
          {block.buttonLabel || "Get in touch"}
        </Link>
      )}
    </section>
  );
}
