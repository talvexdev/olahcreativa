# Agent standards — olahcreativa

> **Single source of truth.** Edit this file only.  
> Cursor (`.cursor/rules/`), `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` point here — do not duplicate standards elsewhere.

Stack: **Next.js 16 App Router** · **Sanity Studio v6** (`/studio`) · **Cloudinary** (images) · **Mux** (video) · **Tailwind CSS v4** · **Vercel**

Human setup (env, webhooks, accounts): see `README.md`.

---

## 1. Architecture & principles (SOLID / DRY)

- **Single responsibility**: blocks render one section; mappers live in `lib/`; Sanity client in `lib/sanity/client.ts`.
- **Open/closed**: extend via new block types + registry entries — avoid editing unrelated modules.
- **DRY**: one GROQ projection (`lib/sanity/projections.ts`), one image component (`components/media/cloudinary/CloudinaryImage.tsx`), shared mappers (`lib/page-builder/`). Never duplicate transform widths or projection strings.
- **Minimal diffs**: match existing naming, imports, and comment style. No drive-by refactors.
- **Server-first data**: Sanity fetches on the server only. No client-side GROQ. On-demand revalidation via webhook — **never** add `revalidate: N` interval polling.

### Language

| Surface | Language |
|---------|----------|
| File names, `_type` / schema `name`, code identifiers, code comments | **English** |
| Studio document/field `title`s, descriptions, structure UI, on-site UI copy, form messages | **Spanish** |

Examples: `_type: "heroBlock"` + file `Hero.tsx`, Studio title **"Portada"**. Seed/default copy in templates and forms is Spanish.

### Folder layout

```text
app/                            # routes + API only
  page.tsx                      # /  ← homepage singleton
  portfolio/page.tsx            # /portfolio
  work/[slug]/page.tsx         # project detail
  studio/…                      # embedded Sanity
  api/revalidate|webhooks/…

components/
  site/                         # Header, Footer, ThemeToggle
  media/                        # cloudinary/, MuxVideoPlayer, ProjectGallery
  forms/                        # BriefForm
  page-builder/                 # PageBuilder, CmsPage, blocks/*

lib/
  sanity/                       # client, queries, projections, block-types, page-slugs, page-heading
  cloudinary/                   # delivery (variants, urls, srcset) — keep top-level
  mux/                          # Mux extract helpers — keep top-level
  page-builder/                 # block/project normalizers (portfolio, image-grid, …)
  media-cleanup/                # tombstone extract helpers
  actions/                      # server actions (contact)
  json-ld.ts

sanity/                         # Studio-only
  schemaTypes/
    documents/                  # page, project, siteSettings, mediaTombstone
    objects/
      blocks/                   # English filenames matching _type
      cloudinaryImage.ts, muxVideo.ts, link.ts
  lib/                          # structure.ts, templates.ts, tombstoneActions.ts
sanity.config.ts
```

Do **not** nest `lib/cloudinary` or `lib/mux` under `lib/media`. Do **not** add free-form CMS routes like `app/[slug]` for pages.

### Key paths

| Concern | Path |
|---------|------|
| Sanity client / queries | `lib/sanity/client.ts`, `lib/sanity/queries.ts` |
| Page ids / public paths | `lib/sanity/page-slugs.ts` |
| Block types | `lib/sanity/block-types.ts` |
| Block normalizers | `lib/page-builder/` |
| Block registry | `components/page-builder/PageBuilder.tsx` |
| Shared CMS page render | `components/page-builder/CmsPage.tsx` |
| Image component | `components/media/cloudinary/CloudinaryImage.tsx` |
| Video component | `components/media/MuxVideoPlayer.tsx` |
| Page templates | `sanity/lib/templates.ts` |
| Studio structure | `sanity/lib/structure.ts` |
| Media cleanup | `lib/media-cleanup/extract.ts` |
| Design tokens | `app/globals.css` (`@theme`, CSS variables) |

---

## 2. Fixed pages & templates

Exactly **two** CMS pages — Studio **singletons** (not a document list create flow):

| Studio label | Document id | Public route | Template id |
|---|---|---|---|
| Inicio (/) | `homepage` | `/` (`app/page.tsx`) | `page-homepage` |
| Portafolio (/portfolio) | `pagePortfolio` | `/portfolio` (`app/portfolio/page.tsx`) | `page-portfolio` |

Constants: `HOME_PAGE_ID` / `PORTFOLIO_PAGE_ID` in `lib/sanity/page-slugs.ts`. Fetch with `pageByIdQuery`.

