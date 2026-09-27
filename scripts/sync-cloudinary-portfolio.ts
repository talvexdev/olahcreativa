/**
 * Link a Cloudinary folder onto a Portafolio project in Sanity.
 *
 * Usage:
 *   npm run content:sync
 *   npm run content:sync -- --dry-run
 *
 * Requires `.env.local`: Sanity write token, Cloudinary cloud name, API key, and API secret.
 * Local CLI only — not an HTTP route. The API secret stays out of Studio and off the client.
 *
 * Rules for each folder in `scripts/cloudinary-folders.ts`:
 *   • Identical uploads (same byte size) collapse to the newest file.
 *   • The longest video becomes Video principal.
 *   • The four shortest remaining videos fill CLIP 01, CLIP 02, CLIP 03, and STILL.
 *   • Still images become the gallery, in the timecode embedded in the filename.
 *   • A run that already matches the page does not write.
 */

import { createClient, type SanityClient } from "@sanity/client";
import { randomBytes } from "node:crypto";

import { CLOUDINARY_PORTFOLIO_FOLDERS, type CloudinaryPortfolioFolder } from "./cloudinary-folders";

type Resource = {
  public_id: string;
  resource_type: "image" | "video";
  type?: string;
  format?: string;
  version?: number;
  url?: string;
  secure_url?: string;
  width?: number;
  height?: number;
  bytes?: number;
  duration?: number;
  created_at?: string;
  access_mode?: string;
};

type ClipSlot = { _key: string; label?: string; video?: string | null };

type ProjectMedia = {
  _key: string;
  title?: string;
  hero?: string | null;
  clips?: ClipSlot[];
  gallery?: Array<string | null>;
};

const MAX_CLIPS = 4;

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value === "placeholder") {
    throw new Error(`Missing or invalid ${name}. Set it in .env.local.`);
  }
  return value;
}

function key() {
  return randomBytes(8).toString("hex");
}

function uniqueBy<T>(items: T[], id: (item: T) => string) {
  const seen = new Set<string>();
  return items.filter((item) => {
    const value = id(item);
    if (seen.has(value)) return false;
    seen.add(value);
    return true;
  });
}

/** Stable clip order for the JP & PECA secuencia files. Other names sort after them. */
function clipOrder(publicId: string) {
  if (/Secuencia_01_1(?:_|$)/.test(publicId)) return 1;
  if (/Secuencia_01_2(?:_|$)/.test(publicId)) return 2;
  if (/Secuencia_01_3(?:_|$)/.test(publicId)) return 3;
  if (publicId.startsWith("Secuencia_01")) return 0;
  return 50;
}

function frameTime(publicId: string) {
  const match = publicId.match(/\.(\d{2})_(\d{2})_(\d{2})_(\d{2})\./);
  if (!match) return Number.MAX_SAFE_INTEGER;
  const [, hours, minutes, seconds, frames] = match;
  return Number(hours) * 3600 + Number(minutes) * 60 + Number(seconds) + Number(frames) / 100;
}

function planFolder(resources: Resource[]) {
  const newest = uniqueBy(resources, (item) => {
    if (item.resource_type === "video") return `video:${item.bytes}:${Math.round(item.duration ?? 0)}`;
    const frame = item.public_id.match(/Imagen_fija(\d+)/)?.[1];
    return frame ? `image:${frame}` : `image:${item.bytes}:${item.width}:${item.height}`;
  });

  const videos = newest.filter((item) => item.resource_type === "video");
  const hero = videos.reduce<Resource | undefined>((longest, item) => {
    if (!longest || (item.duration ?? 0) > (longest.duration ?? 0)) return item;
    return longest;
  }, undefined);

  const clips = videos
    .filter((item) => item !== hero)
    .sort((a, b) => (a.duration ?? 0) - (b.duration ?? 0))
    .slice(0, MAX_CLIPS)
    .sort((a, b) => clipOrder(a.public_id) - clipOrder(b.public_id) || a.public_id.localeCompare(b.public_id));

  const stills = newest
    .filter((item) => item.resource_type === "image")
    .sort((a, b) => frameTime(a.public_id) - frameTime(b.public_id) || a.public_id.localeCompare(b.public_id));

  return { hero, clips, stills };
}

