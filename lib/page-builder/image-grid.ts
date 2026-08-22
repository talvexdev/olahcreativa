import { normalizeCloudinaryImage } from "@/lib/cloudinary";
import type { SanityCloudinaryImage } from "@/lib/cloudinary";

const COLUMN_CLASSES: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};

/** `sizes` aligned with COLUMN_CLASSES breakpoints (sm 640 / lg 1024), not the grid variant’s 768. */
const COLUMN_SIZES: Record<string, string> = {
  "2": "(max-width: 639px) 100vw, 50vw",
  "3": "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 33vw",
  "4": "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw",
};

export function normalizeImageGridItems(items: unknown[] | null | undefined): SanityCloudinaryImage[] {
  if (!Array.isArray(items)) return [];

  return items
    .map((item) => normalizeCloudinaryImage(item))
    .filter((image): image is SanityCloudinaryImage => image !== null);
}

export function getImageGridColumnClass(columns: string | undefined): string {
  return COLUMN_CLASSES[columns ?? "3"] ?? COLUMN_CLASSES["3"];
}

export function getImageGridSizes(columns: string | undefined): string {
  return COLUMN_SIZES[columns ?? "3"] ?? COLUMN_SIZES["3"];
}
