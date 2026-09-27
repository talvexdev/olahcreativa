import { defineType, defineField } from "sanity";

/**
 * Cloudinary-hosted video. Editors pick the file in the same Media Library as
 * images (Videos tab). Playback is one capped MP4 — see `CLOUDINARY_VIDEO_VARIANTS`.
 */
export default defineType({
  name: "cloudinaryVideo",
  title: "Video",
  type: "object",
  fields: [
    defineField({
      name: "asset",
      title: "Archivo de video",
      type: "cloudinary.asset",
      description:
        "En la biblioteca de Cloudinary, abre la pestaña Videos. Un clip corto en bucle cabe mejor en el plan gratuito que un filme largo.",
      validation: (Rule) =>
        Rule.required().custom((value: { resource_type?: string } | undefined) => {
          if (!value?.resource_type || value.resource_type === "video") return true;
          return "Elige un video de Cloudinary, no una imagen.";
        }),
    }),
    defineField({
      name: "alt",
      title: "Texto alternativo",
      type: "string",
      description:
        "Obligatorio. Describe el clip para lectores de pantalla. El póster se genera del primer fotograma.",
      validation: (Rule) => Rule.required(),
    }),
    defineField({
      name: "caption",
      title: "Pie",
      type: "string",
    }),
    defineField({
      name: "autoplayMuted",
      title: "Reproducir en silencio como fondo",
      type: "boolean",
      description:
        "Solo para clips cortos en bucle. No lo actives si el visitante debe escuchar el audio.",
      initialValue: false,
    }),
  ],
  preview: {
    select: { title: "alt", subtitle: "caption", media: "asset" },
  },
});
