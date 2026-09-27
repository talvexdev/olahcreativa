# Agent standards — olahcreativa

> **Single source of truth.** Edit this file only.  
> Cursor (`.cursor/rules/`), `AGENTS.md`, `CLAUDE.md`, and `.github/copilot-instructions.md` point here — do not duplicate standards elsewhere.

Stack: **Next.js 16 App Router** · **Sanity Studio v6** (`/studio`) · **Cloudinary** (images) · **Mux** (video) · **Tailwind CSS v4** · **Vercel**

Human setup (env, webhooks, accounts): see `README.md`.

---

## 1. Architecture & principles (SOLID / DRY)

- **Single responsibility**: blocks render one section; mappers live in `lib/`; Sanity client in `lib/sanity/client.ts`.
- **Open/closed**: extend via new block types + registry entries — avoid editing unrelated modules.
- **DRY**: one GROQ projection (`lib/sanity/projections.ts`), one image component (`components/media/cloudinary/CloudinaryImage.tsx`), shared mappers (`lib/page-builder/`). Seed copy lives once in `sanity/lib/page-seed.ts`. Never duplicate transform widths or projection strings.
- **Minimal diffs**: match existing naming, imports, and comment style. No drive-by refactors.
- **Server-first data**: Sanity fetches on the server only. No client-side GROQ. On-demand revalidation via webhook — **never** add `revalidate: N` interval polling.

### Language

| Surface | Language |
|---------|----------|
| File names, `_type` / schema `name`, code identifiers, code comments | **English** |
| Studio document/field `title`s, descriptions, structure UI, on-site UI copy, form messages, seed copy | **Spanish** |

Examples: `_type: "heroBlock"` + file `Hero.tsx`, Studio title **"Portada"**.

### Folder layout

```text
app/                            # routes + API only
  page.tsx                      # /  ← homepage singleton
  portfolio/page.tsx            # /portfolio
  work/[slug]/page.tsx         # project detail
  studio/…                      # embedded Sanity
  api/revalidate|webhooks/…

components/
  site/                         # Header, HeaderShell, SiteNav, Footer, SocialIcon, ThemeToggle
  media/                        # cloudinary/, MuxVideoPlayer, ProjectGallery
  forms/                        # BriefForm
  page-builder/                 # PageBuilder, CmsPage, blocks/*

lib/
  sanity/                       # client, queries, projections, block-types, page-slugs, page-heading
  cloudinary/                   # delivery (variants, urls, srcset) — keep top-level
  mux/                          # Mux extract helpers — keep top-level
  page-builder/                 # anchors, hero/portfolio/image-grid normalizers
  site/                         # social platform ids/labels (footer icons)
  media-cleanup/                # tombstone extract helpers
  actions/                      # server actions (contact)
  json-ld.ts

scripts/
  seed-pages.ts                 # local CLI seed (not an HTTP route)

sanity/                         # Studio-only
  schemaTypes/
    documents/                  # page, project, siteSettings, mediaTombstone
    objects/
      blocks/                   # English filenames matching _type
      anchorId.ts               # shared optional section anchor field
      cloudinaryImage.ts, muxVideo.ts, link.ts
  lib/                          # structure.ts, templates.ts, page-seed.ts, tombstoneActions.ts
sanity.config.ts
```

Do **not** nest `lib/cloudinary` or `lib/mux` under `lib/media`. Do **not** add free-form CMS routes like `app/[slug]` for pages.

### Key paths