- **No page slug field** — routes are App Router files + document ids.
- **No** free-form page templates, blank “Page” create, or catch-all `/[slug]` for CMS pages.
- Templates: `sanity/lib/templates.ts`. Structure: `sanity/lib/structure.ts` (Spanish nav labels).
- Inicio seed order: Portada → Quiénes somos → Servicios → Más trabajos → Proceso → Contacto (`heroBlock` → `aboutBlock` → `servicesBlock` → `workCtaBlock` → `processBlock` → `contactBlock`). Portafolio is its own page (`/portfolio`), not part of the Inicio seed.
- Shared seed payloads: `sanity/lib/page-seed.ts` (page templates + `npm run seed:pages`). Script seeds `siteSettings` + both pages; create-if-missing by default; `--force` overwrites; `--dry-run` prints only. No Mux/Cloudinary assets in the seed.
- Portafolio seed: one `portfolioBlock` + `contactBlock`. Editors may insert more `portfolioBlock`s below the first.
- Shared render: `CmsPage` → `PageBuilder`. Header/Footer come from root `app/layout.tsx` (`siteSettings`), not page-builder modules — every page gets them.
- Until a singleton is published, its route 404s.

---

## 3. Page-builder modules (checklist)

Studio labels Spanish; code/files/`_type` English:

| Studio title | `_type` | Schema | Component |
|---|---|---|---|
| Portada | `heroBlock` | `objects/blocks/hero.ts` | `page-builder/blocks/Hero.tsx` |
| Quiénes somos | `aboutBlock` | `about.ts` | `About.tsx` |
| Servicios | `servicesBlock` | `services.ts` | `Services.tsx` |
| Más trabajos | `workCtaBlock` | `workCta.ts` | `WorkCta.tsx` |
| Proceso | `processBlock` | `process.ts` | `Process.tsx` |
| Contacto | `contactBlock` | `contact.ts` | `Contact.tsx` |
| Portafolio | `portfolioBlock` | `portfolio.ts` | `Portfolio.tsx` |
| Texto | `textBlock` | `textBlock.ts` | `TextBlock.tsx` |
| Galería | `imageGridBlock` | `imageGrid.ts` | `ImageGrid.tsx` |
| Testimonio | `testimonialBlock` | `testimonialBlock.ts` | `Testimonial.tsx` |
| Llamada a la acción | `ctaBlock` | `ctaBlock.ts` | `Cta.tsx` |

Portada may include optional `showcaseClips` (Mux/Cloudinary, max 3) + highlight card. Quiénes somos is copy + circular brand mark (`#nosotros`). Más trabajos is the full-width banner CTA (distinct from centered `ctaBlock`).

### Adding a block (four coordinated changes)

1. **Schema** — `sanity/schemaTypes/objects/blocks/myBlock.ts` + export in `schemaTypes/index.ts`
2. **Page allow-list** — `{ type: "myBlock" }` in `sanity/schemaTypes/documents/page.ts` → `pageBuilder.of[]`
3. **GROQ** — extend `pageProjection` inside `pageByIdQuery` in `lib/sanity/queries.ts` (use `lib/sanity/projections.ts` for media)
4. **Renderer** — `components/page-builder/blocks/MyBlock.tsx` + `BLOCK_TYPES` / switch in `PageBuilder.tsx` + type in `lib/sanity/block-types.ts`

`_type` / schema `name` / registry key must match exactly.

### Module rules

- Reuse `cloudinaryImage`, `muxVideo`, `link` — no parallel media types.
- Field `name`s English camelCase; Studio field `title`s / descriptions Spanish.
- Blocks receive `{ block }`; normalize with `normalizeCloudinaryImage()` or `lib/page-builder/` helpers.
- Prefer **Server Components**; `"use client"` only for interactivity (scroll scrub, forms, theme, video wrapper).
- Theme tokens only (`frame-label`, `text-accent`, `bg-card`, `max-w-8xl`, `px-6`) — no one-off hex in features.
- Incomplete blocks should **return `null`** (missing required heading, empty lists, empty portable text) rather than rendering empty chrome.
- Removable media on `page` → extend `walkPageBuilder` in `lib/media-cleanup/extract.ts`.

---

## 4. Environment & credentials

### `.env.local` / Vercel

