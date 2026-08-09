import { normalizeCloudinaryImage, toCloudinaryPoster } from "@/lib/cloudinary";
import type { CloudinaryPoster, SanityCloudinaryImage } from "@/lib/cloudinary";

import { normalizeProjectedMuxVideo } from "./mux-video";

export type GalleryImageItem = {
  type: "image";
  image: SanityCloudinaryImage;
  caption?: string;
};

export type GalleryVideoItem = {
  type: "video";
  playbackId: string;
  status?: "preparing" | "ready" | "errored";
  poster?: CloudinaryPoster;
  caption?: string;
  autoplayMuted?: boolean;
};

export type GalleryItem = GalleryImageItem | GalleryVideoItem;

/** Maps a project `media[]` array from GROQ into gallery items for ProjectGallery. */
export function mapProjectMediaToGalleryItems(media: unknown[] | null | undefined): GalleryItem[] {
  if (!Array.isArray(media)) return [];

  return media.flatMap((item): GalleryItem[] => {
    if (!item || typeof item !== "object") return [];

    const record = item as Record<string, unknown>;
    const mux = normalizeProjectedMuxVideo(record);

    if (mux) {
      return [
        {
          type: "video",
          playbackId: mux.playbackId,
          status: mux.status,
          poster: toCloudinaryPoster(mux.poster) ?? undefined,
          caption: mux.caption,
          autoplayMuted: mux.autoplayMuted,
        },
      ];
    }

    const image = normalizeCloudinaryImage(record);
    if (!image) return [];

    return [
      {
        type: "image",
        image,
        caption: image.caption,
      },
    ];
  });
}
