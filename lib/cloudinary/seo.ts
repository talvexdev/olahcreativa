import type { Metadata } from "next";

import { cloudinarySeoUrl } from "./url";
import type { SanityCloudinaryImage } from "./types";

export function openGraphFromCloudinaryImage(
  image: SanityCloudinaryImage | null | undefined
): Pick<Metadata, "openGraph"> | undefined {
  const url = cloudinarySeoUrl(image);
  if (!url) return undefined;
  return { openGraph: { images: [{ url }] } };
}
