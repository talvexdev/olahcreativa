import { NextRequest, NextResponse } from "next/server";
import { parseBody } from "next-sanity/webhook";
import { sanityWriteClient } from "@/lib/sanity.client";
import {
  diffRemovedMedia,
  extractMediaAssets,
  permanentDeleteAfter,
  tombstoneId,
} from "@/lib/media-extract";

const MEDIA_TYPES = new Set(["project", "page"]);

type WebhookBody = {
  _id: string;
  _type: string;
  title?: string;
  slug?: { current: string };
  _rev?: string;
};

/**
 * Sanity webhook target — creates mediaTombstone records when media is removed
 * from a project/page (delete or update). The daily cron permanently deletes
 * assets after the 14-day grace window.
 */
export async function POST(req: NextRequest) {
  try {
    const { body, isValidSignature } = await parseBody<WebhookBody>(
      req,
      process.env.SANITY_REVALIDATE_SECRET
    );

    if (!isValidSignature) {
      return NextResponse.json({ message: "Invalid signature" }, { status: 401 });
    }
    if (!body?._type || !MEDIA_TYPES.has(body._type)) {
      return NextResponse.json({ message: "Ignored" }, { status: 200 });
    }

    const sourceTitle =
      body.title || body.slug?.current || body._id;

    // Determine if this is a delete (document no longer exists) or update
    const currentDoc = await sanityWriteClient.fetch(
      `*[_id == $id][0]`,
      { id: body._id }
    );

    let assetsToTombstone: ReturnType<typeof extractMediaAssets>;

    if (!currentDoc) {
      // Document deleted — tombstone all media from the webhook payload
      assetsToTombstone = extractMediaAssets(
        body as Record<string, unknown>,
        sourceTitle
      );
    } else {
      // Document updated — diff against previous revision if available
      const previousRev = await getPreviousRevision(body._id, body._rev);
      if (previousRev) {
        assetsToTombstone = diffRemovedMedia(
          previousRev as Record<string, unknown>,
          currentDoc as Record<string, unknown>,
          sourceTitle
        );
      } else {
        return NextResponse.json({ message: "No previous revision to diff" }, { status: 200 });
      }
    }

    const now = new Date().toISOString();
    const deleteAfter = permanentDeleteAfter();
    const tx = sanityWriteClient.transaction();

    for (const asset of assetsToTombstone) {
      tx.createOrReplace({
        _id: tombstoneId(asset.provider, asset.assetId),
        _type: "mediaTombstone",
        provider: asset.provider,
        assetId: asset.assetId,
        sourceDocumentTitle: asset.sourceDocumentTitle,
        deletedAt: now,
        permanentDeleteAfter: deleteAfter,
      });
    }

    if (assetsToTombstone.length > 0) {
      await tx.commit();
    }

    return NextResponse.json({
      tombstoned: assetsToTombstone.length,
      now: Date.now(),
    });
  } catch (err) {
    return NextResponse.json({ message: (err as Error).message }, { status: 500 });
  }
}

async function getPreviousRevision(
  docId: string,
  currentRev?: string
): Promise<Record<string, unknown> | null> {
  const projectId = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
  const dataset = process.env.NEXT_PUBLIC_SANITY_DATASET || "production";
  const token = process.env.SANITY_API_WRITE_TOKEN;

  if (!projectId || !token) return null;

  try {
    const res = await fetch(
      `https://${projectId}.api.sanity.io/v2021-06-07/data/history/${dataset}/documents/${docId}?limit=5`,
      { headers: { Authorization: `Bearer ${token}` } }
    );
    if (!res.ok) return null;

    const data = (await res.json()) as { documents?: Record<string, unknown>[] };
    const docs = data.documents || [];
    if (docs.length < 2) return null;

    const previous = docs.find((d) => (d as { _rev?: string })._rev !== currentRev);
    return (previous || docs[1]) as Record<string, unknown>;
  } catch {
    return null;
  }
}