| Variable | Purpose |
|----------|---------|
| `NEXT_PUBLIC_SANITY_*` | Sanity project + dataset |
| `SANITY_API_READ_TOKEN` | Server read |
| `SANITY_API_WRITE_TOKEN` | Media-cleanup webhook + local `npm run seed:pages` |
| `SANITY_REVALIDATE_SECRET` | Webhook signature (you generate — not from Sanity) |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | Delivery URLs |
| `RESEND_API_KEY` / `CONTACT_TO_EMAIL` | Contact/brief form (`contactBlock`) |
| `CONTACT_FROM_EMAIL` | Optional verified sender; else `onboarding@resend.dev` |
| `NEXT_PUBLIC_SITE_URL` | Sitemap, robots, JSON-LD |

Update `.env.local.example` when adding vars (comments only — never commit secrets).

### Studio uploads (stored in dataset, not env)

| Service | Where | What |
|---------|-------|------|
| Cloudinary | `/studio` → Configure Cloudinary on image arrays | Cloud name + **API key only** |
| Mux | `/studio` → Videos → Configure plugin | Token ID + secret |

**Never** put Cloudinary API secret in Studio. Mux upload tokens stay in the Studio plugin.

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

Page templates: only `page-homepage` and `page-portfolio` (filter out default blank `page`). Hide page templates from global Create — edit via structure singletons.

---

## 5. Images — Cloudinary (required)

### Rules

- All photos/posters → Sanity `cloudinaryImage` → `<CloudinaryImage />` from `@/components/media/cloudinary`.
- **Never** use `CldImage`, hardcoded `res.cloudinary.com` URLs, or inline widths in feature code.
- **`CloudinaryImage` is a Server Component** — native `<img>` with server-built `src` / `srcSet` from `lib/cloudinary/srcset.ts`.
- **Do not** pass `next/image` `loader` functions from Server Components (not serializable).
- **Do not** use `next-cloudinary` React upload/display components in the public app — Studio plugin only. URL helpers in `lib/cloudinary/` are fine.

```tsx
import { CloudinaryImage } from "@/components/media/cloudinary";
import { normalizeCloudinaryImage, cloudinaryImageUrl } from "@/lib/cloudinary";

<CloudinaryImage image={normalizeCloudinaryImage(block.photo)} variant="grid" />
cloudinaryImageUrl(publicId, "lightbox"); // lightbox / Mux placeholder only
```

### Variants (add sizes **only** in `lib/cloudinary/variants.ts`)

| Variant | Width | Typical use |
|---------|-------|-------------|
| `thumbnail` | 400 | Small thumbs |
| `grid` | 800 | Grids, clip tiles |
| `portrait` | 640 | Horizontal gallery strip |
| `hero` | 1920 | Full-width heroes |
| `lightbox` | 2000 | Lightbox / zoom |

**Animated images (GIF, animated WebP):** Cloudinary only — not Mux. GROQ projects `format` / `pages`; delivery uses animated-friendly transforms.

### GROQ

```typescript
import { cloudinaryImageProjection, muxVideoProjection } from "@/lib/sanity/projections";
```

Types: `SanityCloudinaryImage`, `CloudinaryPoster` from `@/lib/cloudinary`.  
SEO: `openGraphFromCloudinaryImage()` / `cloudinarySeoUrl()`.

---

## 6. Video — Mux (required)

- All video → Sanity `muxVideo` → `<MuxVideoPlayer />` from `@/components/media/MuxVideoPlayer`.
- **Every** `muxVideo` needs a **Cloudinary poster** (required in schema).
- Use `@mux/mux-player-react/lazy` with `loading="viewport"` via `MuxVideoPlayer`.
- `preload="none"`, `capRenditionToPlayerSize`, poster via `cloudinaryImageUrl(..., "hero")`.
- `autoplayMuted` only for short decorative loops.
- Portfolio clip tiles default to `autoplayMuted` when unset.
- Do not embed raw `stream.mux.com` or use `image.mux.com` for posters.

Project lightbox mapping: `mapProjectMediaToGalleryItems()` from `@/lib/page-builder`.

---

## 7. Free-tier performance (Cloudinary + Mux + Sanity)

| Vendor | Constraint | Mitigation |
|--------|------------|------------|
| Sanity | API usage | Server-only fetch; webhook revalidation only |
| Cloudinary | Transform credits | Fixed variants; `auto:good` / `auto` format |
| Mux Free | Assets + delivery minutes | Lazy viewport player; tombstones; Basic quality locked |
| Vercel | Bandwidth | Responsive `sizes`; don’t over-fetch hero on mobile |

- Register removable media in `lib/media-cleanup/extract.ts`.
- 14-day tombstone grace — restore in Studio; delete orphans manually in vendor consoles.

---

## 8. Responsive UI / UX

### Breakpoints (Tailwind — mobile-first)

