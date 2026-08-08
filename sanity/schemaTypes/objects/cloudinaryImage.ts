import { defineType, defineField } from "sanity";

/**
 * Stores a reference to a Cloudinary-hosted image, not the binary itself.
 * Populated via sanity-plugin-cloudinary's Media Library picker in the Studio.
 * `alt` is required at the schema level — this is the accessibility
 * enforcement point discussed in planning: editors are prompted for it
 * every time, it's never optional.
 */
export default defineType({
  name: "cloudinaryImage",
  title: "Image",
  type: "object",
  fields: [
    defineField({
      name: "asset",
      title: "Cloudinary asset",
      type: "cloudinary.asset", // field type injected by sanity-plugin-cloudinary
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "alt",
      title: "Alt text",
      type: "string",
      description: "Required. Describe what's in the photo — this is read aloud by screen readers and used for SEO image search.",
      validation: (Rule) => Rule.required().warning("Every image needs alt text."),
    }),
    defineField({
      name: "caption",
      title: "Caption",
      type: "string",
      description: "Optional. Shown on-page beneath the image (e.g. location, client, context).",
    }),
  ],
  preview: {
    select: { title: "alt", media: "asset" },
  },
});