| Concern | Path |
|---------|------|
| Sanity client / queries | `lib/sanity/client.ts`, `lib/sanity/queries.ts` |
| Page ids / public paths | `lib/sanity/page-slugs.ts` |
| Block types | `lib/sanity/block-types.ts` |
| Section anchors | `lib/page-builder/anchors.ts` + `sanity/schemaTypes/objects/anchorId.ts` |
| Block normalizers | `lib/page-builder/` |
| Block registry | `components/page-builder/PageBuilder.tsx` |
| Shared CMS page render | `components/page-builder/CmsPage.tsx` |
| Header / nav | `components/site/Header.tsx`, `SiteNav.tsx`, `HeaderShell.tsx` |
| Footer / social icons | `components/site/Footer.tsx`, `SocialIcon.tsx`, `lib/site/social.ts` |
| Seed payloads | `sanity/lib/page-seed.ts` |
| Seed CLI | `scripts/seed-pages.ts` → `npm run seed:pages` |
| Page templates | `sanity/lib/templates.ts` (imports `page-seed`) |
| Image / video | `components/media/cloudinary/CloudinaryImage.tsx`, `MuxVideoPlayer.tsx` |
| Design tokens | `app/globals.css` (`@theme`, CSS variables, `--site-header-height`) |

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
- Templates: `sanity/lib/templates.ts` (values from `page-seed.ts`). Structure: `sanity/lib/structure.ts` (Spanish nav labels). Singleton list item ids must **not** match template ids (`page-homepage` / `page-portfolio`) — that collision opens a create-template pane and blocks editing the existing Portafolio page. Use `singleton-homepage` / `singleton-page-portfolio` and **no** `initialValueTemplate` on documents that already exist.
- Shared render: `CmsPage` → `PageBuilder`. Until a singleton is published, its route 404s.

### Seeded module order

| Page | `pageBuilder` order |
|------|---------------------|
| Inicio | Portada → Quiénes somos → Servicios → Proceso → Contacto |
| Portafolio | Portafolio → Más trabajos → Contacto (editors may insert more `portfolioBlock`s below the first) |

`_type` chain (Inicio): `heroBlock` → `aboutBlock` → `servicesBlock` → `processBlock` → `contactBlock`.

`_type` chain (Portafolio): `portfolioBlock` → `workCtaBlock` → `contactBlock`. `/portfolio` inserts Más trabajos after the first Portafolio module when the CMS document is missing it.

Portafolio is **not** part of the Inicio seed. Más trabajos (`workCtaBlock`) is **not** on Inicio — the `/` route also drops leftover `workCtaBlock`s so an old published document cannot keep rendering that module.

---

## 3. Seeding (`npm run seed:pages`)

- **Payloads:** `sanity/lib/page-seed.ts` — single source for Studio templates + CLI.
- **Script:** `scripts/seed-pages.ts` (local only; loads `.env.local`).
- **Seeds:** `siteSettings` (header/footer/nav/social) + `homepage` + `pagePortfolio`.
- **Guards:** require project id, dataset, `SANITY_API_WRITE_TOKEN` (`sk…`); skip if published/draft exists unless `--force`; `--dry-run` prints only; `--force` replaces published and deletes matching drafts.
- **No media in seed:** Mux/Cloudinary assets, logos, and portfolio projects are added in the CMS editor.
- **Do not** expose seeding as a public API route or cron.

```bash
npm run seed:pages              # create if missing
npm run seed:pages -- --dry-run
npm run seed:pages -- --force   # overwrite (use deliberately)
```

---

## 4. Site chrome — header, footer, navigation

Header/footer are **global** (`siteSettings` + `app/layout.tsx`), not page-builder modules.

### Brand fallback

If `brandName` is missing, UI falls back to **"Olah Creativa"** — never a generic “Studio” label.

### Header height & full-viewport sections

- `HeaderShell` measures the sticky header and sets `--site-header-height` on `:root` (updates on resize/orientation).
- CSS fallback: `--site-header-height: 4.5rem` in `globals.css`.
- `html { scroll-padding-top: var(--site-header-height); }` for hash links under the sticky bar.
- Put section `id`s on the **outer module** (`<section>`) so hash nav includes top spacing; `scroll-padding-top` clears the sticky header.
- `SiteNav` manually `scrollIntoView`s same-page hash clicks (Next may not re-scroll).
- Portada (and any full-viewport module) is `min-height: 100dvh` and sits **under** the sticky header: `-mt-[var(--site-header-height)]` + matching top padding so copy isn’t hidden. `#portada` starts at y = 0. This overlap is header chrome only — do not pull modules over each other.

### Navigation (curated, flat)

