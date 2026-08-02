import project from "./project";
import page from "./page";
import siteSettings from "./siteSettings";
import mediaTombstone from "./mediaTombstone";

import cloudinaryImage from "./objects/cloudinaryImage";
import muxVideo from "./objects/muxVideo";

import heroBlock from "./objects/blocks/hero";
import imageGridBlock from "./objects/blocks/imageGrid";
import textBlock from "./objects/blocks/textBlock";
import testimonialBlock from "./objects/blocks/testimonialBlock";
import ctaBlock from "./objects/blocks/ctaBlock";

export const schemaTypes = [
  // Documents
  project,
  page,
  siteSettings,
  mediaTombstone,
  // Reusable objects
  cloudinaryImage,
  muxVideo,
  // Page-builder blocks
  heroBlock,
  imageGridBlock,
  textBlock,
  testimonialBlock,
  ctaBlock,
];
