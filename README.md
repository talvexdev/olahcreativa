# Portfolio MVP

Next.js (App Router) + embedded Sanity Studio + Cloudinary (images) + Mux (video).
Built to stay inside every vendor's free tier by design — see "Free-tier discipline" below.

## Stack

- **Next.js 16** (App Router, TypeScript, Tailwind CSS v4) — hosted on Vercel
- **Sanity Studio v6**, embedded at `/studio` — content modeling, page builder
- **Cloudinary** — image storage/CDN, via `sanity-plugin-cloudinary` + `next-cloudinary`
- **Mux** — video encoding/streaming, via `sanity-plugin-mux-input` + `@mux/mux-player-react`

**Requirements:** Node.js 20+ (22 or 24 LTS recommended; Node 25 may show a `nanoid` engine warning from Sanity — harmless, or use nvm to switch to 24)

## Design direction

"Light table / contact sheet" — a darkroom review table, not a generic dark-mode
portfolio template. Warm charcoal-green background (`#1B1F1A`), archival paper
foreground (`#EFEBE2`), a single muted brass accent (`#A9793B`) used sparingly.
Display type is Fraunces (editorial serif), body is Inter, captions/frame-numbers
are IBM Plex Mono — evoking contact-sheet frame labels and EXIF data, which is
also the site's signature element (`frame-label` class, used throughout).
Design tokens live in `app/globals.css` (`@theme` block).

## Getting started

```bash
npm install
cp .env.local.example .env.local   # fill in real values, see below
npm run dev
npm run lint   # ESLint CLI (not next lint)
```

Visit `/` for the public site, `/portfolio` for the portfolio page, `/studio` for the CMS.

### Pages & page-builder

Studio has exactly two page singletons (no free-form pages):

| Studio | URL | What to edit |
|--------|-----|----------------|
| **Inicio (/)** | `/` | Page-builder modules for the site root |
| **Portafolio (/portfolio)** | `/portfolio` | Page-builder modules for the portfolio route |

Open either page under **Páginas** in Studio and publish. Inicio seeds **Portada → Servicios → Proceso → Contacto** (edit or reorder as needed). Portafolio starts empty. Header/footer come from **Ajustes del sitio**, not from page modules.

Agent conventions (folder layout, EN code / ES Studio labels, new modules): [`docs/AGENT-STANDARDS.md`](docs/AGENT-STANDARDS.md).

### Cloudinary setup checklist