- Editors manage links in **Ajustes del sitio → Enlaces de navegación** (label + href).
- Keep a **short flat list** (about 4–6 items). Prefer hash links to Inicio sections and a route to `/portfolio`.
- **Default seed nav:** Portada `/#portada` · Quiénes somos `/#nosotros` · Servicios `/#servicios` · Proceso `/#proceso` · Portafolio `/portfolio` · Contacto `/#contacto`.
- **Do not** auto-build the header from every page-builder block.
- **Do not** add nested submenus for repeated modules by default. If a second Portafolio block must be reachable, give it a distinct **Ancla (URL)** and optionally add one curated nav link — only when the destination is meaningfully different.
- `SiteNav` (`components/site/SiteNav.tsx`): scroll-spy highlights same-page hash targets with `text-accent` + `aria-current`; page routes activate by pathname. Do **not** put `frame-label` on nav links (`frame-label` bakes `text-accent`, so inactive tabs cannot dim).
- At the **top of `/`** (including scroll-back and rubber-band), the home tab is active. Live CMS may still label it **Inicio** with href `/`. Spy ids: `#portada` (required on the Hero `<section>`), leftover `#inicio` inside it. If `#portada` is missing, the first `<section>` in `<main>` is used. Logic: `lib/site/nav-spy.ts`.
- Click-lock (~1.2s) stops intermediate sections flashing; it **expires on a timer and re-syncs** so a scroll-back after a click still updates. Home-tab and brand-mark clicks scroll to `scrollY = 0`.
- Brand mark (`BrandLink`) targets `/#portada` and, on `/`, preventDefault + scroll-to-top so the header overlaying Portada still counts as Inicio.

### Section anchors

- Navigable sections use `resolveSectionId()` from `lib/page-builder/anchors.ts`.
- Optional CMS field **Ancla (URL)** (`anchorId` via shared `anchorIdField`) on: Quiénes somos, Servicios, Proceso, Contacto, Portafolio.
- Defaults: `portada`, `nosotros`, `servicios`, `proceso`, `contacto`, `portafolio`.
- Repeated Portafolio modules without a custom ancla get a uniquified id (`portafolio-{key}`). First Portafolio in seed sets `anchorId: "portafolio"`. Inicio seed sets `nosotros`, `servicios`, `proceso`, `contacto`. Header nav home tab: **Portada** `/#portada` (seed) or leftover **Inicio** `/`. Hero DOM ids: `portada` + alias `inicio`.
- Anclas: lowercase, numbers, hyphens only (`portafolio-eventos`).

### Footer social icons

- Platforms are a **fixed list** in `lib/site/social.ts` (instagram, facebook, youtube, tiktok, linkedin, x, whatsapp, vimeo).
- Studio: dropdown + URL; reorder/add/remove in Ajustes del sitio.
- Render: inline SVGs with `currentColor` (`SocialIcon`), icon buttons with `aria-label`, theme hover (`hover:bg-wash hover:text-accent`).
- **Do not** add a heavy icon pack for brand marks; extend `lib/site/social.ts` + `SocialIcon.tsx` together when adding a network.
- Unknown/legacy platform strings may fall back to text; prefer the dropdown values.

---

## 5. Page-builder modules (checklist)

Studio labels Spanish; code/files/`_type` English:

| Studio title | `_type` | Schema | Component | Default anchor |
|---|---|---|---|---|
| Portada | `heroBlock` | `hero.ts` | `Hero.tsx` | `portada` |
| Quiénes somos | `aboutBlock` | `about.ts` | `About.tsx` | `nosotros` |
| Servicios | `servicesBlock` | `services.ts` | `Services.tsx` | `servicios` |
| Más trabajos | `workCtaBlock` | `workCta.ts` | `WorkCta.tsx` | — (bridge CTA) |
| Proceso | `processBlock` | `process.ts` | `Process.tsx` | `proceso` |
| Contacto | `contactBlock` | `contact.ts` | `Contact.tsx` | `contacto` |
| Portafolio | `portfolioBlock` | `portfolio.ts` | `Portfolio.tsx` | `portafolio` |
| Texto | `textBlock` | `textBlock.ts` | `TextBlock.tsx` | — |
| Galería | `imageGridBlock` | `imageGrid.ts` | `ImageGrid.tsx` | — |
| Testimonio | `testimonialBlock` | `testimonialBlock.ts` | `Testimonial.tsx` | — |
| Llamada a la acción | `ctaBlock` | `ctaBlock.ts` | `Cta.tsx` | — |

**Más trabajos** (`workCtaBlock`) ≠ centered **Llamada a la acción** (`ctaBlock`).

