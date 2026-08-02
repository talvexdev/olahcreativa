import { createClient } from "next-sanity";

const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder";
const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";

/**
 * A single shared client. No client-side/browser queries anywhere in the
 * app — every call here happens at build time or in a Route Handler, which
 * is what keeps Sanity API usage tied to publish events rather than visitor
 * traffic (see architecture notes: this is the free-tier-safety design).
 */
export const sanityClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  useCdn: true, // served from Sanity's CDN, not the live API, for public reads
  token: process.env.SANITY_API_READ_TOKEN,
});

/** Write-enabled client for cron sweeps and webhook tombstone creation. */
export const sanityWriteClient = createClient({
  projectId,
  dataset,
  apiVersion: "2025-01-01",
  useCdn: false,
  token: process.env.SANITY_API_WRITE_TOKEN,
});

/** Returns null when Sanity is not configured (e.g. CI build without env). */
export function isSanityConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SANITY_PROJECT_ID);
}
