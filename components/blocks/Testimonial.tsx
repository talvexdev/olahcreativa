import type { BlockProps, TestimonialBlockData } from "@/lib/sanity/block-types";

export function TestimonialBlock({ block }: BlockProps<TestimonialBlockData>) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center">
      <p className="font-display text-2xl italic text-fg sm:text-3xl">&ldquo;{block.quote}&rdquo;</p>
      {block.attribution && <p className="frame-label mt-6">{block.attribution}</p>}
    </section>
  );
}
