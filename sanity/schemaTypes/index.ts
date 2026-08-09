import project from "./documents/project";
import page from "./documents/page";
import siteSettings from "./documents/siteSettings";
import mediaTombstone from "./documents/mediaTombstone";

import cloudinaryImage from "./objects/cloudinaryImage";
import muxVideo from "./objects/muxVideo";
import link from "./objects/link";

import heroBlock from "./objects/blocks/hero";
import aboutBlock from "./objects/blocks/about";
import imageGridBlock from "./objects/blocks/imageGrid";
import textBlock from "./objects/blocks/textBlock";
import testimonialBlock from "./objects/blocks/testimonialBlock";
import ctaBlock from "./objects/blocks/ctaBlock";
import workCtaBlock from "./objects/blocks/workCta";
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
  aboutBlock,
  imageGridBlock,
  textBlock,
  testimonialBlock,
  ctaBlock,
  workCtaBlock,
  processBlock,
  servicesBlock,
  contactBlock,
  portfolioBlock,
];

