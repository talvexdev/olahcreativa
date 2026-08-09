import { PageBuilder } from "./PageBuilder";
import { webPageJsonLd } from "@/lib/json-ld";
import { getPageAccessibleHeading } from "@/lib/sanity/page-heading";

type CmsPageData = {
  title?: string;
  pageBuilder?: unknown;
  seoDescription?: string;
};

/**
 * Shared render for Sanity page-builder documents (/, /portfolio).
 */
export function CmsPage({ page, path }: { page: CmsPageData; path: string }) {
  const jsonLd = webPageJsonLd({
    title: page.title || "Page",
    path,
    description: page.seoDescription,
  });

  const accessibleHeading = getPageAccessibleHeading(page);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <h1 className="sr-only">{accessibleHeading}</h1>
      <PageBuilder blocks={page.pageBuilder as readonly unknown[] | null | undefined} />
    </>
  );
}
