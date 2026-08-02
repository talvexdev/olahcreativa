# Portfolio MVP

Next.js (App Router) + embedded Sanity Studio + Cloudinary (images) + Mux (video).
Built to stay inside every vendor's free tier by design — see "Free-tier discipline" below.

## Stack

- **Next.js 15** (App Router, TypeScript, Tailwind) — hosted on Vercel
- **Sanity Studio v3**, embedded at `/studio` — content modeling, page builder
- **Cloudinary** — image storage/CDN, via `sanity-plugin-cloudinary` + `next-cloudinary`
- **Mux** — video encoding/streaming, via `sanity-plugin-mux-input` + `@mux/mux-player-react`

## Design direction

"Light table / contact sheet" — a darkroom review table, not a generic dark-mode
portfolio template. Warm charcoal-green background (`#1B1F1A`), archival paper
foreground (`#EFEBE2`), a single muted brass accent (`#A9793B`) used sparingly.
Display type is Fraunces (editorial serif), body is Inter, captions/frame-numbers
are IBM Plex Mono — evoking contact-sheet frame labels and EXIF data, which is
also the site's signature element (`frame-label` class, used throughout).
Tokens live in `tailwind.config.ts`.

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in real values, see below
npm run dev
```

Visit `/` for the public site, `/studio` for the CMS, `/contact` for the contact form.

### Environment variables you need to supply

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` | sanity.io/manage — create a free project |
| `SANITY_API_READ_TOKEN` | Sanity → API → Tokens (Viewer) |
| `SANITY_API_WRITE_TOKEN` | Sanity → API → Tokens (Editor) — used by cleanup cron + media webhook |
| `SANITY_REVALIDATE_SECRET` | any long random string; also set as the webhook secret in Sanity |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | cloudinary.com console — required for `next-cloudinary` (CldImage) |
| `CLOUDINARY_API_KEY` / `CLOUDINARY_API_SECRET` | cloudinary.com console — used by the media-cleanup cron Admin API only |
| `MUX_TOKEN_ID` / `MUX_TOKEN_SECRET` | dashboard.mux.com → Settings → API Access Tokens |
| `CRON_SECRET` | any long random string — Vercel sends it as `Authorization: Bearer` for cron |
| `RESEND_API_KEY` / `CONTACT_TO_EMAIL` | resend.com — for the `/contact` form |
| `NEXT_PUBLIC_SITE_URL` | your production URL (e.g. `https://yourdomain.com`) — sitemap, robots, JSON-LD |

### One-time setup outside the code

1. **Cloudinary in Studio**: open `/studio` → Cloudinary plugin settings → enter your
   cloud name and API key. This is stored in the Sanity dataset (not in env vars).
   Optionally create an unsigned upload preset in the Cloudinary console scoped to
   a folder (e.g. `portfolio/`) and configure it in the Studio UI.
2. **Sanity revalidation webhook**: Project settings → API → Webhooks → POST to
   `https://yourdomain.com/api/revalidate` on **Create/Update/Delete**, secret =
   `SANITY_REVALIDATE_SECRET`. This is what makes publishing instantly update the
   live site (on-demand ISR — see architecture notes below).
3. **Sanity media-cleanup webhook**: Project settings → API → Webhooks → POST to
   `https://yourdomain.com/api/webhooks/media-cleanup` on **Create/Update/Delete**
   for `project` and `page` document types, secret = `SANITY_REVALIDATE_SECRET`.
   Creates tombstone records when media is removed; the daily cron permanently
   deletes assets after the 14-day grace window.
4. **Vercel Cron**: `vercel.json` already defines the daily media-cleanup sweep
   (6am UTC). Set a `CRON_SECRET` env var in Vercel — Vercel sends it automatically
   as the `Authorization: Bearer` header for cron-triggered requests.
5. **Create the `siteSettings` singleton** in the Studio once, populate the first
   `project` documents, and add a nav link to `/contact` if desired.

## What's built vs. stubbed

**Built and functional:**
- Full Sanity schema (project, page, siteSettings, media-cleanup tombstone)
- Page-builder system (hero, image grid, text, testimonial, CTA blocks) — new
  block types are added in three places: the Sanity object schema, `page.ts`'s
  `pageBuilder.of[]`, and the `BLOCKS` registry in `components/PageBuilder.tsx`
- Homepage (tagline from `siteSettings`), project detail pages, flexible CMS-driven
  pages, embedded Studio, `/contact` page with Resend Server Action
- Cloudinary image pipeline with a fixed, named set of size variants (bounds
  transformation-credit usage — see below)
- Mux video pipeline with lazy-mounted playback (bounds delivered-minutes usage)
- Lightbox on project detail pages (`yet-another-react-lightbox` via `ProjectGallery`)
- On-demand revalidation route (Sanity webhook → Next.js → Vercel)
- Media-cleanup pipeline: tombstone webhook (`/api/webhooks/media-cleanup`),
  daily cron with Cloudinary Admin `destroy` + Mux asset delete, Studio "Restore
  asset" action on pending tombstones
- Sitemap (`/sitemap.xml`), robots (`/robots.txt`), and JSON-LD structured data

**Not yet built (requires content / external setup):**
- Real content — everything renders against whatever's in Sanity; the site is
  empty until content is added in the Studio
- Resend sender domain verification (the form uses `onboarding@resend.dev` until
  you configure a verified domain in Resend)

## Free-tier discipline (why the code looks the way it does)

A few choices exist specifically to keep usage inside Sanity/Cloudinary/Mux/Vercel
free tiers, not just for code cleanliness — worth knowing before "simplifying":

- **No client-side Sanity queries anywhere.** Everything fetches at build/request
  time on the server. A visitor never costs a Sanity API call — only a publish does.
- **On-demand revalidation only** — no `revalidate: N` timers. Don't add one;
  it silently re-queries Sanity on a schedule regardless of whether anything changed.
- **Fixed image variants** (`components/CloudinaryPhoto.tsx`'s `VARIANTS` object)
  instead of ad-hoc widths per usage — keeps Cloudinary transformation-credit
  usage bounded and predictable as the site grows. Add new use cases by adding
  a named variant here, not an inline width somewhere else.
- **Lazy-mounted video** (`MuxVideoPlayer`) — a video off-screen never streams,
  which is what keeps Mux delivered-minutes tied to real engagement.
- **The 14-day tombstone grace period** on media cleanup isn't just a safety
  net for accidental deletes — it's also what stops orphaned Cloudinary/Mux
  assets from silently inflating storage usage over time as photographers
  swap out weaker shots.

If any of these constraints get lifted later (e.g. moving off free tiers), they're
each isolated in one place and safe to relax without touching the rest of the app.
