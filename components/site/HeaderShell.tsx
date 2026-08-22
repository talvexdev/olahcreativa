"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Publishes the sticky header’s real height as `--site-header-height` so
 * Portada can sit under it (`-mt` + matching `pt`) and fill `100dvh` —
 * including when the nav wraps on mobile/tablet.
 */
export function HeaderShell({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const publish = () => {
      const height = Math.ceil(el.getBoundingClientRect().height);
      document.documentElement.style.setProperty("--site-header-height", `${height}px`);
    };

    publish();

    const observer = new ResizeObserver(publish);
    observer.observe(el);

    window.addEventListener("orientationchange", publish);
    window.visualViewport?.addEventListener("resize", publish);

    return () => {
      observer.disconnect();
      window.removeEventListener("orientationchange", publish);
      window.visualViewport?.removeEventListener("resize", publish);
    };
  }, []);

  return (
    <header
      ref={ref}
      className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur"
    >
      {children}
    </header>
  );
}
