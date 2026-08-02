import { defineType, defineField } from "sanity";

/**
 * Stores a reference to a Mux video asset (playbackId, status) plus editorial
 * metadata. Uploaded via sanity-plugin-mux-input directly in the Studio —
 * editors never see the Mux dashboard. Poster reuses the same cloudinaryImage
 * object so thumbnails go through the same optimized image pipeline as
 * everything else on the site.
 */
export default defineType({
  name: "muxVideo",
  title: "Video",
  type: "object",
  fields: [
    defineField({
      name: "asset",
      title: "Video file",
      type: "mux.video", // field type injected by sanity-plugin-mux-input
    }),
    defineField({
      name: "poster",
      title: "Poster image",
      type: "cloudinaryImage",
      description: "Shown before the video plays and while it's off-screen (lazy-loaded).",
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
    }),
    defineField({
      name: "autoplayMuted",
      title: "Use as muted autoplay background",
      type: "boolean",
      description: "Only enable for short, looped hero/background clips — never for a video with audio the visitor should hear.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "caption", media: "poster" },
  },
});
