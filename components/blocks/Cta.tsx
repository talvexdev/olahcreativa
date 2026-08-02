import Link from "next/link";

export function CtaBlock({ block }: { block: any }) {
  return (
    <section className="mx-auto max-w-8xl px-6 py-24 text-center">
      <h2 className="font-display text-3xl text-paper sm:text-4xl">{block.heading}</h2>
      {block.buttonHref && (
        <Link
          href={block.buttonHref}
          className="mt-8 inline-block border border-brass px-8 py-3 frame-label text-brass transition-colors hover:bg-brass hover:text-ink"
        >
          {block.buttonLabel || "Get in touch"}
        </Link>
      )}
    </section>
  );
}
