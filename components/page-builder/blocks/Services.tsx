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

export function ServicesBlock({ block }: BlockProps<ServicesBlockData>) {
  const services: ServiceItem[] = Array.isArray(block.services) ? block.services : [];
  if (services.length === 0) return null;

  const columns = columnsFor(services.length);

  return (
    <section className="mx-auto max-w-8xl px-6 py-28">
      {block.eyebrow && (
        <p className="frame-label mb-8 flex items-center gap-3">
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
        className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-[repeat(var(--c),minmax(0,1fr))]"
        style={{ "--c": columns } as React.CSSProperties}
      >
        {services.map((service, i) => (
          <li
            key={i}
            className="flex flex-col rounded-2xl border border-line bg-card p-8 transition-colors duration-300 hover:border-accent lg:min-h-64"
          >
            <p className="self-start rounded-full border border-accent/40 px-4 py-1.5 font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
              {service.badge || `Plano ${String(i + 1).padStart(2, "0")}`}
            </p>

            <h3 className="mt-14 text-2xl font-semibold tracking-tight">
              {service.title}
            </h3>
            {service.description && (
              <p className="mt-4 max-w-[54ch] leading-relaxed text-muted">
                {service.description}
              </p>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}
