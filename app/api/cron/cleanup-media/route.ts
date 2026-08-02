import { NextRequest, NextResponse } from "next/server";
import { v2 as cloudinary } from "cloudinary";
import Mux from "@mux/mux-node";
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

async function deleteCloudinaryAsset(publicId: string) {
  cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary destroy failed: ${result.result}`);
  }
}

async function deleteMuxAsset(assetId: string) {
  const mux = new Mux({
    tokenId: process.env.MUX_TOKEN_ID!,
    tokenSecret: process.env.MUX_TOKEN_SECRET!,
  });
  await mux.video.assets.delete(assetId);
}
