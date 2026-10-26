# Context for AI agents

You are helping Jake (GitHub: Xenzoro) with XenSite, his portfolio site. Before starting work, read in this order:

1. `PLAN.md`: what this project is, its features, scope, rules and decisions.
2. `NEXT.md`: the current phase, its steps, and what to hand back.
3. `~/projects/webdevhandbook/bestPractices.md`: Jake's standards for web code.

## How to work

- Stay inside PLAN.md's scope. Anything under "Out" or "Open questions" goes back to Jake instead of being built.
- When a phase step is finished, add a line to NEXT.md's Log. When a decision is made, add it to PLAN.md's Decisions.
- Once per chat, before the first commit, ask Jake whether to use a separate branch or push straight to main (suggest a branch for big changes). That answer holds for the rest of the chat. The Next.js port lives on the `nextjs` branch.
- Before each commit, use the `reviewer` subagent and fix anything under "Must fix".

## Run and test

```bash
npm install
npm run dev     # http://localhost:3000
npm run lint
npm run build   # static export into out/ (runs scripts/images.mjs first)
```

`npm run dev` and `npm run build` both run `scripts/images.mjs` first, which needs `.env.local` (see `.env.example`).

This is Next.js 16, which may differ from what you know. Check the docs bundled in `node_modules/next/dist/docs/` before writing Next.js code.

## Where things live

- `src/app/`: routes (home, `projects/`, `projects/[slug]/`, `about/`, `contact/`, `not-found.tsx`) with their CSS Modules, plus `detail.html/route.ts`, which builds the redirect page for old `detail.html?id=N` links.
- `src/components/`: `Navbar/`, `Home/`, `Project/` (code excerpts, terminal replay, feed search), `About/` (gallery and lightbox). Only the interactive pieces are client components.
- `src/lib/`: `supabase.ts` (build time reads), `types.ts`, `slug.ts`, `media.ts` (Storage URL to local WebP), `highlight.ts` (refractor), `site.ts` (base path and site name).
- `src/assets/`: committed WebP photos and logo. `public/`: resume PDF.
- Generated and gitignored: `public/media/` and `src/lib/generated/media.json` from `scripts/images.mjs`, and `out/` from the build.
- Hosting: Vercel, connected to this repo. Pushes to `main` deploy to production; every other branch gets a preview URL. The three `NEXT_PUBLIC_` values are Vercel environment variables.
- The old vanilla site and `Prev-Tasks/` are gone from this branch; they are preserved in `vanillaPrototype`. Original photos for `node scripts/images.mjs local <dir>` are in that branch under `project-files/`.

## Hard rules

1. Never write secrets, IP addresses, passwords, tokens, login links or the desktop's full Tailscale name into this repo, commits or chats. Use placeholders like `<API_KEY>`. Config comes from `.env.local`, never from code.
2. Never ask Jake to paste those anywhere.
3. Never read the xenDB `qwen/` folder.
4. Never commit to, merge, or open pull requests for the snapshot branches `vanillaPrototype` and `failedPrototype`.
5. The site only reads from Supabase. Propose schema changes to Jake; don't make them.
6. Writing style in docs and UI copy: no em dashes, en dashes or hyphens in prose unless a phrase needs one.
