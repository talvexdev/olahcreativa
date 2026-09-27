import { BrandLink } from "@/components/site/BrandLink";
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
      <div className="mx-auto flex max-w-8xl flex-nowrap items-center justify-between gap-x-3 px-6 py-3 lg:gap-x-6 lg:py-5">
        <BrandLink brandName={brandName}>
          {logo ? (
            <>
              <CloudinaryImage
                image={logo}
                variant="thumbnail"
                sizes="160px"
                className="h-8 w-auto max-w-[10rem] object-contain object-left"
              />
              <span className="sr-only">{brandName}</span>
            </>
          ) : (
            brandName
          )}
        </BrandLink>
        {/* `lg:contents` lets the nav sit between brand and toggle on desktop.
            Below `lg` the cluster stays on the right: toggle, then menu. */}
        <div className="flex shrink-0 items-center gap-2 lg:contents">
          <ThemeToggle className="order-1 lg:order-3" />
          <SiteNav links={navLinks ?? []} className="order-2 shrink-0 lg:order-2 lg:shrink" />
        </div>
      </div>
    </HeaderShell>
  );
}
