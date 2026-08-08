import { defineType, defineField } from "sanity";

/**
 * Tracking record for the media-cleanup workflow.
 * Written by the delete/replace webhook and surfaced in Studio as a plain-language
 * "pending removal" list with a restore action (delete this document to cancel).
 * Permanently remove the underlying asset in Cloudinary or Mux after the grace window.
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
    defineField({ name: "permanentDeleteAfter", title: "Grace period ends", type: "datetime", description: "14 days after removal — delete the asset in Cloudinary/Mux after this date if still unused." }),
  ],
  preview: {
    select: { title: "sourceDocumentTitle", subtitle: "permanentDeleteAfter" },
  },
});
