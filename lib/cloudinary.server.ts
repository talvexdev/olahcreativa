import { v2 as cloudinary } from "cloudinary";

let configured = false;

/** Server-only Admin API client for cron cleanup — Studio uploads use secrets in Sanity. */
function ensureCloudinaryConfig(): void {
  const cloud_name = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const api_key = process.env.CLOUDINARY_API_KEY;
  const api_secret = process.env.CLOUDINARY_API_SECRET;
  if (!cloud_name || !api_key || !api_secret) {
    throw new Error(
      "NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET are required for server-side Cloudinary operations"
    );
  }
  if (!configured) {
    cloudinary.config({ cloud_name, api_key, api_secret });
    configured = true;
  }
}

/** Deletes a Cloudinary asset by public_id; treats "not found" as success. */
export async function deleteCloudinaryAsset(publicId: string): Promise<void> {
  ensureCloudinaryConfig();
  const result = await cloudinary.uploader.destroy(publicId);
  if (result.result !== "ok" && result.result !== "not found") {
    throw new Error(`Cloudinary destroy failed: ${result.result}`);
  }
}
