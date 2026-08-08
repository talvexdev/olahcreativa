import { CloudinaryImage } from "@/components/cloudinary";
import { getImageGridColumnClass, normalizeImageGridItems } from "@/lib/media";
import type { BlockProps, ImageGridBlockData } from "@/lib/sanity/block-types";

export function ImageGridBlock({ block }: BlockProps<ImageGridBlockData>) {
  const items = normalizeImageGridItems(block.items);

  return (
    <section className="mx-auto max-w-8xl px-6 py-16">
      {block.heading && <h2 className="mb-8 font-display text-2xl text-fg">{block.heading}</h2>}
      <div className={`grid grid-cols-1 gap-4 ${getImageGridColumnClass(block.columns)}`}>
        {items.map((image, i) => (
          <div key={image.publicId + i} className="relative aspect-[4/5] overflow-hidden">
            <CloudinaryImage image={image} variant="grid" />
          </div>
        ))}
      </div>
    </section>
  );
}
