import project from "./project";
import page from "./page";
import siteSettings from "./siteSettings";
import mediaTombstone from "./mediaTombstone";

import cloudinaryImage from "./objects/cloudinaryImage";
import muxVideo from "./objects/muxVideo";
import link from "./objects/link";

import heroBlock from "./objects/blocks/hero";
import imageGridBlock from "./objects/blocks/imageGrid";
import textBlock from "./objects/blocks/textBlock";
import testimonialBlock from "./objects/blocks/testimonialBlock";
import ctaBlock from "./objects/blocks/ctaBlock";
import processBlock from "./objects/blocks/process";
import servicesBlock from "./objects/blocks/services";
import contactBlock from "./objects/blocks/contact";
import portfolioBlock from "./objects/blocks/portfolio";

export const schemaTypes = [
  // Documents
  project,
  page,
  siteSettings,
  mediaTombstone,
  // Reusable objects
  cloudinaryImage,
  muxVideo,
  link,
  // Page-builder blocks
  heroBlock,
  imageGridBlock,
  textBlock,
  testimonialBlock,
  ctaBlock,
  processBlock,
  servicesBlock,
  contactBlock,
  portfolioBlock,
];
