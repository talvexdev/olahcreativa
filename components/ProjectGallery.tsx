"use client";

import { useState, useCallback } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";

import { CloudinaryImage } from "@/components/cloudinary";
import { cloudinaryImageUrl } from "@/lib/cloudinary";
import { MuxVideoPlayer } from "@/components/MuxVideoPlayer";
import type { GalleryItem } from "@/lib/media/gallery";

type Props = {
  items: GalleryItem[];
};

export function ProjectGallery({ items }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const imageItems = items.filter((item): item is Extract<GalleryItem, { type: "image" }> => item.type === "image");

  const slides = imageItems.map((item) => ({
    src: cloudinaryImageUrl(item.image.publicId, "lightbox"),
    alt: item.image.alt,
  }));

  const openLightbox = useCallback(
    (publicId: string) => {
      const idx = imageItems.findIndex((item) => item.image.publicId === publicId);
      if (idx >= 0) setLightboxIndex(idx);
    },
    [imageItems]
  );

  return (
    <>
      <div className="flex flex-col gap-1 bg-line">
        {items.map((item, i) => (
          <div key={i} className="relative bg-card">
            {item.type === "video" ? (
              <MuxVideoPlayer
                playbackId={item.playbackId}
                status={item.status}
                poster={item.poster}
                autoplayMuted={item.autoplayMuted}
                title={item.caption}
              />
            ) : (
              <button
                type="button"
                onClick={() => openLightbox(item.image.publicId)}
                className="relative block aspect-[3/2] w-full cursor-zoom-in"
                aria-label={`View ${item.image.alt} in lightbox`}
              >
                <CloudinaryImage
                  image={item.image}
                  variant="hero"
                  priority={i === 0}
                />
              </button>
            )}
            {item.caption && (
              <p className="frame-label px-6 py-3">{item.caption}</p>
            )}
          </div>
        ))}
      </div>

      <Lightbox
        open={lightboxIndex >= 0}
        close={() => setLightboxIndex(-1)}
        index={lightboxIndex}
        slides={slides}
        styles={{
          container: { backgroundColor: "rgba(27, 31, 26, 0.97)" },
        }}
      />
    </>
  );
}
