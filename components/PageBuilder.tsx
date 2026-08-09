import type { PageBuilderBlock } from "@/lib/sanity/block-types";

import { ContactBlock } from "./blocks/Contact";
import { CtaBlock } from "./blocks/Cta";
import { HeroBlock } from "./blocks/Hero";
import { ImageGridBlock } from "./blocks/ImageGrid";
import { PortfolioBlock } from "./blocks/Portfolio";
import { ProcessBlock } from "./blocks/Process";
import { ServicesBlock } from "./blocks/Services";
import { TestimonialBlock } from "./blocks/Testimonial";
import { TextBlockView } from "./blocks/TextBlock";

const BLOCK_TYPES = new Set<PageBuilderBlock["_type"]>([
  "heroBlock",
  "imageGridBlock",
  "textBlock",
  "testimonialBlock",
  "ctaBlock",
  "processBlock",
  "servicesBlock",
  "contactBlock",
  "portfolioBlock",
]);

function isPageBuilderBlock(raw: unknown): raw is PageBuilderBlock {
  if (!raw || typeof raw !== "object") return false;
  const type = (raw as { _type?: unknown })._type;
  return typeof type === "string" && BLOCK_TYPES.has(type as PageBuilderBlock["_type"]);
}

function renderBlock(block: PageBuilderBlock, key: React.Key) {
  switch (block._type) {
    case "heroBlock":
      return <HeroBlock key={key} block={block} />;
    case "imageGridBlock":
      return <ImageGridBlock key={key} block={block} />;
    case "textBlock":
      return <TextBlockView key={key} block={block} />;
    case "testimonialBlock":
      return <TestimonialBlock key={key} block={block} />;
    case "ctaBlock":
      return <CtaBlock key={key} block={block} />;
    case "processBlock":
      return <ProcessBlock key={key} block={block} />;
    case "servicesBlock":
      return <ServicesBlock key={key} block={block} />;
    case "contactBlock":
      return <ContactBlock key={key} block={block} />;
    case "portfolioBlock":
      return <PortfolioBlock key={key} block={block} />;
    default:
      return null;
  }
}

/**
 * Maps each Sanity pageBuilder block type to its React component.
 * This registry is the entire mechanism behind "photographers add/edit
 * pages without a developer" — new block types get added here once,
 * then are available on every page.
 */
export function PageBuilder({ blocks }: { blocks: readonly unknown[] | null | undefined }) {
  return (
    <>
      {(blocks ?? []).map((raw, i) => {
        if (!isPageBuilderBlock(raw)) return null;
        return renderBlock(raw, raw._key ?? i);
      })}
    </>
  );
}
