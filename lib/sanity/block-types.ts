import type { PortableTextBlock } from "next-sanity";

import type { SanityCloudinaryImage } from "@/lib/cloudinary";

/** Shared CMS link object (`sanity/schemaTypes/objects/link.ts`). */
export type SanityLink = {
  label?: string;
  href?: string;
};

export type HeroBlockData = {
  _type: "heroBlock";
  _key?: string;
  eyebrow?: string;
  heading?: string;
  headingAccent?: string;
  description?: string;
  ctaPrimary?: SanityLink;
  ctaSecondary?: SanityLink;
};

export type ImageGridBlockData = {
  _type: "imageGridBlock";
  _key?: string;
  heading?: string;
  columns?: "2" | "3" | "4" | string;
  items?: unknown[];
};

export type PortfolioBlockData = {
  _type: "portfolioBlock";
  _key?: string;
  eyebrow?: string;
  heading?: string;
  headingAccent?: string;
  description?: string;
  projects?: unknown[];
};

export type TextBlockData = {
  _type: "textBlock";
  _key?: string;
  heading?: string;
  width?: string;
  content?: PortableTextBlock[];
};

export type TestimonialBlockData = {
  _type: "testimonialBlock";
  _key?: string;
  quote?: string;
  attribution?: string;
};

export type CtaBlockData = {
  _type: "ctaBlock";
  _key?: string;
  heading?: string;
  buttonHref?: string;
  buttonLabel?: string;
};

export type ProcessStep = {
  title?: string;
  description?: string;
  timecode?: string;
  label?: string;
};

export type ProcessBlockData = {
  _type: "processBlock";
  _key?: string;
  eyebrow?: string;
  heading?: string;
  headingAccent?: string;
  steps?: ProcessStep[];
};

export type ServiceItem = {
  title?: string;
  description?: string;
  badge?: string;
};

export type ServicesBlockData = {
  _type: "servicesBlock";
  _key?: string;
  eyebrow?: string;
  heading?: string;
  headingAccent?: string;
  services?: ServiceItem[];
};

export type ContactBlockData = {
  _type: "contactBlock";
  _key?: string;
  eyebrow?: string;
  heading?: string;
  headingAccent?: string;
  description?: string;
  links?: SanityLink[];
  formTitle?: string;
  interests?: string[];
  submitLabel?: string;
};

export type PageBuilderBlock =
  | HeroBlockData
  | ImageGridBlockData
  | PortfolioBlockData
  | TextBlockData
  | TestimonialBlockData
  | CtaBlockData
  | ProcessBlockData
  | ServicesBlockData
  | ContactBlockData;

export type BlockProps<T extends PageBuilderBlock = PageBuilderBlock> = {
  block: T;
};

export type { SanityCloudinaryImage };
