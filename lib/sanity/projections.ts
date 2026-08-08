/**
 * Shared GROQ projections for Sanity → frontend media shapes.
 * Import here when adding new queries so Cloudinary/Mux fields stay consistent.
 */

export const cloudinaryImageProjection = `{
  "publicId": asset.public_id,
  "url": coalesce(asset.secure_url, asset.url),
  "width": asset.width,
  "height": asset.height,
  alt,
  caption
}`;

export const muxVideoProjection = `{
  "playbackId": asset->playbackId,
  "status": asset->status,
  poster ${cloudinaryImageProjection},
  caption,
  autoplayMuted
}`;
