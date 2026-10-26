# Next: Phase 6, Fun tab, word finder, project manifests and devlogs

<!-- The current handoff. Read PLAN.md first for what the project is, its scope and its rules. -->

**Goal:** Add a Fun Projects tab with a word finder, and let projects post themselves to the site from a `portfolio.json` in their own repo, with devlogs, rebuilding the site on push.

## How to run this

- **Branch:** `funAndPosting` (Jake's answer for this run). Finish with one pull request into `main`.
- **Don't stop to ask.** Decide sensibly, record the decision in PLAN.md, and put anything that needs Jake under "For Jake" below.
- **After each stage:** `npm run lint`, `npm test` and `npm run build` pass, the `reviewer` subagent runs and every "Must fix" is fixed, then commit, push, and log it below.
- Screenshots go in `.shots/` (gitignored). Read nothing outside this repo and `~/projects/webdevhandbook`.
- Never put tokens, deploy hook URLs or keys in code, commits or chats. They live in `.env.local` and Vercel environment variables.

## Stage 1: Fun tab and word finder

1. "Fun" in the navbar (desktop and mobile) linking to `/fun/`, a page of small side projects as cards. First card: the word finder.
2. `/fun/word-finder/`: a client component, no network calls, nothing stored. Up to 7 letters like a Wordscapes wheel; lists every English word of 3+ letters makeable from them, each letter used at most as often as typed. Grouped by length, longest first, alphabetical within, with counts.
3. Optional pattern box with underscores for unknown letters (`_a_e`) that filters to words that fit.
4. Word list from a permissively licensed npm package (license noted in PLAN.md), plain lowercase words only, loaded only on this page.
5. Labeled inputs, results announced to screen readers, keyboard only works, no layout shift while typing. Handbook `bestPractices.md` applies.
6. Unit tests for the solver: letter counts, repeats, pattern filter, empty input.

## Stage 2: automatic project posting and devlogs

1. `portfolio.json` (documented in README.md): `show` (false by default), `slug`, `title`, `summary`, `tags`, `live`, `test` (optional), `section` (`main` or `fun`), plus optional fields matching `project-cards` columns. No file or `show: false` means it never appears. Private repos never get a repo link.
2. At build time, list Jake's repos with a read only `GITHUB_TOKEN`, read each `portfolio.json`, merge with `project-cards`: a matching slug fills in or overrides fields, otherwise it becomes a new card. Duplicate slugs or a broken manifest fail the build with a clear message. `fun` cards go on `/fun/`. No `GITHUB_TOKEN`: skip manifests with a build warning.
3. Devlogs: `devlog/*.md` in a shown repo renders at `/projects/<slug>/devlog/` (newest first) and `/projects/<slug>/devlog/<post>/`, linked from the project page when posts exist.
4. Rebuild on push: a reusable workflow that, on push to `main`, calls the Vercel deploy hook from the `XENSITE_DEPLOY_HOOK` secret. Short how to in the handbook (committed to its main).
5. XenSite gets its own `portfolio.json` and the workflow as the first example. Draft `portfolio.json` files for charityWater and loreal-Project in the hand back only.

## Finish

- One pull request from `funAndPosting` into `main`.
- Lighthouse Mobile (same CLI setup as the baseline, 3 runs, median) on a local production build of `/fun/word-finder/` and `/`.
- Hand back: what was built, the pull request and Vercel preview links, the scores, the For Jake list, and anything uncertain.

## For Jake

- **GitHub token:** create a fine grained token (GitHub, Settings, Developer settings, Fine grained tokens): resource owner Xenzoro, All repositories, Contents read only. Put it in `.env.local` as `GITHUB_TOKEN=` and in Vercel (Project Settings, Environment Variables) as `GITHUB_TOKEN` for Production and Preview, then redeploy. Until then builds warn and skip manifests.
- **Deploy hook:** in Vercel, Project Settings, Git, Deploy Hooks, create one for `main`. Add its URL as an Actions secret named `XENSITE_DEPLOY_HOOK` in every project repo that should rebuild the site, and copy `.github/workflows/notify-xensite.yml` into those repos. The reusable workflow is referenced at `@main`, so callers work once this branch is merged.
- **XenSite card and devlog:** `portfolio.json` has `show: true`, so after the merge (with the token set) XenSite gets its own card on the home page, without a cover image, and the devlog post `devlog/2026-10-25-porting-to-nextjs.md` goes live. I wrote both; edit or set `show` to false if you'd rather not.
- **charityWater and loreal-Project:** draft `portfolio.json` files are in the hand back. They reuse the existing Supabase slugs so they update the current cards instead of adding new ones.
- **Word list size:** the word finder uses SCOWL up to size 60 (27,876 common words). Rare but valid words (the kind Wordscapes counts as bonus words) are missing. Going to size 70 roughly doubles the list and the download; say if you want it.

## Log

| Date | What happened |
|---|---|
| 2026-10-25 | Plan written. Repo renamed to XenSite; `vanillaPrototype` and `failedPrototype` snapshot branches created; `nextjs` branch started with PLAN.md, NEXT.md, AGENTS.md and CLAUDE.md |
| 2026-10-25 | Steps 1 and 2: Baseline taken with the Lighthouse 13.4.1 CLI driving desktop Chrome (Mobile, 3 runs). Median Perf 70, A11y 91, BP 100, SEO 91, LCP 20.6s. Reports in the handbook's `reports/xensite/`, both handbook tables updated |
| 2026-10-25 | Steps 3 to 6: Next.js 16.4.3 scaffolded on `nextjs` (App Router, TypeScript, ESLint, `src/`, no Tailwind) with the export config, `.env.example`, `.gitignore` and a placeholder home page. `npm run build` writes `out/index.html`; `npm run lint` passes |
| 2026-10-25 | Phase 1 done. Phase 2 (layout and data) written |
| 2026-10-25 | Phase 2 never started. NEXT.md rewritten so Phases 2 to 5 run in one go (Stages A to E) |
| 2026-10-25 | Stage A: Archivo (local) and JetBrains Mono through `next/font`, theme tokens in `globals.css`, navbar ported (desktop liquid nav hides on scroll, hamburger menu with `aria-expanded`, Esc and focus return), layout with `<main>`, skip link and title template, typed `getProjects`, `getProject`, `getAbout`, `slugify` with duplicate and empty slug checks, `scripts/images.mjs` (local originals into `src/assets/`, Storage images into `public/media/` before each build) |
| 2026-10-25 | Stage B: home (intro, tag search grid, contact card), projects feed with search, 9 prebuilt `/projects/<slug>/` pages, about with gallery carousel and `<dialog>` lightbox, contact form (labeled, key from env), `not-found`, code highlighted at build time with refractor, Lenis and the intro animation on home only (skipped for reduced motion), `detail.html?id=N` redirect page generated from the data. Checked at 1400px and 375px |
| 2026-10-25 | Stage C: hero 38 KB, contact photo 14 KB, logo 8 KB, every Storage image under 300 KB as WebP; all images sized with alt, hero and about photo `fetchPriority="high"`, rest lazy; resume PDF in `public/`; Archivo subset to WOFF2 (89 KB to 19 KB); CSS inlined; nav links prefetch on hover instead of on load; gallery dots get 24px tap targets. Single local Lighthouse checks: A11y, BP and SEO 100 on every page, Perf 91 home, 93 detail |
| 2026-10-25 | Stage D: `deploy.yml` (push to `main`: install, lint, build with the three Actions secrets, publish `out/` with the official Pages actions), `public/.nojekyll`, vanilla site and `Prev-Tasks/` deleted from `nextjs` (kept in `vanillaPrototype`), ESLint ignores removed, README and AGENTS.md rewritten for the Next.js site |
| 2026-10-25 | Stage E: clean build, 46 scripted checks on the local build pass (every page and project at 1400px and 375px with no horizontal scroll, keyboard menu, tag search, feed search, terminal, gallery lightbox, form labels, skip link, `detail.html` redirect, 404). Hero photo box made fixed size after one Lighthouse run showed CLS 0.33. Local Lighthouse Mobile median of 3: Perf 91, A11y 100, BP 100, SEO 100, LCP 3.2s, TBT 10ms, CLS 0; logged in the handbook (committed to its main). PLAN.md feature statuses updated |
| 2026-10-25 | `slug` column added to `project-cards` in Supabase (migration `add_project_cards_slug`, approved by Jake), filled with the 9 slugs the build already used, unique and required. URLs unchanged |
| 2026-10-25 | Hosting switched to Vercel: base path removed (`src/lib/site.ts`), Pages workflow and `.nojekyll` deleted, docs updated |
| 2026-10-25 | Phase 6 written into PLAN.md and NEXT.md; `funAndPosting` branched from `main` |
| 2026-10-25 | Stage 1: "Fun" in the navbar, `/fun/` card page, `/fun/word-finder/` (letters and pattern inputs with labels and hints, letter tiles, polite status line, results grouped longest first with counts, Clear button), solver in `src/lib/wordFinder.ts` with 17 unit tests (`npm test`), SCOWL word list (27,876 words, 70 KB gzipped chunk loaded only by the word finder). Browser checks at 1400px and 375px: keyboard only, pattern, repeats, paste with spaces, no layout shift, no sideways scroll. SCOWL notice served at `/licenses/scowl.txt` and linked from the page; screen reader status waits for a pause in typing |
| 2026-10-25 | Stage 2: `scripts/github.mjs` (repo list and manifests through the GitHub API, warning only without `GITHUB_TOKEN`), `portfolio.ts` validation and merge, `projects.ts` for pages, devlog routes with markdown rendered at build time, "Code on GitHub", "Test Build" and devlog links, `fun` section cards on `/fun/`, manifest cover images through the WebP pipeline, `rebuild-site.yml` and `notify-xensite.yml`, XenSite `portfolio.json` and first devlog post, README section, handbook `portfolioPosting.md`. 35 unit tests. Checked end to end with the real repo list plus XenSite's manifest, a devlog post and a private test repo injected locally (not committed): merge, private repo rule, highlighting, HTML stripping, 375px widths |
