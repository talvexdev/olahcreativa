import { BriefForm } from "@/components/forms/BriefForm";
import { resolveSectionId } from "@/lib/page-builder/anchors";
import type { BlockProps, ContactBlockData, SanityLink } from "@/lib/sanity/block-types";

export function ContactBlock({ block }: BlockProps<ContactBlockData>) {
  const links: SanityLink[] = Array.isArray(block.links) ? block.links : [];
  if (!block.heading) return null;

  const sectionId = resolveSectionId({
    anchorId: block.anchorId,
    fallback: "contacto",
  });

  return (
    <section id={sectionId} className="border-t border-line bg-surface">
      <div className="mx-auto grid max-w-8xl items-start gap-12 px-6 py-28 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:gap-16">
        <div>
          {block.eyebrow && (
            <p className="frame-label mb-8 flex items-center gap-3">
              <span className="block h-px w-8 bg-current" />
              {block.eyebrow}
            </p>
          )}

          <h2 className="max-w-[16ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-[3.5rem]">
            {block.heading}{" "}
            {block.headingAccent && (
              <span className="text-accent">{block.headingAccent}</span>
            )}
          </h2>

          {block.description && (
            <p className="mt-7 max-w-[40ch] text-base leading-relaxed text-muted sm:text-lg">
              {block.description}
            </p>
          )}

          {links.length > 0 && (
            <div className="mt-12 flex flex-col gap-4 sm:mt-14 sm:flex-row sm:flex-wrap sm:items-center sm:gap-x-10 sm:gap-y-4">
              {links.map((link, i) =>
                link.href ? (
                  <a
                    key={i}
                    href={link.href}
                    className="w-fit border-b border-line pb-1 text-base text-fg transition-colors hover:border-accent hover:text-accent"
                    {...(link.href.startsWith("http")
                      ? { target: "_blank", rel: "noreferrer" }
                      : {})}
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