### Adding a block (coordinated changes)

1. **Schema** — `sanity/schemaTypes/objects/blocks/myBlock.ts` + export in `schemaTypes/index.ts`
2. **Page allow-list** — `{ type: "myBlock" }` in `documents/page.ts` → `pageBuilder.of[]`
3. **GROQ** — extend `pageProjection` in `lib/sanity/queries.ts` (use `projections.ts` for media)
4. **Renderer** — `blocks/MyBlock.tsx` + `BLOCK_TYPES` / switch in `PageBuilder.tsx` + type in `block-types.ts`
5. **Seed/template** — update `page-seed.ts` if the block belongs on Inicio/Portafolio by default
6. **Anchors** — if the block is a nav target, use `anchorIdField` + `resolveSectionId` + document the default id
7. **Media cleanup** — if it holds removable media, extend `walkPageBuilder` in `lib/media-cleanup/extract.ts`

`_type` / schema `name` / registry key must match exactly.

### Module rules

- Reuse `cloudinaryImage`, `muxVideo`, `link` — no parallel media types.
- Field `name`s English camelCase; Studio field `title`s / descriptions Spanish.
- Blocks receive `{ block }`; normalize with `normalizeCloudinaryImage()` or `lib/page-builder/` helpers.
- Prefer **Server Components**; `"use client"` only for interactivity (scroll scrub, forms, theme, video, nav scroll-spy).
- Theme tokens only (`frame-label`, `text-accent`, `bg-card`, `bg-surface`, `bg-wash`, `border-line`, `text-muted`, `max-w-8xl`, `px-6`) — no one-off hex in features.
- Incomplete blocks **return `null`** (missing required heading, empty lists, empty portable text).
- Removable media on `page` → extend `walkPageBuilder`.

---

## 6. Module layout conventions

### Portada (`heroBlock`)

- Fills the first viewport (`100dvh`, `100vh` fallback) and sits **under** the sticky header: `-mt-[var(--site-header-height)]` plus top padding that includes that height so copy/media start below the bar. Use `min-height`, not a fixed height, so mobile content can grow.
- Section `id` is the literal **`portada`** on the outer `<section>` (must match `HERO_SECTION_ID`). Also emit a zero-size **`inicio`** alias inside it so leftover `/#inicio` hashes resolve. After changing Hero, **`npm run build`** then restart `npm start` — `next start` will not pick up source-only edits.
- Optional `showcaseClips` (max 3, Mux + Cloudinary poster or image). **No** highlight/stat card in Portada.
- Heading is `<h2>` — the page’s single accessible `<h1>` stays the `CmsPage` sr-only heading.
- CTAs stack full-width on small screens.

### Más trabajos (`workCtaBlock`)

- Compact **bridge** after Portafolio on `/portfolio`, before Contacto: `py-12 lg:py-16` (not full `py-28`), and **no negative margins**.
- Full-bleed **`bg-surface`** + `border-t border-line` — same pair as Inicio (page `bg` vs band `bg-surface`). Do not use `bg-wash` as a section fill.
- External `http(s)` → `target="_blank"`; `mailto:` / `tel:` same tab; `/` and `#` → Next `Link`.

### Portafolio (`portfolioBlock`)

- Full section rhythm `py-28` (repeatable module; Más trabajos owns its own compact padding).
- **Main (16:9) video** keeps Mux controls and the CMS autoplay checkbox.
- Grid **clips**: always muted, looping, no Mux chrome, viewport-lazy autoplay. Honor `prefers-reduced-motion`. Ignore the CMS “Autoplay muted” checkbox for these tiles.

### Servicios

- Typical seed: **4** cards in 2×2 on large screens (`columnsFor(4) === 2`).
- Badges like “Servicio principal” / “Servicio complementario” (not only PLANO 01…).
- Symmetric `py-28` (Más trabajos is not on Inicio).

### Contacto + BriefForm

- Two-column layout on large screens: copy + links | form card.
- Contact links: underline via `border-b border-line`, hover `border-accent` / `text-accent` (light/dark safe).
- Form: BRIEF RÁPIDO pattern — name, empresa, correo, interest chips, message, full-width submit.
- Delivery via Resend + `CONTACT_TO_EMAIL` (not editable in CMS).

### Theme / color

