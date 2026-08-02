import Link from "next/link";
import { CloudinaryPhoto } from "./CloudinaryPhoto";

type Project = {
  _id: string;
  title: string;
  slug: string;
  category?: string;
  coverImage: { publicId: string; alt: string };
};

/**
 * The "contact sheet" — the site's signature layout element. Frame numbers
 * are real here (they're the sequence position in the edit), not decoration.
 */
export function ProjectGrid({ projects }: { projects: Project[] }) {
  return (
    <div className="grid grid-cols-1 gap-px bg-moss/40 sm:grid-cols-2 lg:grid-cols-3">
      {projects.map((project, i) => (
        <Link
          key={project._id}
          href={`/work/${project.slug}`}
          className="group relative aspect-[4/5] overflow-hidden bg-ink"
        >
          <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-105">
            <CloudinaryPhoto
              publicId={project.coverImage.publicId}
              alt={project.coverImage.alt}
              variant="grid"
              priority={i < 3}
            />
          </div>
          <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-ink/90 via-transparent to-transparent p-5 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            <span className="frame-label mb-1">No. {String(i + 1).padStart(3, "0")}{project.category ? ` — ${project.category}` : ""}</span>
            <h3 className="font-display text-xl text-paper">{project.title}</h3>
          </div>
        </Link>
      ))}
    </div>
  );
}