class CloudinaryAdmin {
  constructor(
    private readonly cloudName: string,
    private readonly auth: string,
  ) {}

  async listFolder(folder: string): Promise<Resource[]> {
    const collected: Resource[] = [];
    let cursor: string | undefined;
    do {
      const response = await fetch(`https://api.cloudinary.com/v1_1/${this.cloudName}/resources/search`, {
        method: "POST",
        headers: { Authorization: `Basic ${this.auth}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          expression: `folder:"${folder.replaceAll('"', "")}"`,
          max_results: 100,
          next_cursor: cursor,
          sort_by: [{ created_at: "desc" }],
        }),
      });
      const body = await response.json();
      if (!response.ok) {
        throw new Error(body?.error?.message || `Cloudinary search failed (${response.status})`);
      }
      collected.push(...((body.resources ?? []) as Resource[]));
      cursor = body.next_cursor;
    } while (cursor);
    return collected.filter((item) => !item.public_id.startsWith("samples/"));
  }

  async hydrate(resource: Resource): Promise<Resource> {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${this.cloudName}/resources/${resource.resource_type}/upload/${encodeURIComponent(resource.public_id)}`,
      { headers: { Authorization: `Basic ${this.auth}` } },
    );
    const body = await response.json();
    if (!response.ok) throw new Error(body?.error?.message || `Missing Cloudinary asset ${resource.public_id}`);
    return body as Resource;
  }
}

function asset(resource: Resource) {
  return {
    _type: "cloudinary.asset",
    _key: key(),
    public_id: resource.public_id,
    resource_type: resource.resource_type,
    type: resource.type || "upload",
    format: resource.format,
    version: resource.version,
    url: resource.url,
    secure_url: resource.secure_url,
    width: resource.width,
    height: resource.height,
    bytes: resource.bytes,
    ...(resource.duration ? { duration: resource.duration } : {}),
    ...(resource.created_at ? { created_at: resource.created_at } : {}),
    ...(resource.access_mode ? { access_mode: resource.access_mode } : {}),
  };
}

function videoValue(resource: Resource, alt: string, autoplayMuted: boolean) {
  return { _type: "cloudinaryVideo", asset: asset(resource), alt, autoplayMuted };
}

function imageValue(resource: Resource, alt: string) {
  return { _type: "cloudinaryImage", asset: asset(resource), alt };
}

function sameIds(current: Array<string | null | undefined>, next: string[]) {
  return current.length === next.length && current.every((id, index) => id === next[index]);
}

async function loadProject(client: SanityClient, folder: CloudinaryPortfolioFolder) {
  return client.fetch<{ blockKey?: string; project?: ProjectMedia } | null>(
    `*[_id == $pageId][0]{
      "blockKey": pageBuilder[_type == "portfolioBlock"][0]._key,
      "project": pageBuilder[_type == "portfolioBlock"][0].projects[title == $title][0]{
        _key,
        title,
        "hero": heroVideo.asset.public_id,
        "clips": clips[]{ _key, label, "video": video.asset.public_id },
        "gallery": gallery[].image.asset.public_id
      }
    }`,
    { pageId: folder.pageId, title: folder.projectTitle },
  );
}

async function syncFolder(
  client: SanityClient,
  cloudinary: CloudinaryAdmin,
  folder: CloudinaryPortfolioFolder,
  dryRun: boolean,
) {
  const resources = await cloudinary.listFolder(folder.folder);
  const planned = planFolder(resources);
  if (!planned.hero) throw new Error(`No video in Cloudinary folder "${folder.folder}".`);

  const page = await loadProject(client, folder);
  const project = page?.project;
  if (!page?.blockKey || !project?._key) {
    throw new Error(`Project "${folder.projectTitle}" was not found on ${folder.pageId}.`);
  }

  const clips = project.clips ?? [];
  if (clips.length < planned.clips.length) {
    throw new Error(
      `"${folder.projectTitle}" has ${clips.length} clip slots and the folder has ${planned.clips.length} short videos. Add the slots in Studio first (max ${MAX_CLIPS}).`,
    );
  }

  const heroIds = [project.hero ?? null];
  const clipIds = planned.clips.map((_, index) => clips[index]?.video ?? null);
  const galleryIds = (project.gallery ?? []).filter((id): id is string => Boolean(id));
  const unchanged =
    sameIds(heroIds, [planned.hero.public_id]) &&
    sameIds(clipIds, planned.clips.map((item) => item.public_id)) &&
    sameIds(galleryIds, planned.stills.map((item) => item.public_id));

  console.log(`\n${folder.projectTitle} ← ${folder.folder}`);
  console.log(`  hero: ${planned.hero.public_id}`);
  for (const [index, clip] of planned.clips.entries()) {
    console.log(`  ${clips[index]?.label || `clip ${index + 1}`}: ${clip.public_id}`);
  }
  console.log(`  gallery: ${planned.stills.length} stills`);

  if (unchanged) {
    console.log("  unchanged");
    return;
  }
  if (dryRun) {
    console.log("  dry-run: would update Sanity");
    return;
  }

  const [hero, ...rest] = await Promise.all([
    cloudinary.hydrate(planned.hero),
    ...planned.clips.map((item) => cloudinary.hydrate(item)),
    ...planned.stills.map((item) => cloudinary.hydrate(item)),
  ]);
  const clipResources = rest.slice(0, planned.clips.length);
  const stillResources = rest.slice(planned.clips.length);
  const base = `pageBuilder[_key=="${page.blockKey}"].projects[_key=="${project._key}"]`;

  const sets: Record<string, unknown> = {};
  if (project.hero !== hero.public_id) {
    sets[`${base}.heroVideo`] = videoValue(hero, `Video principal de ${folder.projectTitle}`, false);
  }
  clipResources.forEach((source, index) => {
    const slot = clips[index];
    if (!slot || slot.video === source.public_id) return;
    const label = slot.label || `CLIP ${String(index + 1).padStart(2, "0")}`;
    sets[`${base}.clips[_key=="${slot._key}"].video`] = videoValue(source, `${folder.projectTitle}, ${label}`, true);
  });
  if (!sameIds(galleryIds, stillResources.map((item) => item.public_id))) {
    sets[`${base}.gallery`] = stillResources.map((source, index) => ({
      _type: "photo",
      _key: key(),
      label: String(index + 1).padStart(2, "0"),
      image: imageValue(source, `Fotograma ${String(index + 1).padStart(2, "0")} de ${folder.projectTitle}`),
    }));
  }

  if (Object.keys(sets).length === 0) {
    console.log("  unchanged");
    return;
  }

  await client.patch(folder.pageId).set(sets).commit();
  console.log("  updated");
}

function printHelp() {
  console.log(`Link Cloudinary folders onto Portafolio projects.

Usage:
  npm run content:sync
  npm run content:sync -- --dry-run

Folders: scripts/cloudinary-folders.ts
`);
}

async function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    return;
  }
  const dryRun = process.argv.includes("--dry-run");
  const client = createClient({
    projectId: requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID"),
    dataset: requireEnv("NEXT_PUBLIC_SANITY_DATASET"),
    apiVersion: "2025-01-01",
    useCdn: false,
    token: requireEnv("SANITY_API_WRITE_TOKEN"),
  });
  const cloudinary = new CloudinaryAdmin(
    requireEnv("NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME"),
    Buffer.from(`${requireEnv("CLOUDINARY_API_KEY")}:${requireEnv("CLOUDINARY_API_SECRET")}`).toString("base64"),
  );

  for (const folder of CLOUDINARY_PORTFOLIO_FOLDERS) {
    await syncFolder(client, cloudinary, folder, dryRun);
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
