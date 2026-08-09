import { BriefForm } from "@/components/BriefForm";
import type { BlockProps, ContactBlockData, SanityLink } from "@/lib/sanity/block-types";

export function ContactBlock({ block }: BlockProps<ContactBlockData>) {
  const links: SanityLink[] = Array.isArray(block.links) ? block.links : [];

  return (
    // The id is the anchor the CONTACTO nav link points at.
    <section id="contacto" className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-8xl gap-16 px-6 py-28 lg:grid-cols-[1.1fr_1fr] lg:items-center">
        <div>
          {block.eyebrow && (
            <p className="frame-label mb-8 flex items-center gap-3">
              <span className="block h-px w-8 bg-current" />
              {block.eyebrow}
            </p>
          )}

          <h2 className="max-w-[14ch] text-balance text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl">
            {block.heading}{" "}
            {block.headingAccent && (
              <span className="text-accent">{block.headingAccent}</span>
            )}
          </h2>

          {block.description && (
            <p className="mt-8 max-w-[44ch] text-lg leading-relaxed text-muted">
              {block.description}
            </p>
          )}

          {links.length > 0 && (
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-4 text-lg">
              {links.map((link, i) =>
                link.href ? (
                  <a
                    key={i}
                    href={link.href}
                    className="border-b border-line pb-1 transition-colors hover:border-accent hover:text-accent"
                  >
                    {link.label || link.href}
                  </a>
                ) : null
              )}
            </div>
          )}
        </div>

        <BriefForm
          formTitle={block.formTitle}
          interests={block.interests}
          submitLabel={block.submitLabel}
        />
      </div>
    </section>
  );
}
