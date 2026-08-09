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

  return (
    <section
      id="nosotros"
      className="border-t border-line bg-surface"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto grid max-w-8xl items-center gap-12 px-6 py-28 lg:grid-cols-[1.15fr_1fr] lg:gap-20">
        <div>
          {block.eyebrow && (
            <p className="frame-label mb-8 flex items-center gap-3">
              <span className="block h-px w-8 bg-current" />
              {block.eyebrow}
            </p>
          )}

          <h2
            id="about-heading"
            className="max-w-[16ch] text-balance text-4xl font-semibold leading-[1.02] tracking-tight sm:text-5xl lg:text-6xl"
          >
            {block.heading}{" "}
            {block.headingAccent && (
              <span className="text-accent">{block.headingAccent}</span>
            )}
          </h2>

          {paragraphs.map((paragraph, i) => (
            <p
              key={i}
              className={`max-w-[54ch] text-lg leading-relaxed text-muted ${i === 0 ? "mt-9" : "mt-5"}`}
            >
              {paragraph}
            </p>
          ))}
        </div>

        <div className="flex justify-center lg:justify-end">
          <div
            className="grid aspect-square w-full max-w-md place-items-center rounded-full bg-wash px-8 sm:max-w-lg"
            aria-hidden={!(brand || brandSubtitle)}
          >
            <div className="text-center">
              <p className="font-display text-[clamp(3.5rem,8vw,8rem)] font-bold leading-[0.9] tracking-[-0.05em] text-fg">
                {brand}
                {brandAccent ? <span className="text-accent">{brandAccent}</span> : null}
              </p>
              {brandSubtitle && (
                <p className="mt-2 font-display text-[clamp(1.25rem,2.4vw,2.375rem)] font-light tracking-wide text-fg">
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
