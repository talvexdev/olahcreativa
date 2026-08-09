/** Stable platform ids — CMS list values + icon map keys. */

export const SOCIAL_PLATFORMS = [
  "instagram",
  "facebook",
  "youtube",
  "tiktok",
  "linkedin",
  "x",
  "whatsapp",
  "vimeo",
] as const;

export type SocialPlatformId = (typeof SOCIAL_PLATFORMS)[number];

export type SocialLink = {
  platform?: string;
  url?: string;
};

/** Spanish labels for Studio + accessible link names. */
export const SOCIAL_PLATFORM_LABELS: Record<SocialPlatformId, string> = {
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  linkedin: "LinkedIn",
  x: "X",
  whatsapp: "WhatsApp",
  vimeo: "Vimeo",
};

export const SOCIAL_PLATFORM_OPTIONS = SOCIAL_PLATFORMS.map((value) => ({
  title: SOCIAL_PLATFORM_LABELS[value],
  value,
}));

const PLATFORM_ALIASES: Record<string, SocialPlatformId> = {
  instagram: "instagram",
  ig: "instagram",
  facebook: "facebook",
  fb: "facebook",
  youtube: "youtube",
  yt: "youtube",
  tiktok: "tiktok",
  linkedin: "linkedin",
  x: "x",
  twitter: "x",
  whatsapp: "whatsapp",
  wa: "whatsapp",
  vimeo: "vimeo",
};

export function normalizeSocialPlatform(raw: unknown): SocialPlatformId | null {
  if (typeof raw !== "string") return null;
  const key = raw.trim().toLowerCase();
  return PLATFORM_ALIASES[key] ?? null;
}

export function socialPlatformLabel(platform: SocialPlatformId | string | undefined): string {
  const id = normalizeSocialPlatform(platform);
  if (id) return SOCIAL_PLATFORM_LABELS[id];
  if (typeof platform === "string" && platform.trim()) return platform.trim();
  return "Red social";
}
