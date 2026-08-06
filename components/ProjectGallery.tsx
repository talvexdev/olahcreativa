"use client";

import { useState, useCallback } from "react";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import { CldImage } from "next-cloudinary";
import { MuxVideoPlayer } from "@/components/MuxVideoPlayer";

type ImageItem = {
  publicId: string;
  alt: string;
  caption?: string;
};

type VideoItem = {
  playbackId: string;
  poster?: { publicId: string; alt: string };
  caption?: string;
  autoplayMuted?: boolean;
};

type GalleryItem =
  | ({ type: "image" } & ImageItem)
  | ({ type: "video" } & VideoItem);

type Props = {
  items: GalleryItem[];
};

export function ProjectGallery({ items }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState(-1);

  const imageItems = items.filter((i): i is { type: "image" } & ImageItem => i.type === "image");

  const slides = imageItems.map((img) => ({
    src: `https://res.cloudinary.com/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload/w_2000,q_auto,f_auto/${img.publicId}`,
    alt: img.alt,
  }));

  const openLightbox = useCallback(
    (publicId: string) => {
      const idx = imageItems.findIndex((i) => i.publicId === publicId);
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
                poster={item.poster}
                autoplayMuted={item.autoplayMuted}
              />
            ) : (
              <button
                type="button"
                onClick={() => openLightbox(item.publicId)}
                className="relative block aspect-[3/2] w-full cursor-zoom-in"
                aria-label={`View ${item.alt} in lightbox`}
              >
                <CldImage
                  src={item.publicId}
                  alt={item.alt}
                  width={2000}
                  height={1333}
                  sizes="100vw"
                  quality="auto"
                  format="auto"
                  className="h-full w-full object-cover"
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