- Tokens in `app/globals.css`: light defaults + `.dark` overrides (`--bg`, `--surface`, `--card`, `--fg`, `--muted`, `--line`, `--accent`, `--wash`).
- Brand accent is red (`--accent`); do not introduce purple/glow/default AI themes.
- Icons and UI chrome must use tokens / `currentColor`, not hardcoded light-only greys.

---

## 7. Environment & credentials

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

Page templates: only `page-homepage` and `page-portfolio`. Hide blank page create — edit via structure singletons.

---

## 8. Images — Cloudinary (required)

### Rules

- All photos/posters → Sanity `cloudinaryImage` → `<CloudinaryImage />` from `@/components/media/cloudinary`.
- **Never** use `CldImage`, hardcoded `res.cloudinary.com` URLs, or inline widths in feature code.
- **`CloudinaryImage` is a Server Component** — native `<img>` with server-built `src` / `srcSet` from `lib/cloudinary/srcset.ts`.
- **Do not** pass `next/image` `loader` functions from Server Components (not serializable).
- **Do not** use `next-cloudinary` React upload/display components in the public app — Studio plugin only.

```tsx
import { CloudinaryImage } from "@/components/media/cloudinary";
import { normalizeCloudinaryImage, cloudinaryImageUrl } from "@/lib/cloudinary";

<CloudinaryImage
  image={normalizeCloudinaryImage(block.photo)}
  variant="grid"
  sizes="(max-width: 639px) 100vw, 50vw"
/>
cloudinaryImageUrl(publicId, "lightbox"); // lightbox / Mux placeholder only
```

### Variants (max **width** only in `lib/cloudinary/variants.ts`)

Transform caps live in `variants.ts`. Layout **`sizes`** is per slot — pass it into `<CloudinaryImage sizes="…" />` so the browser picks the right srcset candidate (ImageGrid 2-col at `sm`, hero 3-col primary vs sides, logo at 160px). Variant `sizes` strings are fallbacks only.

| Variant | Width | Typical use |
|---------|-------|-------------|
| `thumbnail` | 400 | Small thumbs, logo |
| `grid` | 800 | Grids, clip tiles, hero showcase |
| `portrait` | 640 | Horizontal gallery strip |
| `hero` | 1920 | Full-width heroes |
| `lightbox` | 2000 | Lightbox / zoom |

**Animated images (GIF, animated WebP):** Cloudinary only — not Mux.

### GROQ

```typescript
import { cloudinaryImageProjection, muxVideoProjection } from "@/lib/sanity/projections";
```

Types: `SanityCloudinaryImage`, `CloudinaryPoster` from `@/lib/cloudinary`.  
SEO: `openGraphFromCloudinaryImage()` / `cloudinarySeoUrl()`.

---

## 9. Video — Mux (required)

- All video → Sanity `muxVideo` → `<MuxVideoPlayer />` from `@/components/media/MuxVideoPlayer`.
- **Every** `muxVideo` needs a **Cloudinary poster** (required in schema).
- Use `@mux/mux-player-react/lazy` with `loading="viewport"` via `MuxVideoPlayer`.
- `preload="none"`, `capRenditionToPlayerSize`, poster via Cloudinary.
- `autoplayMuted` only for short decorative loops (hero showcase / portfolio tiles).
- `fillContainer` tiles: Mux `--media-object-fit: cover` (match Cloudinary `object-cover`). Editorial 16:9 players: `contain`.
- Small viewports: one muted autoplay max on Portada (`allowMobileAutoplay` on the first clip only). Portafolio grid clips may all autoplay (muted, lazy). Honor `prefers-reduced-motion` in `MuxVideoPlayer` (not only CSS).
- Do not embed raw `stream.mux.com` or use `image.mux.com` for posters.

Project lightbox mapping: `mapProjectMediaToGalleryItems()` from `@/lib/page-builder`.

---

## 10. Free-tier performance (Cloudinary + Mux + Sanity)

| Vendor | Constraint | Mitigation |
|--------|------------|------------|
| Sanity | API usage | Server-only fetch; webhook revalidation only; seed is local CLI |
| Cloudinary | Transform credits | Fixed variants; `auto:good` / `auto` format |
| Mux Free | Assets + delivery minutes | Lazy viewport player; tombstones; Basic quality locked |
| Vercel | Bandwidth | Responsive `sizes`; don’t over-fetch hero on mobile |

