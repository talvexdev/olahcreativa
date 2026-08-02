import { CloudinaryPhoto } from "@/components/CloudinaryPhoto";
import { MuxVideoPlayer } from "@/components/MuxVideoPlayer";

export function HeroBlock({ block }: { block: any }) {
  const hasVideo = block.media?.video?.playbackId;
  return (
    <section className="relative flex min-h-[70vh] items-end overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {hasVideo ? (
          <MuxVideoPlayer
            playbackId={block.media.video.playbackId}
            poster={block.media.video.poster}
            autoplayMuted
          />
        ) : block.media?.image ? (
          <CloudinaryPhoto publicId={block.media.image.publicId} alt={block.media.image.alt} variant="hero" priority />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/30 to-transparent" />
      </div>
      <div className="mx-auto max-w-8xl px-6 pb-16">
        <h2 className="font-display text-4xl text-paper sm:text-6xl">{block.heading}</h2>
        {block.subheading && <p className="mt-4 max-w-xl text-paper/80">{block.subheading}</p>}
      </div>
    </section>
  );
}
