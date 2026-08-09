# Agent guide — olahcreativa

Instructions for **Cursor, Claude, Copilot, and other coding agents**.

## Single source of truth

**All project standards live in one file:**

### → [`docs/AGENT-STANDARDS.md`](docs/AGENT-STANDARDS.md)

Edit that file when conventions change. Do not duplicate standards in `.cursor/rules/`, this file, or tool-specific configs.

## Quick orientation

- **Stack:** Next.js 16 · Sanity Studio · Cloudinary · Mux · Tailwind v4 · Vercel
- **Human setup:** `README.md` (accounts, env, webhooks, `npm run seed:pages`)
- **Language:** English code/files/`_type`; Spanish Studio labels + user-facing copy
- **Layout:** `components/{site,media,forms,page-builder}` · `lib/{sanity,cloudinary,mux,page-builder,site,media-cleanup}`
- **Images / video:** `CloudinaryImage` · `MuxVideoPlayer`
- **Fixed pages:** Inicio `/` (`homepage`) · Portafolio `/portfolio` (`pagePortfolio`)
- **Seed:** `sanity/lib/page-seed.ts` + `npm run seed:pages` (site settings + both pages)
- **Chrome:** Header/footer from `siteSettings`; curated `SiteNav`; section anchors via `resolveSectionId` / **Ancla (URL)**
- **New CMS block:** English `_type` + files; Spanish Studio `title` — schema → `documents/page.ts` → `pageByIdQuery` → `page-builder/blocks` → `PageBuilder.tsx` (+ seed/anchors/media-cleanup if needed)

## Cursor

`.cursor/rules/agent-standards.mdc` applies every session and points to `docs/AGENT-STANDARDS.md`.

## Claude Code

See [`CLAUDE.md`](CLAUDE.md) — same pointer.
