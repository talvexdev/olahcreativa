type Clip = { label?: string; caption?: string };
type Photo = { label?: string; alt?: string };

type Project = {
  label?: string;
  category?: string;
  title?: string;
  description?: string;
  credits?: string[];
  clips?: Clip[];
  gallery?: Photo[];
};

/**
 * Portfolio section: one card per project — big video on top, then the
 * write-up and credits, a row of short clips, and a swipeable photo strip.
 *
 * Media is intentionally not wired to Mux/Cloudinary yet. Every media slot
 * renders a <MediaFrame> placeholder, so the layout is real and reviewable
 * before any asset exists. Swapping in the real players later means replacing
 * the frame's children, not restructuring the section.
 */

/** Ratio classes are written out because Tailwind only ships the ones it can see in source. */
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
  return (
    <div
      className={`relative overflow-hidden bg-surface ${RATIO[ratio]} ${className}`}
    >
      {/*
        Diagonal hatch marks the frame as "nothing here yet" without needing an
        image file. It's painted with a gradient over currentColor, so it picks
        up the theme instead of being a fixed grey that only works in one mode.
      */}
      <div
        aria-hidden
        className="absolute inset-0 text-fg/[0.07]"
        style={{
          backgroundImage:
            "repeating-linear-gradient(135deg, currentColor 0 1px, transparent 1px 11px)",
        }}
      />
      <div className="absolute inset-0 border border-dashed border-line" />

      {badge && (
        <p className="absolute left-3 top-3 rounded-full bg-bg/70 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted backdrop-blur">
          {badge}
        </p>
      )}

      {note && (
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
    <div className="absolute inset-0 grid place-items-center">
      <span className="grid h-20 w-20 place-items-center rounded-full border border-accent/50 bg-accent/15 backdrop-blur transition-transform duration-300 group-hover:scale-105">
        <svg
          viewBox="0 0 24 24"
          className="ml-1 h-7 w-7 fill-accent"
          aria-hidden
        >
          <path d="M8 5v14l11-7z" />
        </svg>
      </span>
    </div>
  );
}

function ProjectCard({ project, index }: { project: Project; index: number }) {
  const clips = project.clips ?? [];
  const gallery = project.gallery ?? [];
  const credits = project.credits ?? [];
  const label = project.label || `Proyecto ${String(index + 1).padStart(2, "0")}`;

  return (
    <article className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="group relative">
        <MediaFrame note="Video principal · 16:9">
          <PlayButton />
        </MediaFrame>

        {/*
          Title sits over the foot of the video, as in the reference. The scrim
          is what keeps it legible once a real frame is behind it — without it
          the text would be at the mercy of whatever the video's last pixel row
          happens to be.
        */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-bg via-bg/80 to-transparent px-8 pb-8 pt-24">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-accent">
            {label}
            {project.category && (
              <span className="text-muted"> · {project.category}</span>
            )}
          </p>
          <h3 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {project.title}
          </h3>
        </div>
      </div>

      <div className="bg-surface px-8 py-10">
        {project.description && (
          <p className="max-w-[62ch] text-lg leading-relaxed">
            {project.description}
          </p>
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
                />
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
            {/*
              tabIndex makes the strip reachable by keyboard: a scroll container
              whose content isn't focusable is otherwise unscrollable without a
              mouse or trackpad. The role/label pair is what makes that focus
              stop announce itself as something scrollable.
            */}
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
                  />
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </article>
  );
}

export function PortfolioBlock({ block }: { block: any }) {
  const projects: Project[] = Array.isArray(block.projects) ? block.projects : [];

  return (
    // The id is the anchor a PORTAFOLIO nav link can point at.
    <section id="portafolio" className="mx-auto max-w-8xl px-6 py-28">
      {block.eyebrow && (
        <p className="frame-label mb-8 flex items-center gap-3">
          <span className="block h-px w-8 bg-current" />
          {block.eyebrow}
        </p>
      )}

      <h2 className="max-w-[20ch] text-balance text-4xl font-semibold leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
        {block.heading}{" "}
        {block.headingAccent && (
          <span className="text-accent">{block.headingAccent}</span>
        )}
      </h2>

      {block.description && (
        <p className="mt-8 max-w-[52ch] text-lg leading-relaxed text-muted">
          {block.description}
        </p>
      )}

      <div className="mt-16 space-y-16">
        {projects.map((project, i) => (
          <ProjectCard key={i} project={project} index={i} />
        ))}
      </div>
    </section>
  );
}
