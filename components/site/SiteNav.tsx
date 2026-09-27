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
const MENU_ID = "site-nav-menu";
const DESKTOP_NAV_QUERY = "(min-width: 1024px)";

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
export function SiteNav({
  links,
  className = "",
}: {
  links: SiteNavLink[];
  className?: string;
}) {
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
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const spyLock = useRef<{ id: string; until: number } | null>(null);
  const lockTimer = useRef<number>(0);
  const syncRef = useRef<() => void>(() => {});
  const armLockRef = useRef<(id: string) => void>(() => {});

  const homeHeroId = pathname === "/" ? HERO_SECTION_ID : null;

  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mq = window.matchMedia(DESKTOP_NAV_QUERY);
    const onChange = () => {
      if (mq.matches) setOpen(false);
    };
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    if (!open) return;

    function onKey(event: KeyboardEvent) {
      if (event.key !== "Escape") return;
      setOpen(false);
      buttonRef.current?.focus();
    }

    // Attached after open so the click that opened the menu does not close it.
    function onPointerDown(event: PointerEvent) {
      if (navRef.current?.contains(event.target as Node)) return;
      setOpen(false);
    }

    document.addEventListener("keydown", onKey);
    document.addEventListener("pointerdown", onPointerDown);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [open]);

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
    setOpen(false);
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

  const listClass = open
    ? "absolute inset-x-0 top-full z-40 flex flex-col gap-1 border-b border-line bg-bg px-6 py-3 lg:static lg:z-auto lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-8 lg:gap-y-2 lg:border-0 lg:bg-transparent lg:p-0 lg:backdrop-blur-none"
    : "hidden lg:flex lg:flex-row lg:flex-wrap lg:items-center lg:gap-x-8 lg:gap-y-2";

  return (
    <nav ref={navRef} aria-label="Principal" className={className}>
      <button
        ref={buttonRef}
        type="button"
        className="grid h-11 w-11 place-items-center rounded-full border border-line text-fg lg:hidden"
        aria-expanded={open}
        aria-controls={MENU_ID}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        onClick={() => setOpen((value) => !value)}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" aria-hidden>
          <path
            d={open ? "M6 6l12 12M18 6L6 18" : "M4 7h16M4 12h16M4 17h16"}
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>
      <div id={MENU_ID} className={listClass}>
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
              className={`inline-flex min-h-11 items-center font-mono text-xs uppercase tracking-[0.2em] transition-colors lg:min-h-0 ${
                active ? "text-accent" : "text-muted hover:text-fg"
              }`}
              aria-current={active ? "page" : undefined}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
