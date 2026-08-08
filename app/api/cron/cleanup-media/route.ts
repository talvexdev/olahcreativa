import { NextRequest, NextResponse } from "next/server";
import { deleteCloudinaryAsset } from "@/lib/cloudinary.server";
import { deleteMuxAsset } from "@/lib/mux.server";
import { sanityWriteClient } from "@/lib/sanity.client";
import { groq } from "next-sanity";

/**
 * Daily sweep (see media-cleanup design): permanently deletes Cloudinary/Mux
 * assets whose tombstone grace window (14 days) has passed. Runs on Vercel
 * Cron. Failures are left in place for retry the next day rather than
 * silently dropped.
 */
const dueTombstonesQuery = groq`*[_type == "mediaTombstone" && permanentDeleteAfter <= now()]`;

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const due = await sanityWriteClient.fetch(dueTombstonesQuery);
  const results: { id: string; ok: boolean; error?: string }[] = [];

  for (const tombstone of due) {
    try {
      if (tombstone.provider === "cloudinary") {
        await deleteCloudinaryAsset(tombstone.assetId);
      } else if (tombstone.provider === "mux") {
        await deleteMuxAsset(tombstone.assetId);
      }
      await sanityWriteClient.delete(tombstone._id);
      results.push({ id: tombstone._id, ok: true });
    } catch (err) {
      // Left in place — retried on tomorrow's run. Not silently dropped.
      results.push({ id: tombstone._id, ok: false, error: (err as Error).message });
    }
  }

  return NextResponse.json({ processed: results.length, results });
}
