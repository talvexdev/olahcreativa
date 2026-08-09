"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState, type MouseEvent } from "react";

export type SiteNavLink = { label: string; href: string };

type ParsedNavLink = SiteNavLink & {
  path: string;
  hash: string;
};

function parseHref(href: string): { path: string; hash: string } {
  const trimmed = href.trim();
  if (!trimmed) return { path: "/", hash: "" };

  try {
    const url = new URL(trimmed, "https://olah.local");
    const path = url.pathname || "/";
    const hash = url.hash.replace(/^#/, "");
    return { path, hash };
  } catch {
    if (trimmed.startsWith("#")) {
      return { path: "/", hash: trimmed.slice(1) };
    }
    return { path: trimmed, hash: "" };
  }
}

function normalizePath(path: string) {
  if (!path || path === "/") return "/";
  return path.endsWith("/") ? path.slice(0, -1) : path;
}

function readHeaderOffsetPx() {
  const headerVar = getComputedStyle(document.documentElement)
    .getPropertyValue("--site-header-height")
    .trim();
  const n = Number.parseFloat(headerVar);
  if (!Number.isFinite(n) || n <= 0) return 72;
  if (headerVar.endsWith("rem")) return Math.round(n * 16);
  return Math.round(n);
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Scroll a section so its content sits just under the sticky header. */
function scrollToSectionId(id: string) {
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({
    behavior: prefersReducedMotion() ? "auto" : "smooth",
    block: "start",
  });
  return true;
}

/**
 * Curated header nav with scroll-spy for same-page hash links.
 * Page links (e.g. `/portfolio`) activate by pathname; section links by visible section.
 */
export function SiteNav({ links }: { links: SiteNavLink[] }) {
  const pathname = normalizePath(usePathname() || "/");
  const items = useMemo<ParsedNavLink[]>(
    () =>
      links
        .filter((l) => l.label && l.href)
        .map((l) => {
          const { path, hash } = parseHref(l.href);
          return { ...l, path: normalizePath(path), hash };
        }),
    [links],
  );

  const [activeHash, setActiveHash] = useState("");

  const sectionIds = useMemo(
    () =>
      items
        .filter((item) => item.path === pathname && item.hash)
        .map((item) => item.hash),
    [items, pathname],
  );

  // After client navigations to `/#servicios` (etc.), ensure we land on the section.
  useEffect(() => {
    const id = window.location.hash.replace(/^#/, "");
    if (!id || !sectionIds.includes(id)) return;

    let cancelled = false;
    const run = () => {
      if (cancelled) return;
      if (scrollToSectionId(id)) setActiveHash(id);
    };

    // Wait a frame so HeaderShell can publish --site-header-height / layout settle.
    const raf = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(run);
    });
    const t = window.setTimeout(run, 100);

    return () => {
      cancelled = true;
      window.cancelAnimationFrame(raf);
      window.clearTimeout(t);
    };
  }, [pathname, sectionIds]);

  useEffect(() => {
    if (sectionIds.length === 0) {
      setActiveHash("");
      return;
    }

    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => Boolean(el));

    if (elements.length === 0) {
      setActiveHash("");
      return;
    }

    const headerOffset = readHeaderOffsetPx();

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible[0]?.target?.id) {
          setActiveHash(visible[0].target.id);
          return;
        }

        if (window.scrollY < headerOffset) {
          setActiveHash("");
        }
      },
      {
        root: null,
        rootMargin: `-${Math.round(headerOffset + 8)}px 0px -55% 0px`,
        threshold: [0.1, 0.25, 0.5],
      },
    );

    for (const el of elements) observer.observe(el);

    const onHashChange = () => {
      const id = window.location.hash.replace(/^#/, "");
      if (id && sectionIds.includes(id)) {
        setActiveHash(id);
        scrollToSectionId(id);
      }
    };
    window.addEventListener("hashchange", onHashChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("hashchange", onHashChange);
    };
  }, [sectionIds]);

  function onNavClick(event: MouseEvent<HTMLAnchorElement>, item: ParsedNavLink) {
    if (!item.hash || item.path !== pathname) return;

    const el = document.getElementById(item.hash);
    if (!el) return;

    // Same-page hash: Next may not re-scroll; do it ourselves under the header.
    event.preventDefault();
    scrollToSectionId(item.hash);
    window.history.pushState(null, "", `${item.path === "/" ? "" : item.path}#${item.hash}`);
    setActiveHash(item.hash);
  }

  if (items.length === 0) return null;

  return (
    <nav aria-label="Principal" className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8">
      {items.map((item) => {
        const onThisPage = item.path === pathname;
        const isPageActive = onThisPage && !item.hash && !activeHash;
        const isSectionActive = onThisPage && Boolean(item.hash) && activeHash === item.hash;
        const active = isPageActive || isSectionActive;

        return (
          <Link
            key={`${item.label}-${item.href}`}
            href={item.href}
            onClick={(event) => onNavClick(event, item)}
            className={`frame-label transition-colors ${
              active ? "text-accent" : "text-muted hover:text-fg"
            }`}
            aria-current={active ? "page" : undefined}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
