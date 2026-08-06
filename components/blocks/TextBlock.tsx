import { PortableText } from "next-sanity";

export function TextBlockView({ block }: { block: any }) {
  return (
    <section className="mx-auto max-w-8xl px-6 py-16">
      <div className={block.width === "full" ? "w-full" : "mx-auto max-w-2xl"}>
        {block.heading && <h2 className="mb-6 font-display text-2xl text-fg">{block.heading}</h2>}
        <div className="prose dark:prose-invert prose-p:text-fg/85">
          <PortableText value={block.content} />
        </div>
      </div>
    </section>
  );
}
