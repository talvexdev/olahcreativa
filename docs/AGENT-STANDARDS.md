# Agent standards — olahcreativa

> **Single source of truth.** Edit this file only.  
> Cursor (`.cursor/rules/`), `AGENTS.md`, and `CLAUDE.md` point here — do not duplicate content elsewhere.

Stack: **Next.js 16 App Router** · **Sanity Studio v6** (`/studio`) · **Cloudinary** (images) · **Mux** (video) · **Tailwind CSS v4** · **Vercel**

Human setup (env, webhooks, accounts): see `README.md`.

---

## 1. Architecture & principles (SOLID / DRY)

- **Single responsibility**: blocks render one section; mappers live in `lib/`; server-only clients in `*.server.ts`.
- **Open/closed**: extend via new block types + registry entries — avoid editing unrelated modules.
- **DRY**: one GROQ projection (`lib/sanity/projections.ts`), one image component (`components/cloudinary/CloudinaryImage.tsx`), shared mappers (`lib/media/`). Never duplicate transform widths or projection strings.
- **Minimal diffs**: match existing naming, imports, and comment style. No drive-by refactors.
- **Server-first data**: Sanity fetches on the server only. No client-side GROQ. On-demand revalidation via webhook — **never** add `revalidate: N` interval polling.

### Key paths

| Concern | Path |
|---------|------|
| Cloudinary infra | `lib/cloudinary/` |
| GROQ projections | `lib/sanity/projections.ts` |
| Gallery mapping | `lib/media/gallery.ts` |
| Image component | `components/cloudinary/CloudinaryImage.tsx` |
| Video component | `components/MuxVideoPlayer.tsx` |
| Block registry | `components/PageBuilder.tsx` |
| Media cleanup | `lib/media-extract.ts` |
| Design tokens | `app/globals.css` (`@theme`, CSS variables) |

---

## 2. Page-builder modules (checklist)

Adding a block requires **four coordinated changes**:

1. **Schema** — `sanity/schemaTypes/objects/blocks/myBlock.ts` + export in `schemaTypes/index.ts`
2. **Page allow-list** — `{ type: "myBlock" }` in `sanity/schemaTypes/page.ts` → `pageBuilder.of[]`
3. **GROQ** — extend `pageBySlugQuery` in `lib/queries.ts` (import from `lib/sanity/projections.ts`)
4. **Renderer** — `components/blocks/MyBlock.tsx` + key in `PageBuilder.tsx` `BLOCKS` map

Block `_type` / schema `name` / registry key must match exactly.

- Reuse `cloudinaryImage`, `muxVideo`, `link` objects — no parallel media types.
- Spanish Studio labels OK; internal `name` values in camelCase English.
- Blocks receive `{ block }`; normalize Sanity data with `normalizeCloudinaryImage()` or block-specific normalizers in `lib/`.
- Prefer **Server Components**; add `"use client"` only for interactivity (lightbox, theme toggle, video player wrapper).
- Use theme tokens (`frame-label`, `text-accent`, `bg-card`, `max-w-8xl`, `px-6`) — no one-off hex colors.

If the block has removable media on `page` documents → extend `walkPageBuilder` in `lib/media-extract.ts`.

---

## 3. Environment & credentials

