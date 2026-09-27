import { normalizeCloudinaryImage, normalizeCloudinaryVideo } from "@/lib/cloudinary";
import type { SanityCloudinaryImage, SanityCloudinaryVideo } from "@/lib/cloudinary";

import { PORTFOLIO_CREDIT_ROLES } from "./credit-roles";

export type PortfolioClip = {
  label?: string;
  caption?: string;
  video?: SanityCloudinaryVideo;
  image?: SanityCloudinaryImage;
};

export type PortfolioGalleryPhoto = {
  label?: string;
  image?: SanityCloudinaryImage;
};

/** One credit line — `role` is the small label above `name` (artista, fotografía…). */
export type PortfolioCredit = {
  role?: string;
  name: string;
};

export { PORTFOLIO_CREDIT_ROLES };

export type PortfolioProject = {
  label?: string;
  category?: string;
  title?: string;
  description?: string;
  credits?: PortfolioCredit[];
  heroVideo?: SanityCloudinaryVideo;
  heroImage?: SanityCloudinaryImage;
  clips?: PortfolioClip[];
  gallery?: PortfolioGalleryPhoto[];
};

/** Normalized portafolio block ready for render. */
export type PortfolioBlockViewModel = {
  eyebrow?: string;
  heading: string;
  headingAccent?: string;
  description?: string;
  projects: PortfolioProject[];
};

/**
 * Builds the ficha técnica: the standard named roles in `PORTFOLIO_CREDIT_ROLES`
 * order (blank ones are simply skipped), then any custom `creditList` extras.
 * Falls back to the legacy free-text `credits` strings only when nothing else is
 * filled, splitting "Dirección FlyGuy · Producción Giorgi" into one entry each.
 */
function normalizePortfolioCredits(record: Record<string, unknown>): PortfolioCredit[] | undefined {
  const roles =
    record.creditRoles && typeof record.creditRoles === "object"
      ? (record.creditRoles as Record<string, unknown>)
      : {};

  const named = PORTFOLIO_CREDIT_ROLES.map(({ field, label }): PortfolioCredit | null => {
    const value = roles[field];
    const name = typeof value === "string" ? value.trim() : "";
    return name ? { role: label, name } : null;
  }).filter((credit): credit is PortfolioCredit => credit !== null);

  const extras = (Array.isArray(record.creditList) ? record.creditList : [])
    .map((entry): PortfolioCredit | null => {
      if (!entry || typeof entry !== "object") return null;
      const e = entry as Record<string, unknown>;
      const name = typeof e.name === "string" ? e.name.trim() : "";
      if (!name) return null;
      const role = typeof e.role === "string" ? e.role.trim() : "";
      return { role: role || undefined, name };
    })
    .filter((credit): credit is PortfolioCredit => credit !== null);

  const credits = [...named, ...extras];
  if (credits.length > 0) return credits;

  const legacy = (Array.isArray(record.credits) ? record.credits : [])
    .filter((line): line is string => typeof line === "string")
    .flatMap((line) => line.split("·"))
    .map((part) => part.trim())
    .filter(Boolean)
    .map((name) => ({ name }));

  return legacy.length > 0 ? legacy : undefined;
}

export function normalizePortfolioProject(raw: unknown): PortfolioProject | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;

  const clips = Array.isArray(record.clips)
    ? (record.clips
        .map((clip) => {
          if (!clip || typeof clip !== "object") return null;
          const c = clip as Record<string, unknown>;
          const video = normalizeCloudinaryVideo(c.video) ?? undefined;
          const image = normalizeCloudinaryImage(c.image) ?? undefined;

          if (!video?.publicId && !image) return null;

          return {
            label: typeof c.label === "string" ? c.label : undefined,
            caption: typeof c.caption === "string" ? c.caption : undefined,
            video,
            image,
          };
        })
        .filter(Boolean) as PortfolioClip[])
    : undefined;

  const gallery = Array.isArray(record.gallery)
    ? (record.gallery
        .map((photo) => {
          if (!photo || typeof photo !== "object") return null;
          const p = photo as Record<string, unknown>;
          return {
            label: typeof p.label === "string" ? p.label : undefined,
            image: normalizeCloudinaryImage(p.image) ?? undefined,
          };
        })
        .filter(Boolean) as PortfolioGalleryPhoto[])
    : undefined;

  const title = typeof record.title === "string" ? record.title : undefined;
  if (!title) return null;

  return {
    label: typeof record.label === "string" ? record.label : undefined,
    category: typeof record.category === "string" ? record.category : undefined,
    title,
    description: typeof record.description === "string" ? record.description : undefined,
    credits: normalizePortfolioCredits(record),
    heroVideo: normalizeCloudinaryVideo(record.heroVideo) ?? undefined,
    heroImage: normalizeCloudinaryImage(record.heroImage) ?? undefined,
    clips,
    gallery,
  };
}

export function normalizePortfolioBlock(raw: unknown): PortfolioBlockViewModel | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;
  const heading = typeof record.heading === "string" ? record.heading : undefined;
  if (!heading) return null;

  const projects = (Array.isArray(record.projects) ? record.projects : [])
    .map(normalizePortfolioProject)
    .filter((project): project is PortfolioProject => project !== null);

  return {
    eyebrow: typeof record.eyebrow === "string" ? record.eyebrow : undefined,
    heading,
    headingAccent:
      typeof record.headingAccent === "string" ? record.headingAccent : undefined,
    description: typeof record.description === "string" ? record.description : undefined,
    projects,
  };
}
