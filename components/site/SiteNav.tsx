"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useRef, useState, type MouseEvent } from "react";

import { HERO_SECTION_ID } from "@/lib/page-builder/anchors";
import {
  isHomeHeroHash,
  isHomeHeroLink,
  pickSpySection,
  queryHomeHeroElement,
} from "@/lib/site/nav-spy";

export type SiteNavLink = { label: string; href: string };

type ParsedNavLink = SiteNavLink & {
  path: string;
  hash: string;
};

const SPY_LOCK_MS = 1200;

function parseHref(href: string): { path: string; hash: string } {
  const trimmed = href.trim();
  if (!trimmed) return { path: "/", hash: "" };

  try {
    const url = new URL(trimmed, "https://olah.local");
    const path = url.pathname || "/";
    const hash = url.hash.replace(/^#/, "").toLowerCase();
    return { path, hash };
  } catch {
    if (trimmed.startsWith("#")) {
      return { path: "/", hash: trimmed.slice(1).toLowerCase() };
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

function readScrollY() {
  const y =
    window.scrollY ||
    document.scrollingElement?.scrollTop ||
    document.documentElement.scrollTop ||
    0;
  return y < 0 ? 0 : y;
}

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function scrollBehavior(): ScrollBehavior {
  return prefersReducedMotion() ? "auto" : "smooth";
}

function scrollToDocumentTop() {
  window.scrollTo({ top: 0, behavior: scrollBehavior() });
}

/** Scroll a section so its content sits just under the sticky header. */
function scrollToSectionId(id: string) {
  if (isHomeHeroHash(id) || id === HERO_SECTION_ID) {
    scrollToDocumentTop();
    return true;
  }
  const el = document.getElementById(id);
  if (!el) return false;
  el.scrollIntoView({
    behavior: scrollBehavior(),
    block: "start",
  });
  return true;
}

function measureSections(ids: string[], homeHeroId: string | null) {
  const rows = ids.flatMap((id) => {
    const el = document.getElementById(id);
    if (!el) return [];
    const rect = el.getBoundingClientRect();
    return [{ id, top: rect.top, bottom: rect.bottom }];
  });

  if (!homeHeroId) return rows;

  const heroEl = queryHomeHeroElement();
  if (!heroEl) return rows;

  const rect = heroEl.getBoundingClientRect();
  const hero = { id: homeHeroId, top: rect.top, bottom: rect.bottom };
  const index = rows.findIndex((row) => row.id === homeHeroId);
  if (index === -1) return [hero, ...rows];
  rows[index] = hero;
  return rows;
}

/**
 * Curated header nav with scroll-spy for same-page hash links.
 * Page links (e.g. `/portfolio`) activate by pathname; section links by the
 * section currently under the header. At the top of `/`, the home tab
 * (Portada / leftover Inicio) is always active.
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

  const [activeHash, setActiveHash] = useState(
    pathname === "/" ? HERO_SECTION_ID : "",
  );
  const spyLock = useRef<{ id: string; until: number } | null>(null);
  const lockTimer = useRef<number>(0);
  const syncRef = useRef<() => void>(() => {});
  const armLockRef = useRef<(id: string) => void>(() => {});

  const homeHeroId = pathname === "/" ? HERO_SECTION_ID : null;

  const sectionIds = useMemo(() => {
    const fromNav = items
      .filter((item) => item.path === pathname && item.hash)
      .map((item) => item.hash);
    if (homeHeroId && !fromNav.includes(homeHeroId)) {
      return [homeHeroId, ...fromNav];
    }
    return fromNav;
  }, [items, pathname, homeHeroId]);

  useEffect(() => {
    if (sectionIds.length === 0) {
      setActiveHash("");
      return;
    }

    let raf = 0;

    const sync = () => {
      raf = 0;
      const picked = pickSpySection({
        scrollY: readScrollY(),
        probeY: readHeaderOffsetPx() + 8,
        sections: measureSections(sectionIds, homeHeroId),
        homeHeroId,
      });
      const lock = spyLock.current;

      if (lock && Date.now() < lock.until) {
        if (picked === lock.id) spyLock.current = null;
        else return;
      } else if (lock) {
        spyLock.current = null;
      }

      setActiveHash(picked);
    };

    syncRef.current = sync;

    const armLock = (id: string) => {
      spyLock.current = { id, until: Date.now() + SPY_LOCK_MS };
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
      lockTimer.current = window.setTimeout(() => {
        spyLock.current = null;
        syncRef.current();
      }, SPY_LOCK_MS);
    };
    armLockRef.current = armLock;

    const onScrollOrResize = () => {
      if (!raf) raf = window.requestAnimationFrame(sync);
    };

    const onHashChange = () => {
      const id = window.location.hash.replace(/^#/, "").toLowerCase();
      if (id && sectionIds.includes(id)) {
        armLock(id);
        setActiveHash(id);
        scrollToSectionId(id);
      } else if (!id || isHomeHeroHash(id)) {
        const fallback = homeHeroId ?? "";
        armLock(fallback);
        setActiveHash(fallback);
        if (homeHeroId) scrollToDocumentTop();
      } else {
        sync();
      }
    };

    const initialHash = window.location.hash.replace(/^#/, "").toLowerCase();
    let land: number | undefined;
    if (initialHash && sectionIds.includes(initialHash) && !isHomeHeroHash(initialHash)) {
      armLock(initialHash);
      setActiveHash(initialHash);
      land = window.setTimeout(() => scrollToSectionId(initialHash), 50);
    } else {
      sync();
    }

    window.addEventListener("scroll", onScrollOrResize, { passive: true, capture: true });
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("hashchange", onHashChange);
    window.addEventListener("popstate", onHashChange);
    window.addEventListener("scrollend", sync);

    return () => {
      if (land) window.clearTimeout(land);
      if (raf) window.cancelAnimationFrame(raf);
      if (lockTimer.current) window.clearTimeout(lockTimer.current);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("popstate", onHashChange);
      window.removeEventListener("scrollend", sync);
    };
  }, [pathname, sectionIds, homeHeroId]);

  function onNavClick(event: MouseEvent<HTMLAnchorElement>, item: ParsedNavLink) {
    if (item.path !== pathname) return;

    const heroLink = isHomeHeroLink(item.path, item.hash, item.label, pathname);

    if (heroLink || !item.hash) {
      event.preventDefault();
      const nextHash = homeHeroId ?? "";
      armLockRef.current(nextHash);
      setActiveHash(nextHash);
      scrollToDocumentTop();
      const url = nextHash ? `#${nextHash}` : item.path;
      window.history.pushState(null, "", url);
      return;
    }

    const el = document.getElementById(item.hash);
    if (!el) return;

    // Same-page hash: Next may not re-scroll; do it ourselves under the header.
    event.preventDefault();
    armLockRef.current(item.hash);
    setActiveHash(item.hash);
    scrollToSectionId(item.hash);
    window.history.pushState(null, "", `${item.path === "/" ? "" : item.path}#${item.hash}`);
  }

  if (items.length === 0) return null;

  return (
    <nav aria-label="Principal" className="flex flex-wrap gap-4 sm:gap-6 lg:gap-8">
      {items.map((item) => {
        const onThisPage = item.path === pathname;
        const isHeroLink = isHomeHeroLink(item.path, item.hash, item.label, pathname);
        const isHeroActive = isHeroLink && isHomeHeroHash(activeHash);
        const isPageActive =
          onThisPage && !item.hash && pathname !== "/" && !activeHash;
        const isSectionActive =
          onThisPage && Boolean(item.hash) && !isHeroLink && activeHash === item.hash;
        const active = isHeroActive || isPageActive || isSectionActive;

        return (
          <Link
            key={`${item.label}-${item.href}`}
            href={item.href}
            onClick={(event) => onNavClick(event, item)}
            className={`font-mono text-xs uppercase tracking-[0.2em] transition-colors ${
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
