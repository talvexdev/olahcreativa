export function TestimonialBlock({ block }: { block: any }) {
  return (
    <section className="mx-auto max-w-3xl px-6 py-16 text-center">
      <p className="font-display text-2xl italic text-paper sm:text-3xl">&ldquo;{block.quote}&rdquo;</p>
      {block.attribution && <p className="frame-label mt-6">{block.attribution}</p>}
    </section>
  );
}