| Step | Where | What |
|------|--------|------|
| 1 | [cloudinary.com](https://cloudinary.com) | Create free account; note cloud name and API key |
| 2 | `.env.local` | `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` |
| 3 | `/studio` | **Configure Cloudinary** on any image array → cloud name + API key (stored in dataset) |
| 4 | `/studio` | Upload images on Inicio/Portafolio blocks, **Ajustes del sitio** logo, or a project cover |
| 5 | Browser | Confirm `res.cloudinary.com` requests on `/` or `/portfolio` after publish |

**Then Mux** (requires Cloudinary posters): configure Mux plugin in `/studio`, upload video + poster on a project or portfolio hero.

### Environment variables you need to supply

| Variable | Where to get it |
|---|---|
| `NEXT_PUBLIC_SANITY_PROJECT_ID` / `NEXT_PUBLIC_SANITY_DATASET` | sanity.io/manage — create a free project |
| `SANITY_API_READ_TOKEN` | Sanity → API → Tokens (Viewer) |
| `SANITY_API_WRITE_TOKEN` | Sanity → API → Tokens (Editor) — used by the media-cleanup webhook |
| `SANITY_REVALIDATE_SECRET` | any long random string; also set as the webhook secret in Sanity |
| `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME` | cloudinary.com console — required for delivery URLs |
| `RESEND_API_KEY` / `CONTACT_TO_EMAIL` | resend.com — contact/brief block (`contactBlock`) |
| `CONTACT_FROM_EMAIL` | optional; verified Resend domain sender. Falls back to `onboarding@resend.dev` |
| `NEXT_PUBLIC_SITE_URL` | your production URL (e.g. `https://yourdomain.com`) — sitemap, robots, JSON-LD |

### One-time setup outside the code

1. **Cloudinary in Studio** (required before any image field works):
   - `.env.local` needs `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`.
   - Open `/studio` → edit any document with an image field (e.g. **Ajustes del sitio** → Logo).
   - On the image array toolbar, click **Configure Cloudinary** → enter **cloud name** + **API key only** (no secret in Studio).
   - Upload/select images via the Cloudinary Media Library picker. Every image needs **alt text** (required in schema).
   - Optional: create an unsigned upload preset in the [Cloudinary console](https://console.cloudinary.com) scoped to a folder (e.g. `portfolio/`) and set it in the Studio configure dialog.
2. **Sanity revalidation webhook**: Project settings → API → Webhooks → POST to
   `https://yourdomain.com/api/revalidate` on **Create/Update/Delete**, secret =
   `SANITY_REVALIDATE_SECRET`. This is what makes publishing instantly update the
   live site (on-demand ISR — see architecture notes below).
3. **Sanity media-cleanup webhook**: Project settings → API → Webhooks → POST to
   `https://yourdomain.com/api/webhooks/media-cleanup` on **Create/Update/Delete**
   for `project`, `page`, and `siteSettings` document types, secret =
   `SANITY_REVALIDATE_SECRET`. Creates tombstone records when media is removed so
   editors have a 14-day grace window to restore before deleting assets in
   Cloudinary/Mux manually.
4. **Create Ajustes del sitio** once, then open **Páginas → Inicio** and
   **Portafolio**, add/edit modules, and publish. Populate **Proyectos** as needed
   for `/work/[slug]`.

## What's built vs. stubbed

**Built and functional:**
- Full Sanity schema (proyecto, página, ajustes del sitio, media-cleanup tombstone)
- Fixed page templates (Inicio `/`, Portafolio `/portfolio`) with page-builder
  modules — see `docs/AGENT-STANDARDS.md` for the module checklist and folder layout
- Project detail pages (`/work/[slug]`), embedded Studio
- Cloudinary image pipeline with a fixed, named set of size variants (bounds
  transformation-credit usage — see below)
- Mux video pipeline with lazy-mounted playback (bounds delivered-minutes usage)
- Lightbox on project detail pages (`yet-another-react-lightbox` via `ProjectGallery`)
- On-demand revalidation route (Sanity webhook → Next.js → Vercel)
- Media-cleanup pipeline: tombstone webhook (`/api/webhooks/media-cleanup`),
  Studio "Restore asset" action on pending tombstones
- Sitemap (`/sitemap.xml`), robots (`/robots.txt`), and JSON-LD structured data

**Not yet built (requires content / external setup):**
- Real content — everything renders against whatever's in Sanity; `/` and
  `/portfolio` 404 until Inicio / Portafolio are published
- Resend sender domain verification (contact/brief block uses
  `onboarding@resend.dev` until you configure a verified domain)
- Quiénes somos module (planned; not in the Inicio seed yet)

## Free-tier discipline (why the code looks the way it does)

A few choices exist specifically to keep usage inside Sanity/Cloudinary/Mux/Vercel
free tiers, not just for code cleanliness — worth knowing before "simplifying":

- **No client-side Sanity queries anywhere.** Everything fetches at build/request
  time on the server. A visitor never costs a Sanity API call — only a publish does.
- **On-demand revalidation only** — no `revalidate: N` timers. Don't add one;
  it silently re-queries Sanity on a schedule regardless of whether anything changed.
- **Fixed image variants** (`lib/cloudinary/variants.ts`) instead of ad-hoc widths
  per usage — keeps Cloudinary transformation-credit usage bounded and predictable
  as the site grows. Add new use cases in that file, then use
  `<CloudinaryImage variant="…" />` from `@/components/media/cloudinary`.
- **Lazy-mounted video** (`@/components/media/MuxVideoPlayer`) — off-screen video never streams,
  which is what keeps Mux delivered-minutes tied to real engagement.
- **Tombstone tracking** on media cleanup gives editors a 14-day grace window
  to restore accidentally removed assets; delete orphaned Cloudinary/Mux files
  manually in each vendor console when the grace period ends.

If any of these constraints get lifted later (e.g. moving off free tiers), they're
each isolated in one place and safe to relax without touching the rest of the app.
