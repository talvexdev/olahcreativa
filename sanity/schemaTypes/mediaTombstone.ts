import { defineType, defineField } from "sanity";

/**
 * Tracking record for the media-cleanup workflow (see planning doc).
 * Written by the delete/replace webhook, read by the daily cron sweep,
 * and surfaced to the photographers as a plain-language "pending removal"
 * list with a restore action (delete this document before the sweep runs).
 * Not intended to be created manually in the Studio.
 */
export default defineType({
  name: "mediaTombstone",
  title: "Pending media cleanup",
  type: "document",
  readOnly: true, // photographers can view + restore, not hand-author
  fields: [
    defineField({ name: "provider", title: "Provider", type: "string", options: { list: ["cloudinary", "mux"] } }),
    defineField({ name: "assetId", title: "Asset ID", type: "string", description: "Cloudinary public_id or Mux asset ID." }),
    defineField({ name: "sourceDocumentTitle", title: "Was used on", type: "string" }),
    defineField({ name: "deletedAt", title: "Removed from site on", type: "datetime" }),
    defineField({ name: "permanentDeleteAfter", title: "Permanently deleted on", type: "datetime", description: "14 days after removal — the grace window." }),
  ],
  preview: {
    select: { title: "sourceDocumentTitle", subtitle: "permanentDeleteAfter" },
  },
});
