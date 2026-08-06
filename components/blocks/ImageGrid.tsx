import { CloudinaryPhoto } from "@/components/CloudinaryPhoto";

const COLS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

export function ImageGridBlock({ block }: { block: any }) {
  return (
    <section className="mx-auto max-w-8xl px-6 py-16">
      {block.heading && <h2 className="mb-8 font-display text-2xl text-fg">{block.heading}</h2>}
      <div className={`grid grid-cols-1 gap-4 ${COLS[block.columns] || COLS["3"]}`}>
        {block.items.map((img: any, i: number) => (
          <div key={i} className="relative aspect-[4/5] overflow-hidden">
            <CloudinaryPhoto publicId={img.publicId} alt={img.alt} variant="grid" />
          </div>
        ))}
      </div>
    </section>
  );
}
