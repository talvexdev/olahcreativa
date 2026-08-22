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
      <div className="mx-auto flex max-w-8xl flex-wrap items-center justify-between gap-x-6 gap-y-3 px-6 py-5">
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
        <SiteNav links={navLinks ?? []} />
        <ThemeToggle />
      </div>
    </HeaderShell>
  );
}
