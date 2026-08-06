"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";

type Step = {
  title?: string;
  description?: string;
  timecode?: string;
  label?: string;
};

/** Where the playhead sits, as a CSS length. Driven by --p on the container. */
const AT_PLAYHEAD = "calc(var(--p, 0) * 100%)";

const MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function subscribeMotion(onChange: () => void) {
  const mq = window.matchMedia(MOTION_QUERY);
  mq.addEventListener("change", onChange);
  return () => mq.removeEventListener("change", onChange);
}

/**
 * Scroll-scrubbed timeline. The playhead is a progress bar the reader controls:
 * it advances on the way down and rewinds on the way up.
 *
 * Progress is written straight to a CSS variable rather than React state — the
 * track has to follow every scroll frame, and re-rendering that often would
 * drop frames. React state only holds the active step index, which changes a
 * handful of times per section.
 */
export function ProcessBlock({ block }: { block: any }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [scrubbed, setScrubbed] = useState(0);

  const steps: Step[] = Array.isArray(block.steps) ? block.steps : [];
  const count = steps.length;

  const reduceMotion = useSyncExternalStore(
    subscribeMotion,
    () => window.matchMedia(MOTION_QUERY).matches,
    () => false,
  );

  // Readers who ask for less motion get the finished state, not a moving dot.
  const active = reduceMotion ? count - 1 : scrubbed;

  useEffect(() => {
    const el = trackRef.current;
    if (!el || count === 0) return;

    if (reduceMotion) {
      el.style.setProperty("--p", "1");
      return;
    }

    let frame = 0;

    const measure = () => {
      frame = 0;
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // 0 when the block's top sits low in the viewport, 1 once its bottom has
      // risen past the midpoint — so playback finishes while the last step is
      // still comfortably readable, not after scrolling clean past it.
      const from = vh * 0.85;
      const to = vh * 0.5;
      const span = from - to + rect.height;
      const raw = span > 0 ? (from - rect.top) / span : 0;
      const p = Math.min(1, Math.max(0, raw));

      el.style.setProperty("--p", p.toFixed(4));

      const next = Math.min(count - 1, Math.floor(p * count));
      setScrubbed((prev) => (prev === next ? prev : next));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };

    // Deferred rather than called inline so the first paint isn't blocked.
    frame = requestAnimationFrame(measure);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [count, reduceMotion]);

  if (count === 0) return null;

  const dot = (isPast: boolean) =>
    `absolute z-10 block h-4 w-4 rounded-full border-2 bg-bg transition-colors duration-300 ${
      isPast ? "border-accent" : "border-line"
    }`;

  return (
    <section className="mx-auto max-w-8xl px-6 py-28">
      {block.eyebrow && (
        <p className="frame-label mb-8 flex items-center gap-3">
          <span className="block h-px w-8 bg-current" />
          {block.eyebrow}
        </p>
      )}

      <h2 className="max-w-[18ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
        {block.heading}{" "}
        {block.headingAccent && (
          <span className="text-accent">{block.headingAccent}</span>
        )}
      </h2>

      <div ref={trackRef} className="relative mt-20">
        {/* ── Desktop: horizontal track above the cards ── */}
        <div className="relative mb-10 hidden h-4 md:block">
          <div className="absolute inset-x-0 top-1/2 h-px -translate-y-1/2 bg-line" />
          <div
            className="absolute left-0 top-1/2 h-px -translate-y-1/2 bg-accent"
            style={{ width: AT_PLAYHEAD }}
          />
          {steps.map((_, i) => (
            <span
              key={i}
              className={`${dot(i <= active)} top-0`}
              style={{ left: `${(i / count) * 100}%` }}
            />
          ))}
          <span
            className="absolute top-1/2 z-20 block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-accent/20"
            style={{ left: AT_PLAYHEAD }}
            aria-hidden
          />
        </div>

        {/* ── Mobile: vertical track down the left ── */}
        <div className="absolute bottom-0 left-1.75 top-2 w-px bg-line md:hidden" />
        <div
          className="absolute left-1.75 top-2 w-px bg-accent md:hidden"
          style={{ height: AT_PLAYHEAD }}
        />
        <span
          className="absolute left-1.75 z-20 block h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-accent ring-4 ring-accent/20 md:hidden"
          style={{ top: AT_PLAYHEAD }}
          aria-hidden
        />

        <ol
          className="grid gap-12 pl-9 md:grid-cols-[repeat(var(--n),minmax(0,1fr))] md:gap-8 md:pl-0"
          style={{ "--n": count } as React.CSSProperties}
        >
          {steps.map((step, i) => {
            const code = step.timecode || `00:${String(i).padStart(2, "0")}`;
            return (
              <li key={i} className="relative">
                <span className={`${dot(i <= active)} -left-9 top-1 md:hidden`} />
                <p className="frame-label">
                  {code}
                  {step.label ? ` — ${step.label}` : ""}
                </p>
                <h3
                  className={`mt-4 text-xl font-semibold tracking-tight transition-colors duration-300 ${
                    i <= active ? "text-accent" : "text-fg"
                  }`}
                >
                  {step.title}
                </h3>
                {step.description && (
                  <p className="mt-3 max-w-[42ch] leading-relaxed text-muted">
                    {step.description}
                  </p>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
