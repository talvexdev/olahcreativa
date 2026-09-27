import { normalizeCloudinaryImage, normalizeCloudinaryVideo } from "@/lib/cloudinary";
import type { SanityCloudinaryImage, SanityCloudinaryVideo } from "@/lib/cloudinary";

export type GalleryImageItem = {
  type: "image";
  image: SanityCloudinaryImage;
  caption?: string;
};

export type GalleryVideoItem = {
  type: "video";
  video: SanityCloudinaryVideo;
  caption?: string;
};

export type GalleryItem = GalleryImageItem | GalleryVideoItem;

/** Maps a project `media[]` array from GROQ into gallery items for ProjectGallery. */
export function mapProjectMediaToGalleryItems(media: unknown[] | null | undefined): GalleryItem[] {
  if (!Array.isArray(media)) return [];

  return media.flatMap((item): GalleryItem[] => {
    if (!item || typeof item !== "object") return [];

    const record = item as Record<string, unknown>;
    const isVideo = record._type === "cloudinaryVideo" || record.resourceType === "video";

    if (isVideo) {
      const video = normalizeCloudinaryVideo(record);
      if (!video) return [];
      return [{ type: "video", video, caption: video.caption }];
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
