/**
 * Copy runtime env vars from `.env.local` onto the linked Netlify site.
 *
 * Usage:
 *   npm run netlify:env
 *   npm run netlify:env -- --dry-run
 *
 * Merges these keys into every Netlify context. Does not replace the whole
 * env set, and does not upload the Cloudinary API secret (local content sync only).
 * Empty contact-form values are skipped so a blank local key cannot wipe a live one.
 */

import { spawnSync } from "node:child_process";
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

/** Present on the Netlify site so builds and functions can read Sanity and Cloudinary. */
const REQUIRED = [
  "NEXT_PUBLIC_SANITY_PROJECT_ID",
  "NEXT_PUBLIC_SANITY_DATASET",
  "SANITY_API_READ_TOKEN",
  "SANITY_API_WRITE_TOKEN",
  "SANITY_REVALIDATE_SECRET",
  "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME",
  "NEXT_PUBLIC_SITE_URL",
] as const;

/** Uploaded only when `.env.local` has a non-empty value. */
const OPTIONAL = ["RESEND_API_KEY", "CONTACT_FROM_EMAIL", "CONTACT_TO_EMAIL"] as const;

function envValue(name: string): string {
  return process.env[name]?.trim() ?? "";
}

function formatLine(name: string, value: string) {
  if (/[\s#"'\\]/.test(value)) {
    return `${name}="${value.replaceAll("\\", "\\\\").replaceAll('"', '\\"')}"`;
  }
  return `${name}=${value}`;
}

function printHelp() {
  console.log(`Copy runtime env vars from .env.local to the linked Netlify site.

Usage:
  npm run netlify:env
  npm run netlify:env -- --dry-run

Required: ${REQUIRED.join(", ")}
Optional when set: ${OPTIONAL.join(", ")}
`);
}

function main() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    printHelp();
    return;
  }
  const dryRun = process.argv.includes("--dry-run");

  const missing = REQUIRED.filter((name) => !envValue(name) || envValue(name) === "placeholder");
  if (missing.length) {
    throw new Error(`Missing or invalid ${missing.join(", ")}. Set them in .env.local.`);
  }

  const lines = [
    ...REQUIRED.map((name) => formatLine(name, envValue(name))),
    ...OPTIONAL.filter((name) => envValue(name)).map((name) => formatLine(name, envValue(name))),
  ];

  console.log(`Netlify env (${lines.length} keys):`);
  for (const line of lines) console.log(`  ${line.slice(0, line.indexOf("="))}`);
  if (dryRun) {
    console.log("dry-run: would import into the linked site");
    return;
  }

  const dir = mkdtempSync(join(tmpdir(), "olah-netlify-env-"));
  const file = join(dir, "netlify.env");
  try {
    writeFileSync(file, `${lines.join("\n")}\n`, { mode: 0o600 });
    const result = spawnSync("netlify", ["env:import", file], { stdio: "inherit" });
    if (result.error) {
      throw new Error("Netlify CLI was not found. Install it with: npm install -g netlify-cli");
    }
    if (result.status !== 0) process.exit(result.status ?? 1);
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
}

try {
  main();
} catch (error: unknown) {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}
