import { defineType, defineField } from "sanity";

export default defineType({
  name: "ctaBlock",
  title: "Call to action",
  type: "object",
  fields: [
    defineField({ name: "heading", title: "Heading", type: "string", validation: (R) => R.required() }),
    defineField({ name: "buttonLabel", title: "Button label", type: "string", initialValue: "Get in touch" }),
    defineField({ name: "buttonHref", title: "Button link", type: "string", description: "e.g. /contact or mailto:studio@brand.com" }),
  ],
  preview: { select: { title: "heading" } },
});
