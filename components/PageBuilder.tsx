import { HeroBlock } from "./blocks/Hero";
import { ImageGridBlock } from "./blocks/ImageGrid";
import { TextBlockView } from "./blocks/TextBlock";
import { TestimonialBlock } from "./blocks/Testimonial";
import { CtaBlock } from "./blocks/Cta";

/**
 * Maps each Sanity pageBuilder block type to its React component.
 * This registry is the entire mechanism behind "photographers add/edit
 * pages without a developer" — new block types get added here once,
 * then are available on every page.
 */
const BLOCKS: Record<string, React.ComponentType<{ block: any }>> = {
  heroBlock: HeroBlock,
  imageGridBlock: ImageGridBlock,
  textBlock: TextBlockView,
  testimonialBlock: TestimonialBlock,
  ctaBlock: CtaBlock,
};

export function PageBuilder({ blocks }: { blocks: any[] }) {
  return (
    <>
      {(blocks || []).map((block, i) => {
        const Component = BLOCKS[block._type];
        if (!Component) return null;
        return <Component key={block._key || i} block={block} />;
      })}
    </>
  );
}
