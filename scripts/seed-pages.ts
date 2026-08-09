/**
 * Seed fixed CMS page singletons + site settings into Sanity (published).
 *
 * Usage:
 *   npm run seed:pages              # create only if missing
 *   npm run seed:pages -- --dry-run
 *   npm run seed:pages -- --force   # overwrite published + drop matching drafts
 *
 * Requires `.env.local`: NEXT_PUBLIC_SANITY_PROJECT_ID, NEXT_PUBLIC_SANITY_DATASET,
 * SANITY_API_WRITE_TOKEN (Editor+). Local CLI only — not an HTTP route.
 *
 * Header/footer are seeded via `siteSettings` (root layout). Page modules are
 * not header/footer blocks.
 */

import { createClient, type SanityClient } from "@sanity/client";

import { HOME_PAGE_ID, PORTFOLIO_PAGE_ID } from "../lib/sanity/page-slugs";
import {
  homepagePageSeed,
  portfolioPageSeed,
  siteSettingsSeed,
  type PageSeedValue,
  type SiteSettingsSeedValue,
} from "../sanity/lib/page-seed";

type Flags = {
  force: boolean;
  dryRun: boolean;
  help: boolean;
};

type SeedTarget =
  | {
      kind: "page";
      id: string;
      label: string;
      path: string;
      seed: PageSeedValue;
    }
  | {
      kind: "siteSettings";
      id: "siteSettings";
      label: string;
      seed: SiteSettingsSeedValue;
    };

const TARGETS: SeedTarget[] = [
  {
    kind: "siteSettings",
    id: "siteSettings",
    label: "Ajustes del sitio (header/footer)",
    seed: siteSettingsSeed,
  },
  {
    kind: "page",
    id: HOME_PAGE_ID,
    label: "Inicio",
    path: "/",
    seed: homepagePageSeed,
  },
  {
    kind: "page",
    id: PORTFOLIO_PAGE_ID,
    label: "Portafolio",
    path: "/portfolio",
    seed: portfolioPageSeed,
  },
];

function parseFlags(argv: string[]): Flags {
  const flags: Flags = { force: false, dryRun: false, help: false };
  for (const arg of argv) {
    if (arg === "--force") flags.force = true;
    else if (arg === "--dry-run") flags.dryRun = true;
    else if (arg === "--help" || arg === "-h") flags.help = true;
    else if (arg.startsWith("-")) {
      throw new Error(`Unknown flag: ${arg}. Use --help.`);
    }
  }
  return flags;
}

function printHelp() {
  console.log(`Seed site settings + Inicio + Portafolio into Sanity.

Usage:
  npm run seed:pages
  npm run seed:pages -- --dry-run
  npm run seed:pages -- --force

Guards:
  • Requires Sanity project id, dataset, and SANITY_API_WRITE_TOKEN
  • Default: skip a doc if published or draft already exists
  • --force: replace published doc and delete matching draft
  • --dry-run: print actions only (no writes)

Notes:
  • Header/footer come from siteSettings (every page)
  • Portafolio page seeds one Portafolio module + Contacto; add more Portafolio
    modules under the first in the page builder as needed
  • Media (Mux/Cloudinary) is left for the CMS editor`);
}

function requireEnv(name: string): string {
  const value = process.env[name]?.trim();
  if (!value || value === "placeholder") {
    throw new Error(`Missing or invalid ${name}. Set it in .env.local.`);
  }
  return value;
}

function draftId(id: string) {
  return `drafts.${id}`;
}

async function existingIds(client: SanityClient, id: string): Promise<string[]> {
  const rows = await client.fetch<{ _id: string }[]>(
    `*[_id in [$published, $draft]]{ _id }`,
    { published: id, draft: draftId(id) },
  );
  return rows.map((row) => row._id);
}

async function seedTarget(
  client: SanityClient,
  target: SeedTarget,
  flags: Flags,
): Promise<"created" | "replaced" | "skipped" | "dry-run"> {
  const found = await existingIds(client, target.id);
  const hasPublished = found.includes(target.id);
  const hasDraft = found.includes(draftId(target.id));

  if ((hasPublished || hasDraft) && !flags.force) {
    const where = [
      hasPublished ? "published" : null,
      hasDraft ? "draft" : null,
    ]
      .filter(Boolean)
      .join(" + ");
    console.log(
      `⏭  ${target.label} (${target.id}) — already exists (${where}). Skipping. Use --force to overwrite.`,
    );
    return "skipped";
  }

  const location =
    target.kind === "page" ? ` for ${target.path}` : " (header/footer on every page)";

  if (flags.dryRun) {
    console.log(
      `·  ${target.label} (${target.id}) → would ${hasPublished || hasDraft ? "replace" : "create"} published doc${location}`,
    );
    if (hasDraft && flags.force) {
      console.log(`·  would delete ${draftId(target.id)}`);
    }
    return "dry-run";
  }

  if (target.kind === "page") {
    await client.createOrReplace({
      _id: target.id,
      _type: "page",
      ...structuredClone(target.seed),
    });
  } else {
    await client.createOrReplace({
      _id: target.id,
      _type: "siteSettings",
      ...structuredClone(target.seed),
    });
  }

  if (hasDraft) {
    try {
      await client.delete(draftId(target.id));
    } catch (err) {
      console.warn(
        `⚠  Wrote ${target.id} but could not delete ${draftId(target.id)}:`,
        err instanceof Error ? err.message : err,
      );
    }
  }

  const action = hasPublished || hasDraft ? "replaced" : "created";
  console.log(`✓  ${target.label} (${target.id}) — ${action}${location}`);
  return action === "replaced" ? "replaced" : "created";
}

async function main() {
  const flags = parseFlags(process.argv.slice(2));
  if (flags.help) {
    printHelp();
    return;
  }

  const projectId = requireEnv("NEXT_PUBLIC_SANITY_PROJECT_ID");
  const dataset = requireEnv("NEXT_PUBLIC_SANITY_DATASET");
  const token = requireEnv("SANITY_API_WRITE_TOKEN");

  if (!token.startsWith("sk")) {
    throw new Error(
      "SANITY_API_WRITE_TOKEN does not look like a Sanity API token (expected sk…).",
    );
  }

  const client = createClient({
    projectId,
    dataset,
    apiVersion: "2025-01-01",
    useCdn: false,
    token,
  });

  console.log(
    `Seeding → project ${projectId} / dataset ${dataset}${flags.dryRun ? " (dry-run)" : ""}${flags.force ? " (force)" : ""}`,
  );

  const results = {
    created: 0,
    replaced: 0,
    skipped: 0,
    dryRun: 0,
  };

  for (const target of TARGETS) {
    const result = await seedTarget(client, target, flags);
    if (result === "created") results.created += 1;
    else if (result === "replaced") results.replaced += 1;
    else if (result === "skipped") results.skipped += 1;
    else results.dryRun += 1;
  }

  console.log(
    `\nDone. created=${results.created} replaced=${results.replaced} skipped=${results.skipped}${flags.dryRun ? ` dry-run=${results.dryRun}` : ""}`,
  );

  if (!flags.dryRun && (results.created > 0 || results.replaced > 0)) {
    console.log(`
Still add in the CMS editor when ready:
  • Logo / SEO image on Ajustes del sitio
  • Inicio → Portada showcase clips (Mux + Cloudinary poster)
  • Portafolio → projects inside the first Portafolio module (or add more Portafolio modules below it)
  • Contacto — custom interest chips / form title if needed`);
  }
}

main().catch((err) => {
  console.error(`\nSeed failed: ${err instanceof Error ? err.message : err}`);
  process.exitCode = 1;
});
