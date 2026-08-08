import { CloudinaryImage } from "@/components/cloudinary";
import { MuxVideoPlayer } from "@/components/MuxVideoPlayer";
import { hasCloudinaryAsset, toCloudinaryPoster } from "@/lib/cloudinary";
import { normalizePortfolioBlock, type PortfolioProject } from "@/lib/media";
import type { BlockProps, PortfolioBlockData } from "@/lib/sanity/block-types";

const RATIO = {
  video: "aspect-video",
  portrait: "aspect-[3/4]",
} as const;

function MediaFrame({
  ratio = "video",
  badge,
  note,
  children,
  className = "",
}: {
  ratio?: keyof typeof RATIO;
  badge?: string;
  note?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  const isEmpty = !children;

  return (
    <div className={`relative overflow-hidden bg-surface ${RATIO[ratio]} ${className}`}>
      {isEmpty && (
        <>
          <div
            aria-hidden
            className="absolute inset-0 text-fg/[0.07]"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 11px)",
            }}
          />
          <div className="absolute inset-0 border border-dashed border-line" />
        </>
      )}

      {badge && (
        <p className="absolute left-3 top-3 z-10 rounded-full bg-bg/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted backdrop-blur">
          {badge}
        </p>
      )}

      {note && isEmpty && (
        <p className="absolute bottom-3 right-3 font-mono text-[10px] uppercase tracking-[0.16em] text-muted/70">
          {note}
        </p>
      )}

      {children}
    </div>
  );
}

function PlayButton() {
  return (
    <div aria-hidden className="absolute inset-0 grid place-items-center">
      <span className="grid h-20 w-20 place-items-center rounded-full border border-accent/50 bg-accent/15 backdrop-blur transition-transform duration-300 group-hover:scale-105">
        <svg viewBox="0 0 24 24" className="ml-1 h-7 w-7 fill-accent" aria-hidden>
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </div>
  );
}

function ProjectCard({ project, index }: { project: PortfolioProject; index: number }) {
  const clips = project.clips ?? [];
  const gallery = project.gallery ?? [];
  const credits = project.credits ?? [];
  const label = project.label || `Proyecto ${String(index + 1).padStart(2, "0")}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="group relative">
        {project.heroVideo?.playbackId ? (
          <MuxVideoPlayer
            playbackId={project.heroVideo.playbackId}
            status={project.heroVideo.status}
            poster={toCloudinaryPoster(project.heroVideo.poster)}
            autoplayMuted={project.heroVideo.autoplayMuted ?? false}
            title={project.title}
          />
        ) : hasCloudinaryAsset(project.heroImage) ? (
          <MediaFrame>
            <CloudinaryImage image={project.heroImage} variant="hero" priority={index === 0} />
          </MediaFrame>
        ) : (
          <MediaFrame note="Video principal · 16:9">
            <PlayButton />
          </MediaFrame>
        )}

        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/80 to-transparent px-8 pb-8 pt-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {label}
            {project.category && <span className="text-muted"> · {project.category}</span>}
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{project.title}</h3>
        </div>
      </div>

      <div className="bg-surface px-8 py-10">
        {project.description && (
          <p className="max-w-[62ch] text-lg leading-relaxed">{project.description}</p>
        )}

        {credits.length > 0 && (
          <ul className="mt-6 space-y-1.5 font-mono text-xs leading-relaxed text-muted">
            {credits.map((line, i) => (
              <li key={i}>{line}</li>
            ))}
          </ul>
        )}

        {clips.length > 0 && (
          <ul className="mt-10 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {clips.map((clip, i) => (
              <li key={i}>
                <MediaFrame
                  className="rounded-xl"
                  badge={clip.label || `Clip ${String(i + 1).padStart(2, "0")}`}
                >
                  <CloudinaryImage image={clip.image} variant="grid" />
                </MediaFrame>
                {clip.caption && (
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.14em] text-muted">
                    {clip.caption}
                  </p>
                )}
              </li>
            ))}
          </ul>
        )}

        {gallery.length > 0 && (
          <div className="mt-12">
            <p className="frame-label mb-4 text-muted">
              Galería <span aria-hidden>→</span> desliza para ver más
            </p>
            <ul
              tabIndex={0}
              role="region"
              aria-label={`Galería de ${project.title || label}`}
              className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-accent"
            >
              {gallery.map((photo, i) => (
                <li key={i} className="w-56 shrink-0 snap-start sm:w-64">
                  <MediaFrame
                    ratio="portrait"
                    className="rounded-xl"
                    badge={photo.label || String(i + 1).padStart(2, "0")}
                  >
                    <CloudinaryImage image={photo.image} variant="portrait" />
                  </MediaFrame>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

export function PortfolioBlock({ block }: BlockProps<PortfolioBlockData>) {
  const view = normalizePortfolioBlock(block);
  if (!view) return null;

  return (
    <section id="portafolio" className="mx-auto max-w-8xl px-6 py-28">
      {view.eyebrow && (
        <p className="frame-label mb-8 flex items-center gap-3">
          <span className="block h-px w-8 bg-current" />
          {view.eyebrow}
        </p>
      )}

      <h2 className="max-w-[20ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
        {view.heading}{" "}
        {view.headingAccent && <span className="text-accent">{view.headingAccent}</span>}
      </h2>

      {view.description && (
        <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-muted">{view.description}</p>
      )}

      <div className="mt-16 space-y-16">
        {view.projects.map((project, i) => (
          <ProjectCard key={i} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
