# XenSite: plan

<!-- The stable picture of the project. Change it only when the plan changes. Agents read this before NEXT.md. -->

## What it is

Jake's personal portfolio site, hosted on Vercel (moved from GitHub Pages at the end of the port). It shows his coursework and personal projects (C++, x86 and MIPS Assembly, Java, web) with real code excerpts and captured terminal output, plus an about page and a contact form. The port from vanilla HTML, CSS and JS to Next.js is done. The current phase adds a Fun Projects tab with a word finder, and automatic project posting and devlogs from each repo's `portfolio.json`.

## Goals

- Same site, same look, noticeably faster: Lighthouse targets from the handbook (Performance 90+, others 95+).
- Pages arrive already filled in (no blank page while Supabase loads).
- Readable project links like `/projects/blackjack`.
- A clean base for later features: automatic project posting, project devlogs, a Fun Projects tab.
- Phase 6: new projects appear on the site by pushing a `portfolio.json` to their repo, with no Supabase edit and no timers.

## Scope

**In:**
- Port every real page: home, projects feed, project detail, about, contact.
- Same visual design and animations (GSAP, ScrollTrigger, Lenis).
- Data from the existing Supabase tables, fetched at build time.
- Static export hosted on Vercel, deployed from the repo on every push.
- Removing dead files and moving `Prev-Tasks/` out of this repo.
- Phase 6: the Fun tab (`/fun/`) and the word finder (`/fun/word-finder/`), `portfolio.json` manifests read from Jake's GitHub repos at build time and merged with `project-cards`, devlogs from a repo's `devlog/` folder, and a reusable workflow that rebuilds the site when a project repo is pushed.

**Out (don't build these):**
- A redesign. Visual changes beyond what the port needs go back to Jake.
- Writing to other repos (charityWater, loreal-Project and the rest get their `portfolio.json` from Jake).
- Timers or scheduled rebuilds; rebuilds only happen on push.
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
| Fun tab | `/fun/` lists side projects as cards; "Fun" in the navbar (desktop and mobile) | done |
| Word finder | `/fun/word-finder/`: up to 7 letters, every 3+ letter word makeable from them, grouped by length, optional `_a_e` pattern, fully in the browser, solver unit tested | done |
| Project manifests | `portfolio.json` in a repo adds or overrides a project at build time; broken manifests and duplicate slugs fail the build; no `GITHUB_TOKEN` only warns | built; live once Jake adds `GITHUB_TOKEN` and the deploy hook |
| Devlogs | `devlog/*.md` in a shown repo renders at `/projects/<slug>/devlog/` and per post | built; live once Jake adds `GITHUB_TOKEN` and the deploy hook |
| Rebuild on push | Reusable workflow calls the Vercel deploy hook from `XENSITE_DEPLOY_HOOK`; how to in the handbook | built; live once Jake adds `GITHUB_TOKEN` and the deploy hook |

## Architecture and stack

- **Next.js** (App Router) with **TypeScript** and `output: "export"`, hosted on Vercel at the domain root (no base path).
- **Styling:** CSS Modules per component plus one global stylesheet for theme tokens. Bootstrap is removed.
- **Data:** Supabase Postgres, read only. Tables `project-cards` (title, tools_used, blurb, image_url, sort_order, long_description, code_snippets, terminal_session, demo_url, plus a new `slug`) and `about-me`. Images live in Supabase Storage. Row level security allows public reads only.
- **Build time fetch:** one helper in `src/lib/` reads both tables during `next build`. Changing data in Supabase needs a rebuild.
- **Config:** Supabase URL, the public anon key, the Web3Forms access key and the read only `GITHUB_TOKEN` come from environment variables (`.env.local` locally, Vercel environment variables when deployed), never hard coded.
- **GitHub manifests:** `scripts/github.mjs` runs before every build, lists Jake's repos with `GITHUB_TOKEN`, and saves each `portfolio.json` and `devlog/*.md` into a gitignored snapshot; `src/lib/portfolio.ts` validates it and merges it with `project-cards`.
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
| Phase 6 (Fun tab, word finder, manifests, devlogs) runs on the `funAndPosting` branch in one go, one commit per stage, then one pull request | Jake's answer to the branch question for this run | 2026-10-25 |
| Word list: SCOWL via the `wordlist-english` npm package (SCOWL license: free use with the copyright notice kept; notice in `src/lib/words/SCOWL-COPYRIGHT.txt` and credited on the page), English and American lists up to size 60, plain `a` to `z` words of 3 to 7 letters (about 28k) | Common words like a Wordscapes wheel accepts, without the obscure entries of 275k word lists; about 60 KB gzipped, loaded only by the word finder | 2026-10-25 |
| Unit tests use Node's built in runner (`npm test` runs `node --test` on `src/**/*.test.ts`, with Node's TypeScript stripping) | No new test dependency; tests import `./x.ts` directly (`allowImportingTsExtensions` in tsconfig) | 2026-10-25 |
| The word list is generated before dev and build by `scripts/words.mjs` into a gitignored module that the word finder imports lazily | Ships as its own chunk (about 70 KB gzipped) that only `/fun/word-finder/` loads, after first paint; no network calls beyond the site's own files | 2026-10-25 |
| "Fun" sits between Projects and About Me in the navbar; tilts keep alternating | Groups the work pages together | 2026-10-25 |
| GitHub data is fetched by `scripts/github.mjs` before the build into a gitignored snapshot; `src/lib/portfolio.ts` validates and merges it during the build | One fetch per build that the image script can also use for manifest cover images; the merge logic stays pure and unit tested | 2026-10-25 |
| Manifests: `slug`, `title`, `summary`, `tags` required when `show` is true; `live`, `test` (a URL to a test or preview build), `section` and the `project-cards` style fields optional; unknown fields warn, wrong types fail | Catches typos in the fields that matter without breaking builds over extra fields | 2026-10-25 |
| A manifest that matches a Supabase slug overrides only the fields it gives; `live: null` removes a demo link | Repos can update their card without touching Supabase | 2026-10-25 |
| Projects without a sort order go after the Supabase ones, most recently pushed first; forks are ignored | New work shows up without anyone choosing a number | 2026-10-25 |
| Manifest `image_url` must be a public http(s) URL; it goes through the same WebP pipeline as Supabase images | Keeps the 300 KB image rule for posted projects too | 2026-10-25 |
| Devlog posts need a date (front matter or `YYYY-MM-DD-` file name prefix); raw HTML in markdown is dropped; code blocks are highlighted at build time | Newest first ordering needs a date, and dropping HTML keeps posts safe to render | 2026-10-25 |
| When no project has devlog posts yet, each devlog route builds one placeholder page that renders the 404 page (`noindex`) | A static export fails on a dynamic route with no pages | 2026-10-25 |
| XenSite's own `notify-xensite.yml` skips itself (`if: github.repository != 'Xenzoro/XenSite'`) | Vercel already redeploys XenSite on every push; calling the hook too would build twice | 2026-10-25 |
| Project pages for public repos get "Code on GitHub"; `fun` section projects link back to `/fun/` | Matches the private repo rule and keeps the Fun tab's navigation consistent | 2026-10-25 |

## Open questions (Jake decides)

- Name of the new repo for `Prev-Tasks/` (cut from `vanillaPrototype` whenever Jake wants).
- A custom domain later, or keep the Vercel one.
