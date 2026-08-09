import { normalizeCloudinaryImage } from "@/lib/cloudinary";
import type { SanityCloudinaryImage } from "@/lib/cloudinary";

const COLUMN_CLASSES: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
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
