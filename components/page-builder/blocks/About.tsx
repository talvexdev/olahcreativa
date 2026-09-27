import { resolveSectionId } from "@/lib/page-builder/anchors";
import type { BlockProps, AboutBlockData } from "@/lib/sanity/block-types";

/**
 * Quiénes somos — copy + circular brand mark.
 * Uses theme tokens so light/dark stay consistent with the rest of the site.
 */
export function AboutBlock({ block }: BlockProps<AboutBlockData>) {
  if (!block.heading) return null;

  const paragraphs = Array.isArray(block.paragraphs)
    ? block.paragraphs.filter((p): p is string => typeof p === "string" && p.trim().length > 0)
    : [];

  const brand = block.brandMark?.trim() || "Olah";
  const brandAccent = block.brandMarkAccent ?? ".";
  const brandSubtitle = block.brandMarkSubtitle?.trim();
  const sectionId = resolveSectionId({
    anchorId: block.anchorId,
    fallback: "nosotros",
  });

  return (
    <section
      id={sectionId}
      className="border-t border-line bg-surface"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto grid max-w-8xl items-center gap-10 px-6 py-8 sm:gap-12 sm:py-10 lg:grid-cols-[1.15fr_1fr] lg:gap-20 lg:py-14">
        <div>
          {block.eyebrow && (
            <p className="frame-label mb-6 flex items-center gap-3 sm:mb-8">
              <span className="block h-px w-8 bg-current" />
              {block.eyebrow}
            </p>
          )}

          <h2
            id="about-heading"
            className="max-w-[16ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {block.heading}{" "}
            {block.headingAccent && (
              <span className="text-accent">{block.headingAccent}</span>
            )}
          </h2>

          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={`max-w-[54ch] text-base leading-relaxed text-muted sm:text-lg ${i === 0 ? "mt-9" : "mt-5"}`}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex justify-center lg:justify-end">
          <div
            className="@container grid aspect-square w-64 place-items-center rounded-full bg-wash px-6 sm:w-80 sm:px-8 md:w-96 lg:w-full lg:max-w-md lg:px-10 xl:max-w-lg"
            aria-hidden={!(brand || brandSubtitle)}
          >
            <div className="text-center">
              <p className="font-display text-[clamp(2.25rem,22cqi,6.5rem)] font-bold leading-[0.9] tracking-[-0.05em] text-fg">
                {brand}
                {brandAccent ? <span className="text-accent">{brandAccent}</span> : null}
              </p>
              {brandSubtitle && (
                <p className="mt-2 font-display text-[clamp(1rem,8cqi,2rem)] font-light tracking-wide text-fg">
                  {brandSubtitle}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
