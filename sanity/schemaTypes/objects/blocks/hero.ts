import { defineType, defineField } from "sanity";

export default defineType({
  name: "heroBlock",      // internal ID — must match the key in PageBuilder.tsx
  title: "Hero",          // what Sarah sees in the "add block" menu
  type: "object",
  fields: [
    defineField({
      name: "eyebrow",
      title: "Small subtitle (above the title)",
      type: "string",
      description: "e.g. PRODUCTORA AUDIOVISUAL · FOTO & VIDEO",
    }),
    defineField({
      name: "heading",
      title: "Title",
      type: "string",
      validation: (R) => R.required(),   // Studio refuses to publish without it
    }),
    defineField({
      name: "headingAccent",
      title: "Title — accent part (shown in red)",
      type: "string",
      description: 'e.g. "como se merece."',
    }),
    defineField({
      name: "description",
      title: "Description",
      type: "text",     // "text" = multi-line box; "string" = single line
      rows: 3,
    }),
    defineField({ name: "ctaPrimary", title: "Button 1 (solid)", type: "link" }),
    defineField({ name: "ctaSecondary", title: "Button 2 (outline)", type: "link" }),
  ],
  preview: {
    select: { title: "heading", subtitle: "eyebrow" },  // how it appears collapsed in the list
  },
});