### `.env.local` / Vercel (server + Next.js delivery)

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SANITY_*` | Sanity project + dataset |
| `SANITY_API_READ_TOKEN` | Server read |
| `SANITY_API_WRITE_TOKEN` | Webhooks + cron |
| `SANITY_REVALIDATE_SECRET` | Webhook signature (you generate this — not from Sanity) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | `next-cloudinary` / delivery URLs |
| `CLOUDINARY_API_KEY` + `CLOUDINARY_API_SECRET` | Cron Admin API delete only |
| `MUX_TOKEN_ID` + `MUX_TOKEN_SECRET` | Cron Mux delete only |
| `CRON_SECRET` | Vercel cron auth |

Update `.env.local.example` when adding new env vars (comments only — never commit secrets).

### Studio (upload paths — stored in Sanity dataset, not env)

| Service | Where configured | What to enter |
|---------|------------------|---------------|
| Cloudinary | `/studio` → Configure Cloudinary on image arrays | Cloud name + **API key only** (no secret) |
| Mux | `/studio` → Videos → Configure plugin | Token ID + secret |

**Never** put Cloudinary API secret or Mux tokens in Studio UI incorrectly — secrets in env are for **cron/server**, not editor uploads (except Mux Studio token in plugin UI).

### `sanity.config.ts` — do not relax without explicit approval

```typescript
muxInput({
  video_quality: "basic",
  max_resolution_tier: "1080p",
  mp4_support: "none",
  static_renditions: [],
  defaultPublic: true,
  defaultSigned: false,
  disableUploadConfig: true,
})
```

---

## 4. Images — Cloudinary (required)

### Rules

- All photos/posters → Sanity `cloudinaryImage` → `<CloudinaryImage />`.
- **Never** use `CldImage`, hardcoded `res.cloudinary.com` URLs, or inline widths in feature code.
- **`CloudinaryImage` is a Server Component.** It renders a native `<img>` with server-built `src` + `srcSet` strings from `lib/cloudinary/srcset.ts`.
- **Do not** pass `next/image` `loader` functions from Server Components — Next.js 16 treats `next/image` as a Client boundary and functions are not serializable (runtime error).
- **Do not** use `CldImage` / `CldUploadWidget` / other `next-cloudinary` React components in feature code — they use client hooks and may inject `<script>` tags (React 19 runtime error). URL helpers (`getCldImageUrl`, `buildCloudinaryDeliveryUrl`) are fine in `lib/cloudinary/`.

```tsx
import { CloudinaryImage } from "@/components/cloudinary";
import { normalizeCloudinaryImage, cloudinaryImageUrl } from "@/lib/cloudinary";

