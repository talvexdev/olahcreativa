import { resolveSectionId } from "@/lib/page-builder/anchors";
import type { BlockProps, ServiceItem, ServicesBlockData } from "@/lib/sanity/block-types";

/**
 * How many columns to use on wide screens, given the number of cards.
 *
 * Four is the interesting case: laid out 4-up the cards get too narrow and the
 * descriptions break badly, so they read better as a 2×2 block. Three stays on
 * one row so the services read as one even set.
 */
function columnsFor(count: number) {
  if (count === 4) return 2;
  return Math.min(3, count);
}

/** One card stays a single column. Two or more share a row from `sm`, then `columnsFor` at `lg`. */
function gridClass(count: number) {
  if (count < 2) return "grid-cols-1";
  return "grid-cols-1 sm:grid-cols-2 lg:grid-cols-[repeat(var(--c),minmax(0,1fr))]";
}

export function ServicesBlock({ block }: BlockProps<ServicesBlockData>) {
  const services: ServiceItem[] = Array.isArray(block.services) ? block.services : [];
  if (services.length === 0) return null;

  const columns = columnsFor(services.length);
  const sectionId = resolveSectionId({
    anchorId: block.anchorId,
    fallback: "servicios",
  });

  return (
    // id on the section so hash nav includes top spacing, not just the first text.
    <section id={sectionId} className="mx-auto max-w-8xl px-6 py-8 sm:py-10 lg:py-14">
      {block.eyebrow && (
        <p className="frame-label mb-6 flex items-center gap-3 sm:mb-8">
          <span className="block h-px w-8 bg-current" />
          {block.eyebrow}
        </p>
      )}

      <h2 className="max-w-[20ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
        {block.heading}{" "}
        {block.headingAccent && (
          <span className="text-accent">{block.headingAccent}</span>
        )}
      </h2>

      {/*
        auto-rows-fr keeps every card the same height, and the content is
        top-aligned with a fixed gap rather than pushed to the bottom. With
        descriptions of uneven length that matters: titles then line up across
        a row, and the slack collects at the bottom of a card where it reads as
        breathing room, instead of opening a hole in the middle.
      */}
      <ul
        className={`mt-10 grid gap-5 sm:mt-14 sm:gap-6 lg:mt-16 lg:gap-8 ${gridClass(services.length)}`}
        style={{ "--c": columns } as React.CSSProperties}
      >
        {services.map((service, i) => (
          <li
            key={i}
            className="flex flex-col rounded-2xl border border-line bg-card p-6 transition-colors duration-300 [@media(hover:hover)]:hover:border-accent sm:p-8 lg:min-h-64 lg:p-10"
          >
            <p className="self-start rounded-full border border-accent/40 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              {service.badge || `Plano ${String(i + 1).padStart(2, "0")}`}
            </p>

            <h3 className="mt-4 text-2xl font-semibold tracking-tight">
              {service.title}
            </h3>
            {service.description && (
              <p className="mt-4 max-w-[54ch] text-base leading-relaxed text-muted">
                {service.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
