# XenSite: plan

<!-- The stable picture of the project. Change it only when the plan changes. Agents read this before NEXT.md. -->

## What it is

Jake's personal portfolio site, hosted on Vercel (moved from GitHub Pages at the end of the port). It shows his coursework and personal projects (C++, x86 and MIPS Assembly, Java, web) with real code excerpts and captured terminal output, plus an about page and a contact form. This plan covers porting it from vanilla HTML, CSS and JS to Next.js.

## Goals

- Same site, same look, noticeably faster: Lighthouse targets from the handbook (Performance 90+, others 95+).
- Pages arrive already filled in (no blank page while Supabase loads).
- Readable project links like `/projects/blackjack`.
- A clean base for later features: automatic project posting, project devlogs, a Fun Projects tab.

## Scope

**In:**
- Port every real page: home, projects feed, project detail, about, contact.
- Same visual design and animations (GSAP, ScrollTrigger, Lenis).
- Data from the existing Supabase tables, fetched at build time.
- Static export hosted on Vercel, deployed from the repo on every push.
- Removing dead files and moving `Prev-Tasks/` out of this repo.

**Out (don't build these):**
- A redesign. Visual changes beyond what the port needs go back to Jake.
- `portfolio.json` automation, devlogs, the Fun Projects tab and the word finder (later phases, see webdevHandbook `plans/infrastructure.md`).
- Any write access to Supabase from the site, logins, or a server.

## Features

| Feature | Done means | Status |
|---|---|---|
| Baseline | 3 Lighthouse Mobile runs of the current live site saved in the handbook, median logged | done |
| Scaffold | Next.js App Router, TypeScript, static export, builds clean | done |
| Layout | One navbar component (desktop and mobile), fonts through `next/font`, shared on every page | done |
| Home | Intro, project grid with live tag search, contact card | done |
| Projects feed | Every project from `project-cards`, ordered by `sort_order` | done |
| Project detail | One prebuilt page per project at `/projects/<slug>`, code excerpts, terminal replay or demo link | done |
| About | Content and photo gallery (carousel when a card has several photos) from `about-me` | done |
| Contact | Web3Forms form works from the static site | built; a real submission is untested (Jake sends one from the live site) |
| Code highlighting | Done at build time; no Prism scripts in the browser | done |
| Images | Converted to WebP or AVIF with width and height set; no image over 300 KB | done |
| Deploy | Vercel builds from the repo: main to production, other branches to previews | building |
| After report | Lighthouse rerun, logged in the handbook's `nextjsMigration.md` | local build logged (Perf 91, A11y 100, BP 100, SEO 100); live rerun after merge |

## Architecture and stack

- **Next.js** (App Router) with **TypeScript** and `output: "export"`, hosted on Vercel at the domain root (no base path).
- **Styling:** CSS Modules per component plus one global stylesheet for theme tokens. Bootstrap is removed.
- **Data:** Supabase Postgres, read only. Tables `project-cards` (title, tools_used, blurb, image_url, sort_order, long_description, code_snippets, terminal_session, demo_url, plus a new `slug`) and `about-me`. Images live in Supabase Storage. Row level security allows public reads only.
- **Build time fetch:** one helper in `src/lib/` reads both tables during `next build`. Changing data in Supabase needs a rebuild.
- **Config:** Supabase URL, the public anon key and the Web3Forms access key come from environment variables (`.env.local` locally, Actions secrets in CI), never hard coded.
- **Animations:** GSAP, ScrollTrigger and Lenis from npm, inside client components.
- **Folders:** `src/app/` routes, `src/components/` UI with CSS Modules, `src/lib/` data and helpers, `public/` static assets.

## Rules

- Follow `~/projects/webdevhandbook/bestPractices.md` for web code.
- Never write IPs, keys, passwords, tokens, login links or the desktop's full Tailscale name into code, commits or chats. Use placeholders.
- Never commit `credentials.txt` (already in `.gitignore`).
- Never read the xenDB `qwen/` folder.
- Once per chat, before the first commit, ask Jake whether to use a separate branch or push straight to main (suggest a branch for big changes). Jake merges branches to main himself after testing.
- `vanillaPrototype` and `failedPrototype` are snapshot branches. Never commit to them, merge them, or open pull requests for them.
- Supabase stays read only from the site. Schema changes (like adding `slug`) are proposed to Jake first.

## Decisions

| Decision | Why | Date |
|---|---|---|
| Repo renamed WebsiteProject to XenSite | Jake's choice of name | 2026-10-25 |
| Current vanilla site kept in `vanillaPrototype`; old XENSITE repo content in `failedPrototype` | Keep history without cluttering main | 2026-10-25 |
| TypeScript | Practice, and safer Supabase types | 2026-10-25 |
| CSS Modules instead of Bootstrap | Scoped styles, less CSS shipped | 2026-10-25 |
| Project URLs use a new `slug` column (`/projects/<slug>`) | Prebuilt, readable, shareable links | 2026-10-25 |
| `Prev-Tasks/` moves to its own repo | 41 MB of old class exercises do not belong in the site | 2026-10-25 |
| Port work happens on the `nextjs` branch | Big change; Jake merges after testing | 2026-10-25 |
| Stay on GitHub Pages | Matches his other sites; see infrastructure plan | 2026-10-25 |
| Host on Vercel instead of GitHub Pages (replaces the row above); base path removed, Pages workflow and `.nojekyll` deleted | Jake's call at merge time: env vars and previews per branch without Actions secrets | 2026-10-25 |
| Next.js 16; scaffold defaults `cacheComponents` and `partialPrefetching` removed | Both need a server and break `output: "export"` | 2026-10-25 |
| `agentRules: false` in `next.config.ts` | Stops `next dev` from writing its own block into AGENTS.md | 2026-10-25 |
| ESLint ignores `project-files/` and `Prev-Tasks/` | Old vanilla code is not linted; it is removed at the end of the port | 2026-10-25 |
| Whole port done in one agent run (Phases 2 to 5 in NEXT.md), committing after each stage | Jake wants one prompt, not repeated check ins | 2026-10-25 |
| Slugs come from one `slugify(title)` function until the `slug` column exists; after that the column wins | The build never waits on the schema change, and the SQL fills the column with the same values, so URLs don't change | 2026-10-25 |
| `Prev-Tasks/`, the vanilla files and the unused scripts are deleted from `nextjs` at the end of the port | All of it is preserved in `vanillaPrototype`; a separate Prev-Tasks repo can be cut from there anytime | 2026-10-25 |
| Supabase Storage images are downloaded and converted to sized WebP by `scripts/images.mjs` before every dev and build run (output gitignored) | Gallery photos are up to 3.8 MB; Storage has no free resizing; keeps every image under 300 KB without committing copies | 2026-10-25 |
| Code highlighting uses refractor (Prism in Node) with the prism-tomorrow colors | Same token classes and colors as the old Prism setup, with nothing shipped to the browser | 2026-10-25 |
| `detail.html` is a static route handler that maps old ids to slugs with a tiny inline script | Old shared links keep working on a static host without server redirects | 2026-10-25 |
| Small text on tinted backgrounds uses a lighter accent `#4db3e6`; the demo button text is dark | Fixes the baseline contrast failure (3.76:1 tags) with the least visible change | 2026-10-25 |
| Home has one `<h1>` (the name tag, same look) with section titles as `<h2>` and card titles as `<h3>` | Fixes the baseline heading order failure without changing the design | 2026-10-25 |
| `experimental.inlineCss` on | About 6 KB of CSS gzipped; removes render blocking requests (FCP 1.7s to 1.0s locally) and Pages only caches 10 minutes anyway | 2026-10-25 |
| Navbar links prefetch on hover or focus, not when they enter the viewport | First visit downloads only the page itself (about 49 KB less); moved local mobile Perf from 86 to 91 | 2026-10-25 |
| Archivo shipped as a Latin subset WOFF2 | Same glyphs the site uses, 19 KB instead of 89 KB | 2026-10-25 |
| Vanilla site and `Prev-Tasks/` deleted from `nextjs`; their ESLint ignores removed | Port finished; everything stays in `vanillaPrototype` and a Prev-Tasks repo can still be cut from there | 2026-10-25 |

## Open questions (Jake decides)

- Name of the new repo for `Prev-Tasks/` (cut from `vanillaPrototype` whenever Jake wants).
- A custom domain later, or keep the Vercel one.