- Register removable media in `lib/media-cleanup/extract.ts` (including Portada `showcaseClips`).
- 14-day tombstone grace — restore in Studio; delete orphans manually in vendor consoles.

---

## 11. Responsive UI / UX

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
- Full section rhythm `py-16`–`py-28`; **bridge** modules (Más trabajos) use compact `py-12 lg:py-16` between full `py-28` neighbors — don’t stack three `py-28`s and don’t use negative margins.
- Typography: prefer `text-hero` / clamp for display headings.
- Grids: `grid-cols-1` → `sm:grid-cols-2` → `lg:grid-cols-3/4`; Servicios with 4 cards → 2×2.
- Full-viewport heroes: `100dvh` sitting under the sticky header (`-mt` + content `pt` using `--site-header-height`); allow growth on small screens (`min-h`, not fixed `h`).

### Touch, images, video, motion

- Tap targets ~44×44px for primary controls (including footer social icons).
- Horizontal scroll: `snap-x snap-mandatory`, `overflow-x-auto`, focus-visible ring.
- Always aspect-ratio wrappers to prevent CLS; use `<CloudinaryImage variant="…" sizes="…" />`.
- `priority={true}` only for LCP candidates.
- Video: `aspect-video` on small screens; one muted autoplay max on Portada (`allowMobileAutoplay` on the first clip). Portafolio grid clips: muted looping autoplay in view.
- Respect `prefers-reduced-motion` (global CSS **and** Mux autoplay gate in `MuxVideoPlayer`).

---

## 12. Accessibility (required)

- Alt text required on every `cloudinaryImage`.
- Decorative: `aria-hidden="true"`.
- `<button type="button">` for actions; `<Link>` / `<a>` for navigation.
- Icon-only controls: `aria-label`; SVGs `aria-hidden`.
- One accessible `<h1>` per CMS page (`CmsPage` sr-only via `getPageAccessibleHeading`); **block titles stay `<h2>`+** (including Portada).
- Landmarks: `<main>`, `<section>`, `<nav aria-label="Principal">`, `<header>`, `<footer>`.
- Active nav: `aria-current="page"` when highlighted.
- Don’t convey meaning by color alone (pair accent with underline/weight where needed).
- Keep `:focus-visible` outlines from `globals.css`.

### Block ship checklist

- [ ] Images have alt
- [ ] Video has poster + visible processing/error states
- [ ] Keyboard-reachable interactive elements
- [ ] Heading hierarchy correct (no extra visible `<h1>`)
- [ ] Section `id` unique on the page when the block can repeat
- [ ] Usable at 320px width without unintended horizontal page scroll
- [ ] Light **and** dark mode checked with theme tokens

---

## 13. Guidelines to always follow (new / reinforced)

Use these when implementing or reviewing work:

1. **Single source of truth for copy/structure** — change seed content in `page-seed.ts`; templates and CLI consume it. Don’t fork duplicate Spanish strings in three places.
2. **Curated nav over generated nav** — header links stay editor-owned; section modules expose stable anchors instead of auto-injecting menu items.
3. **Measure chrome, don’t guess** — sticky header height via `HeaderShell` / `--site-header-height` for full-viewport layouts and scroll padding.
4. **Bridge vs section rhythm** — interstitial CTAs (Más trabajos) use compact `py-12`/`lg:py-16`, not the same `py-28` as major sections, and not a one-sided `pb-12` on the neighbor.
5. **Theme tokens only** — every new UI surface must work in light and dark; prefer `border-line`, `text-muted`, `text-accent`, `bg-wash`, `currentColor` icons.
6. **Accessible icon links** — footer (and similar) brand icons need visible hit area (~40px), `aria-label`, and `rel="noreferrer"` on external targets.
7. **Seed is opt-in overwrite** — default create-if-missing; `--force` only when intentionally resetting CMS content.
8. **Repeatable blocks need unique DOM ids** — Portafolio (and any future repeatable nav target) must not ship duplicate `id="portafolio"`.
9. **Portada is not the document `<h1>`** — keep `CmsPage` sr-only h1; Portada uses `<h2 className="text-hero">`.
10. **Extend social platforms in one place** — `lib/site/social.ts` options + `SocialIcon` map + seed defaults together.
11. **Contact personal data in CMS links** — email/phone/social on Contacto come from block `links` / site settings, not hardcoded in React (seed may supply defaults).
12. **No Studio/API secrets in the client** — write token and seed script stay server/local; never ship seed behind a public route.

