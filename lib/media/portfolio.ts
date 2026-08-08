import { normalizeCloudinaryImage } from "@/lib/cloudinary";
import type { SanityCloudinaryImage } from "@/lib/cloudinary";

import { normalizeProjectedMuxVideo, type ProjectedMuxVideo } from "./mux-video";

export type PortfolioClip = {
  label?: string;
  caption?: string;
  image?: SanityCloudinaryImage;
};

export type PortfolioGalleryPhoto = {
  label?: string;
  image?: SanityCloudinaryImage;
};

export type PortfolioProject = {
  label?: string;
  category?: string;
  title?: string;
  description?: string;
  credits?: string[];
  heroVideo?: ProjectedMuxVideo;
  heroImage?: SanityCloudinaryImage;
  clips?: PortfolioClip[];
  gallery?: PortfolioGalleryPhoto[];
};

/** Normalized portfolio block ready for render. */
export type PortfolioBlockViewModel = {
  eyebrow?: string;
  heading: string;
  headingAccent?: string;
  description?: string;
  projects: PortfolioProject[];
};

export function normalizePortfolioProject(raw: unknown): PortfolioProject | null {
  if (!raw || typeof raw !== "object") return null;

  const record = raw as Record<string, unknown>;

  const clips = Array.isArray(record.clips)
    ? (record.clips
        .map((clip) => {
          if (!clip || typeof clip !== "object") return null;
          const c = clip as Record<string, unknown>;
          return {
            label: typeof c.label === "string" ? c.label : undefined,
            caption: typeof c.caption === "string" ? c.caption : undefined,
            image: normalizeCloudinaryImage(c.image) ?? undefined,
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
    credits: Array.isArray(record.credits)
      ? record.credits.filter((line): line is string => typeof line === "string")
      : undefined,
    heroVideo: normalizeProjectedMuxVideo(record.heroVideo),
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
