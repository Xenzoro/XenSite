# XenSite: plan

<!-- The stable picture of the project. Change it only when the plan changes. Agents read this before NEXT.md. -->

## What it is

Jake's personal portfolio site, live on GitHub Pages at `https://xenzoro.github.io/XenSite/`. It shows his coursework and personal projects (C++, x86 and MIPS Assembly, Java, web) with real code excerpts and captured terminal output, plus an about page and a contact form. This plan covers porting it from vanilla HTML, CSS and JS to Next.js.

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
- Static export deployed to GitHub Pages by a GitHub Action.
- Removing dead files and moving `Prev-Tasks/` out of this repo.

**Out (don't build these):**
- A redesign. Visual changes beyond what the port needs go back to Jake.
- `portfolio.json` automation, devlogs, the Fun Projects tab and the word finder (later phases, see webdevHandbook `plans/infrastructure.md`).
- Any write access to Supabase from the site, logins, or a server.
- Moving off GitHub Pages.

## Features

| Feature | Done means | Status |
|---|---|---|
| Baseline | 3 Lighthouse Mobile runs of the current live site saved in the handbook, median logged | done |
| Scaffold | Next.js App Router, TypeScript, static export with `basePath: "/XenSite"`, builds clean | done |
| Layout | One navbar component (desktop and mobile), fonts through `next/font`, shared on every page | planned |
| Home | Intro, project grid with live tag search, contact card | planned |
| Projects feed | Every project from `project-cards`, ordered by `sort_order` | planned |
| Project detail | One prebuilt page per project at `/projects/<slug>`, code excerpts, terminal replay or demo link | planned |
| About | Content and photo gallery (carousel when a card has several photos) from `about-me` | planned |
| Contact | Web3Forms form works from the static site | planned |
| Code highlighting | Done at build time; no Prism scripts in the browser | planned |
| Images | Converted to WebP or AVIF with width and height set; no image over 300 KB | planned |
| Deploy | GitHub Action builds and publishes to Pages from main | planned |
| After report | Lighthouse rerun, logged in the handbook's `nextjsMigration.md` | planned |

## Architecture and stack

- **Next.js** (App Router) with **TypeScript** and `output: "export"`, served from the `/XenSite` path on GitHub Pages.
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
| Next.js 16; scaffold defaults `cacheComponents` and `partialPrefetching` removed | Both need a server and break `output: "export"` | 2026-10-25 |
| `agentRules: false` in `next.config.ts` | Stops `next dev` from writing its own block into AGENTS.md | 2026-10-25 |
| ESLint ignores `project-files/` and `Prev-Tasks/` | Old vanilla code is not linted; it is removed at the end of the port | 2026-10-25 |

## Open questions (Jake decides)

- Name of the new repo for `Prev-Tasks/`.
- Final slug for each project (Claude proposes from titles, Jake approves before the column is filled).
- Keep the `/XenSite` path, or move to a custom domain later.
- What to do with the unused files (horizontal project scroll, contact outro, four empty stub pages): delete, or keep for a later feature.