---

## 14. Do not

- Use Spanish identifiers for `_type`, filenames, or React/component names
- Use English for Studio field/document titles meant for editors
- Add free-form CMS pages, blank page templates, or `app/[slug]` for Sanity pages
- Put Portafolio modules on the Inicio seed by default
- Auto-generate nested header submenus from repeated blocks
- Hardcode header height in `calc()` instead of `--site-header-height`
- Give Portada (or other blocks) a visible `<h1>` competing with `CmsPage`
- Add a highlight/stat card back into Portada without product approval
- Stack full `py-28` on bridge CTAs between sections, or pull them in with negative margins
- Inline `CldImage` / `CldUploadWidget` / manual Cloudinary URLs in feature code
- Pass `next/image` `loader` or function props from Server → Client Components
- Add `next-cloudinary` React components outside `/studio`
- Embed raw `stream.mux.com` or Mux image CDN for posters
- Add `revalidate: N` polling
- Store Cloudinary API secret in Studio
- Enable Mux Plus/Premium, DRM, static MP4, or 4K without approval
- Skip `lib/media-cleanup/extract.ts` when adding removable CMS media
- Invent breakpoints or Cloudinary transform widths outside `variants.ts` / Tailwind scale (`sizes` hints are per layout, not new variants)
- Ship blocks without mobile layout, light/dark, and a11y checks
- Nest vendor packages under a catch-all `lib/media/`
- Fall back brand name to “Studio” or other generic placeholders

---

## 15. Changelog

When you change a standard, edit **this file** and add a one-line note below.

| Date | Change |
|------|--------|
| 2026-08-22 | Portafolio clips: always muted + loop + autoplay; reduced-motion disables autoplay |
| 2026-08-22 | Studio: singleton pane ids ≠ page templates; Portafolio module opens in a full dialog |
| 2026-08-22 | Más trabajos (`workCtaBlock`) moved from Inicio seed to Portafolio, after `portfolioBlock` |
| 2026-08-22 | Header nav: Portada `/#portada` (Hero) instead of Inicio `/`; scroll-spy tracks `#portada` |
| 2026-08-22 | Media fit: layout `sizes` on `CloudinaryImage`; Mux cover vs contain; one mobile autoplay |
| 2026-08-09 | Docs overhaul: seeding, site chrome/nav/anchors/social icons, module layout rules, reinforced guidelines §13 |
| 2026-08-09 | Curated header nav + section anchors (`anchorId`, `SiteNav` scroll-spy); nav seed matches Inicio/Portafolio |
| 2026-08-09 | Portafolio seed: portfolio + contact; seed siteSettings for header/footer; remove “Studio” brand fallback |
| 2026-08-09 | `npm run seed:pages` — shared `page-seed.ts`, guarded create/overwrite for page singletons |
| 2026-08-09 | `workCtaBlock` (Más trabajos) after Servicios in Inicio seed |
| 2026-08-09 | `aboutBlock` (Quiénes somos); Portada showcase clips; Inicio seed without Portafolio module |
| 2026-08-09 | Docs sync: language rules, folder layout, fixed pages (Inicio/Portafolio), module checklist, empty-block null returns |
| 2026-08-09 | Folder layout + English code / Spanish Studio-UI; `components/{site,media,forms,page-builder}`, `lib/{sanity,page-builder,media-cleanup}` |
| 2026-08-09 | Fixed page templates (Inicio `/`, Portafolio `/portfolio`); removed test/preview routes |
| 2026-08-08 | Initial consolidated standards (architecture, media, a11y, responsive, env) |
| 2026-08-08 | Cloudinary delivery: `auto:good` quality + capped responsive `next/image` loader |
| 2026-08-08 | CloudinaryImage: server-built srcSet + native `<img>` (no RSC loader / no CldImage) |
| 2026-08-08 | Removed scheduled cron media delete — tombstones + manual vendor cleanup only |