<CloudinaryImage image={normalizeCloudinaryImage(block.photo)} variant="grid" />
// Plain URL only when required (lightbox, Mux placeholder):
cloudinaryImageUrl(publicId, "lightbox");
```

### Variants (add new sizes **only** in `lib/cloudinary/variants.ts`)

| Variant | Width | Typical use |
|---------|-------|-------------|
| `thumbnail` | 400 | Small thumbs |
| `grid` | 800 | Grids, clip tiles |
| `portrait` | 640 | Horizontal gallery strip |
| `hero` | 1920 | Full-width heroes |
| `lightbox` | 2000 | Lightbox / zoom |

Each variant defines `sizes` for responsive `srcset` — do not override per component.

### GROQ

```typescript
import { cloudinaryImageProjection, muxVideoProjection } from "@/lib/sanity/projections";
```

Types: `SanityCloudinaryImage`, `CloudinaryPoster` from `@/lib/cloudinary`.

SEO: `openGraphFromCloudinaryImage()` / `cloudinarySeoUrl()` in metadata and JSON-LD.

---

## 5. Video — Mux (required)

- All video → Sanity `muxVideo` → `<MuxVideoPlayer />`.
- **Every** `muxVideo` must include a **Cloudinary poster** (`cloudinaryImage`) — required in schema.
- Use `@mux/mux-player-react/lazy` with `loading="viewport"` (via `MuxVideoPlayer`).
- `preload="none"`, `capRenditionToPlayerSize`, poster URL via `cloudinaryImageUrl(..., "hero")`.
- `autoplayMuted` only for short decorative loops — never for content with audio users should hear.
- Do not embed raw `stream.mux.com` or use `image.mux.com` for posters.

Project galleries: `mapProjectMediaToGalleryItems()` from `@/lib/media/gallery`.

---

## 6. Free-tier performance (Cloudinary + Mux + Sanity)

| Vendor | Constraint | Mitigation in code |
|--------|------------|-------------------|
| Sanity | API usage | Server-only fetch; webhook revalidation only |
| Cloudinary | 25 credits/mo; transforms counted once per unique derivative | Fixed variants; `quality="auto:good"` `format="auto"`; capped responsive loader |
| Mux Free | 10 stored assets; 100K delivery min/mo | Lazy viewport player; tombstone + cron delete; Basic quality locked |
| Vercel | Bandwidth | Responsive `sizes`; don't over-fetch hero width on mobile |

- Register new removable media in `lib/media-extract.ts`.
- 14-day tombstone grace before permanent delete.

---

## 7. Responsive UI / UX

### Breakpoints (Tailwind defaults — mobile-first)

| Prefix | Min width | Use |
|--------|-----------|-----|
| (none) | 0 | Mobile base styles |
| `sm:` | 640px | Large phones / small tablets |
| `md:` | 768px | Tablets |
| `lg:` | 1024px | Laptops |
| `xl:` | 1280px | Desktops |
| `2xl:` | 1536px | Large desktops |

**Always mobile-first**: base layout for small screens, add `sm:` / `md:` / `lg:` enhancements.

### Layout conventions (this project)

- Page gutter: `px-6`; max content width: `max-w-8xl` (96rem) centered.
- Section vertical rhythm: `py-16`–`py-28` for blocks; consistent gap scales (`gap-4`, `gap-8`, `space-y-16`).
- Typography: `text-hero` uses `clamp()` — prefer clamp/fluid type over fixed px for headings.
- Grids: `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-3/4` (see `ProjectGrid`, `ImageGrid`, Portfolio clips).

### Touch & spacing

- Minimum tap targets ~44×44px for primary controls (buttons, gallery scroll areas).
- Horizontal scroll galleries: `snap-x snap-mandatory`, `overflow-x-auto`, visible focus ring on container (`focus-visible:outline-accent`).

### Responsive images (performance + layout)

- **Always** wrap images in aspect-ratio containers (`aspect-video`, `aspect-[3/4]`, `aspect-[4/5]`) to prevent CLS.
- Use `<CloudinaryImage variant="…" />` — it applies variant `sizes` automatically.
- `priority={true}` only for **LCP candidates** (first visible hero / first 1–3 grid tiles above fold) — not every image.
- Pick variant by **layout slot**, not by guessing pixel width:
  - Full bleed → `hero`
  - Grid cell → `grid`
  - Narrow strip tile → `portrait` or `thumbnail`
  - Lightbox → `lightbox`

### Responsive video

- Container: `aspect-video w-full overflow-hidden` (or project `MediaFrame` pattern).
- Lazy mount at viewport — never load HLS for off-screen clips.
- Hero overlay text: gradient scrim (`from-bg via-bg/80`) so titles stay readable on any frame.
- On narrow viewports, avoid multiple simultaneous autoplay videos — one muted hero max.

### Motion

- `prefers-reduced-motion: reduce` is handled globally in `globals.css` — don't add animations that bypass it.
- Hover transforms (`group-hover:scale-105`) are fine; avoid auto-playing carousels.

---

## 8. Accessibility (required)

- **Alt text** required on every `cloudinaryImage` (schema validation).
- Decorative elements: `aria-hidden="true"`.
- `<button type="button">` for actions; `<Link>` for navigation.
- Horizontal scroll: `tabIndex={0}`, `role="region"`, descriptive `aria-label`.
- Preserve `:focus-visible` outlines (`globals.css` — do not remove).
- Icon-only buttons: `aria-label`; SVG icons `aria-hidden`.
- One `<h1>` per page; block titles use `<h2>`+ without skipping levels.
- Landmarks: `<main>`, `<section>`, `<article>`, `<nav>`, `<header>`, `<footer>`.
- Don't convey information by color alone — pair with text/icons.

### Block ship checklist

- [ ] All images have alt
- [ ] Video has poster + alt; processing/error states visible
- [ ] Keyboard reachable interactive elements
- [ ] Heading hierarchy correct
- [ ] Responsive down to 320px width without horizontal page scroll (except intentional scroll regions)

---

## 9. Do not

- Inline `CldImage`, `CldUploadWidget`, or manual Cloudinary URLs in feature code
- Pass `next/image` `loader` or any function props from Server Components into Client Components
- Add `next-cloudinary` React components outside `/studio` (Sanity plugin handles uploads there)
- Embed raw `stream.mux.com` or use `image.mux.com` for posters
- Add `revalidate: N` polling intervals
- Store Cloudinary API secret in Studio UI
- Enable Mux Plus/Premium, DRM, static MP4, or 4K without explicit approval
- Skip `lib/media-extract.ts` when adding removable CMS media
- Invent breakpoints or image widths outside `variants.ts` and Tailwind scale
- Ship blocks without mobile layout and a11y checks

---

## 10. Changelog

When you change a standard, edit **this file** and add a one-line note below.

| Date | Change |
|------|--------|
| 2026-08-08 | Initial consolidated standards (architecture, media, a11y, responsive, env) |
| 2026-08-08 | Cloudinary delivery: `auto:good` quality + capped responsive `next/image` loader |
| 2026-08-08 | CloudinaryImage: server-built srcSet + native `<img>` (no RSC loader / no CldImage) |