| Prefix | Min width |
|--------|-----------|
| (none) | 0 |
| `sm:` | 640px |
| `md:` | 768px |
| `lg:` | 1024px |
| `xl:` | 1280px |
| `2xl:` | 1536px |

### Layout conventions

- Gutter `px-6`; max width `max-w-8xl` centered.
- Section rhythm `py-16`–`py-28`; gaps `gap-4` / `gap-8` / `space-y-16`.
- Typography: prefer `text-hero` / clamp for display headings.
- Grids: `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-3/4` (`ImageGrid`, Portfolio clips).

### Touch, images, video, motion

- Tap targets ~44×44px for primary controls.
- Horizontal scroll: `snap-x snap-mandatory`, `overflow-x-auto`, focus-visible ring.
- Always aspect-ratio wrappers to prevent CLS; use `<CloudinaryImage variant="…" />`.
- `priority={true}` only for LCP candidates.
- Variant by layout slot: full bleed → `hero`; grid → `grid`; strip → `portrait`/`thumbnail`; zoom → `lightbox`.
- Video: `aspect-video`; one muted autoplay max on small viewports.
- Respect `prefers-reduced-motion` (global in `globals.css`).

---

## 9. Accessibility (required)

- Alt text required on every `cloudinaryImage`.
- Decorative: `aria-hidden="true"`.
- `<button type="button">` for actions; `<Link>` for navigation.
- Horizontal scroll: `tabIndex={0}`, `role="region"`, `aria-label`.
- Keep `:focus-visible` outlines from `globals.css`.
- Icon-only controls: `aria-label`; SVGs `aria-hidden`.
- One accessible `<h1>` per CMS page (`CmsPage` sr-only via `getPageAccessibleHeading`); block titles `<h2>`+ without skipping.
- Landmarks: `<main>`, `<section>`, `<nav>`, `<header>`, `<footer>`.
- Don’t convey meaning by color alone.

### Block ship checklist

- [ ] Images have alt
- [ ] Video has poster + visible processing/error states
- [ ] Keyboard-reachable interactive elements
- [ ] Heading hierarchy correct
- [ ] Usable at 320px width without unintended horizontal page scroll

---

## 10. Do not

- Use Spanish identifiers for `_type`, filenames, or React/component names
- Use English for Studio field/document titles meant for editors
- Add free-form CMS pages, blank page templates, or `app/[slug]` for Sanity pages
- Inline `CldImage` / `CldUploadWidget` / manual Cloudinary URLs in feature code
- Pass `next/image` `loader` or function props from Server → Client Components
- Add `next-cloudinary` React components outside `/studio`
- Embed raw `stream.mux.com` or Mux image CDN for posters
- Add `revalidate: N` polling
- Store Cloudinary API secret in Studio
- Enable Mux Plus/Premium, DRM, static MP4, or 4K without approval
- Skip `lib/media-cleanup/extract.ts` when adding removable CMS media
- Invent breakpoints or image widths outside `variants.ts` / Tailwind scale
- Ship blocks without mobile layout and a11y checks
- Nest vendor packages under a catch-all `lib/media/` (keep `cloudinary/` and `mux/` top-level)

---

## 11. Changelog

When you change a standard, edit **this file** and add a one-line note below.

| Date | Change |
|------|--------|
| 2026-08-09 | Portafolio seed: portfolio + contact; seed siteSettings for header/footer; remove “Studio” brand fallback |
| 2026-08-09 | `npm run seed:pages` — shared `page-seed.ts`, guarded create/overwrite for page singletons |
| 2026-08-09 | `workCtaBlock` (Más trabajos) after Servicios in Inicio seed |
| 2026-08-09 | `aboutBlock` (Quiénes somos); Portada showcase clips + highlight; Inicio seed without Portafolio module |
| 2026-08-09 | Docs sync: language rules, folder layout, fixed pages (Inicio/Portafolio), module checklist, empty-block null returns |
| 2026-08-09 | Folder layout + English code / Spanish Studio-UI; `components/{site,media,forms,page-builder}`, `lib/{sanity,page-builder,media-cleanup}` |
| 2026-08-09 | Fixed page templates (Inicio `/`, Portafolio `/portfolio`); removed test/preview routes |
| 2026-08-08 | Initial consolidated standards (architecture, media, a11y, responsive, env) |
| 2026-08-08 | Cloudinary delivery: `auto:good` quality + capped responsive `next/image` loader |
| 2026-08-08 | CloudinaryImage: server-built srcSet + native `<img>` (no RSC loader / no CldImage) |
| 2026-08-08 | Removed scheduled cron media delete — tombstones + manual vendor cleanup only |
