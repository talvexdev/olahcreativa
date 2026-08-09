import Link from "next/link";

import { CloudinaryImage } from "@/components/media/cloudinary";
import { HeaderShell } from "@/components/site/HeaderShell";
import { SiteNav, type SiteNavLink } from "@/components/site/SiteNav";
import { ThemeToggle } from "@/components/site/ThemeToggle";
import type { SanityCloudinaryImage } from "@/lib/cloudinary";

export function Header({
  brandName,
  logo,
  navLinks,
}: {
  brandName: string;
  logo?: SanityCloudinaryImage | null;
  navLinks?: SiteNavLink[];
}) {
  return (
    <HeaderShell>
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
        <SiteNav links={navLinks ?? []} />
        <ThemeToggle />
      </div>
    </HeaderShell>
  );
}
