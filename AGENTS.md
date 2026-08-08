# Agent guide — olahcreativa

Instructions for **Cursor, Claude, Copilot, and other coding agents**.

## Single source of truth

**All project standards live in one file:**

### → [`docs/AGENT-STANDARDS.md`](docs/AGENT-STANDARDS.md)

Edit that file when conventions change. Do not duplicate standards in `.cursor/rules/`, this file, or tool-specific configs.

## Quick orientation

- **Stack:** Next.js 16 · Sanity Studio · Cloudinary · Mux · Tailwind v4 · Vercel
- **Human setup:** `README.md` (accounts, env, webhooks)
- **Images:** `components/cloudinary/CloudinaryImage.tsx` + `lib/cloudinary/`
- **Video:** `components/MuxVideoPlayer.tsx`
- **New CMS block:** schema → `page.ts` → `lib/queries.ts` → block component → `PageBuilder.tsx`

## Cursor

`.cursor/rules/agent-standards.mdc` applies every session and points to `docs/AGENT-STANDARDS.md`.

## Claude Code

See [`CLAUDE.md`](CLAUDE.md) — same pointer.
