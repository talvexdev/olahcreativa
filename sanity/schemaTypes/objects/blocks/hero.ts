import { defineType, defineField } from "sanity";

export default defineType({
  name: "heroBlock",
  title: "Hero",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", validation: (R) => R.required() }),
    defineField({ name: "subheading", title: "Subheading", type: "text", rows: 2 }),
    defineField({
      name: "media",
      title: "Background media",
      type: "object",
      fields: [
        defineField({ name: "image", title: "Image (used if no video)", type: "cloudinaryImage" }),
        defineField({ name: "video", title: "Video (optional, takes priority)", type: "muxVideo" }),
      ],
    }),
  ],
  preview: { select: { title: "heading" } },
});
