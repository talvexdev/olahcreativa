import Link from "next/link";

import { CloudinaryImage } from "@/components/cloudinary";
import { ThemeToggle } from "@/components/ThemeToggle";
import type { SanityCloudinaryImage } from "@/lib/cloudinary";

type NavLink = { label: string; href: string };

export function Header({
  brandName,
  logo,
  navLinks,
}: {
  brandName: string;
  logo?: SanityCloudinaryImage | null;
  navLinks?: NavLink[];
}) {
  return (
    <header className="sticky top-0 z-40 border-b border-line bg-bg/95 backdrop-blur">
      <div className="mx-auto flex max-w-8xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-5">
        <Link
          href="/"
          className="font-display text-xl tracking-tight text-fg"
          aria-label={brandName}
        >
          {logo ? (
            <>
              <CloudinaryImage
                image={logo}
                variant="thumbnail"
                className="h-8 w-auto max-w-[10rem] object-contain object-left"
              />
              <span className="sr-only">{brandName}</span>
            </>
          ) : (
            brandName
          )}
        </Link>
        <nav className="flex gap-4 sm:gap-8">
          {(navLinks || []).map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="frame-label text-muted transition-colors hover:text-fg"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <ThemeToggle />
      </div>
    </header>
  );
}
