"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { MouseEvent, ReactNode } from "react";

import { HERO_SECTION_ID } from "@/lib/page-builder/anchors";

/**
 * Brand mark: on `/` scroll back to Portada (under the sticky header) instead
 * of a no-op same-route Next navigation.
 */
export function BrandLink({
  brandName,
  children,
}: {
  brandName: string;
  children: ReactNode;
}) {
  const pathname = usePathname() || "/";
  const home = pathname === "/" || pathname === "";

  function onClick(event: MouseEvent<HTMLAnchorElement>) {
    if (!home) return;
    event.preventDefault();
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
    window.history.pushState(null, "", `#${HERO_SECTION_ID}`);
    window.dispatchEvent(new Event("hashchange"));
  }

  return (
    <Link
      href={`/#${HERO_SECTION_ID}`}
      onClick={onClick}
      className="font-display text-xl tracking-tight text-fg"
      aria-label={brandName}
    >
      {children}
    </Link>
  );
}
