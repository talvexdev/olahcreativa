/**
 * Shared GROQ projections for Sanity → frontend media shapes.
 * Import here when adding new queries so Cloudinary fields stay consistent.
 */

export const cloudinaryImageProjection = `{
  "publicId": asset.public_id,
  "url": coalesce(asset.secure_url, asset.url),
  "width": asset.width,
  "height": asset.height,
  "format": asset.format,
  "resourceType": asset.resource_type,
  "pages": asset.pages,
  alt,
  caption
}`;

export const cloudinaryVideoProjection = `{
  "_type": "cloudinaryVideo",
  "publicId": asset.public_id,
  "url": coalesce(asset.secure_url, asset.url),
  "width": asset.width,
  "height": asset.height,
  "format": asset.format,
  "resourceType": asset.resource_type,
  alt,
  caption,
  autoplayMuted
}`;
