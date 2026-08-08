import { defineConfig } from "sanity";
import { structureTool } from "sanity/structure";
import { visionTool } from "@sanity/vision";
import { cloudinarySchemaPlugin } from "sanity-plugin-cloudinary";
import { muxInput } from "sanity-plugin-mux-input";

import { schemaTypes } from "./sanity/schemaTypes";
import { structure } from "./sanity/lib/structure";
import { RestoreTombstoneAction } from "./sanity/lib/tombstoneActions";

export default defineConfig({
  name: "default",
  title: "Portfolio Studio",

  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || "placeholder",
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || "production",
  basePath: "/studio",

  plugins: [
    structureTool({ structure }),
    visionTool(), // GROQ playground — dev/editor tool, not exposed publicly
    cloudinarySchemaPlugin(), // cloud name + API key configured once in Studio UI (secrets in dataset)
    muxInput({
      // Free-tier defaults — editors cannot override (disableUploadConfig).
      video_quality: "basic", // free encoding; Plus/Premium charge per minute
      max_resolution_tier: "1080p",
      mp4_support: "none", // paid static renditions — HLS only
      static_renditions: [],
      defaultPublic: true,
      defaultSigned: false,
      disableUploadConfig: true,
    }),
  ],

  schema: {
    types: schemaTypes,
  },

  document: {
    actions: (prev, context) =>
      context.schemaType === "mediaTombstone"
        ? [RestoreTombstoneAction, ...prev]
        : prev,
  },
});
