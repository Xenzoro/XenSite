# Next: Phases 2 to 5, the whole port in one run

<!-- The current handoff. Read PLAN.md first for what the project is, its scope and its rules. -->

**Goal:** Finish the Next.js port end to end in one run, so the `nextjs` branch is ready for Jake to test and merge. Delivers every PLAN.md feature from Layout through After report.

## How to run this

- **Branch:** work on `nextjs`. Jake already chose it for this run, so don't ask.
- **Don't stop to ask.** If something needs Jake (a secret, a dashboard setting, a decision listed under PLAN.md's Open questions), write it under "Hand back" and keep going with the rest.
- **Save progress often.** After each stage: `npm run lint` and `npm run build` pass, run the `reviewer` subagent and fix "Must fix", then commit and push to `nextjs`. A restart must never lose more than one stage.
- **Look before you port.** For each piece, read the matching old file in `project-files/` (HTML, CSS, JS) and keep the look and behavior the same. This is a port, not a redesign.
- **Next.js 16:** check `node_modules/next/dist/docs/` before using an API you're unsure of.
- Log each finished stage in the Log table below.

## Stage A: layout and data

1. **Fonts:** Archivo from `project-files/archivo.ttf` via `next/font/local` (copy it to `src/app/fonts/`), JetBrains Mono via `next/font/google`. Both as CSS variables; code uses JetBrains Mono, everything else Archivo.
2. **Theme:** colors, spacing and the dark background from `main.css` and `navbar.css` become variables in `src/app/globals.css`. No Bootstrap.
3. **Navbar:** port the desktop "liquid" nav and mobile hamburger into `src/components/Navbar/` (CSS Module). Only the toggle is a client component. `next/link` for Home, Projects, About Me, Contact. Hamburger has `aria-expanded` and `aria-controls`; Esc closes it; focus stays visible.
4. **Layout:** navbar plus `<main>`, `lang="en"`, title template `%s | Jacob Martinez`, a meta description.
5. **Data:** `src/lib/supabase.ts` with typed `getProjects()` (by `sort_order`), `getProject(slug)` and `getAbout()`, using plain `fetch` with `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` at build time. Missing variables fail the build with a clear message. Types in `src/lib/types.ts`, shaped by how the old `detail.js` and `about-me.js` read `code_snippets`, `terminal_session` and the gallery.
6. **Slugs:** `src/lib/slug.ts` exports `slugify(title)` (lowercase, words joined by a hyphen, symbols dropped). A project's slug is its `slug` column when present, otherwise `slugify(title)`. Fail the build if two projects end up with the same slug.

## Stage B: pages

1. **Home** (`/`): intro with profile photo, resume button, "Featured Projects" grid with the live tag search and chips (client component), and the contact card. Cards link to `/projects/<slug>`.
2. **Projects** (`/projects/`): the full feed from `projects-full.js`, in `sort_order`.
3. **Project detail** (`/projects/[slug]/`): `generateStaticParams` builds one page per project. Write up, code excerpts, then the terminal replay or the demo link, exactly as `detail.js` decides. Per page `<title>` and description from the project.
4. **About** (`/about/`): everything `about-me.js` renders from `about-me`, including the gallery with a carousel for cards that have several photos.
5. **Contact** (`/contact/`): the Web3Forms form posting to the same endpoint, access key from `NEXT_PUBLIC_WEB3FORMS_KEY`, every input labeled.
6. **Not found:** a simple `not-found.tsx` in the same style.
7. **Highlighting at build time:** render code excerpts to highlighted HTML during the build (for example `shiki` or `prism` run in a server component) for C, C++, NASM, Java, Python, JavaScript, Bash, SQL, CSS and HTML. No highlighting scripts reach the browser.
8. **Animations:** GSAP, ScrollTrigger and Lenis from npm, in small client components, matching `main.js` and `contact-outro.js`. Respect `prefers-reduced-motion`.
9. **Old links:** add `detail.html` handling so an old `detail.html?id=N` link redirects to the right `/projects/<slug>/` (a tiny static page with a script mapping ids to slugs is fine).

## Stage C: images and polish

1. Convert every image the new site uses (both selfies, logos, contact image) to WebP or AVIF with `sharp` (dev dependency, one script in `scripts/`), into `public/`. No image over 300 KB; the hero photo under 150 KB.
2. Every `<img>` has width and height, meaningful `alt`, and `loading="lazy"` except the largest one above the fold, which gets `fetchPriority="high"`.
3. Copy the resume PDF into `public/` and point the button at it.
4. Fix the baseline's failures: text contrast to WCAG AA, heading order with one `<h1>` per page, meta description on every page.
5. Go through `~/projects/webdevhandbook/bestPractices.md` line by line and fix anything the new site breaks.

## Stage D: deploy setup and cleanup

1. Add `.github/workflows/deploy.yml`: on push to `main`, install, build with the three `NEXT_PUBLIC_` values from Actions secrets, and publish `out/` with the official Pages actions. Add `public/.nojekyll`.
2. Delete the vanilla site from `nextjs`: `index.html`, `detail.html` (replaced by the redirect from Stage B), `project-files/`, and `Prev-Tasks/`. All of it stays in `vanillaPrototype`. Remove their ESLint ignores.
3. Update `README.md` for the Next.js site: stack, how to run, how data flows, where deploy is configured.
4. Update `AGENTS.md`'s folder notes now that the vanilla site is gone.

## Stage E: check everything

1. `npm run build`, then serve `out/` locally under `/XenSite` (for example `npx serve` from a folder that maps `/XenSite` to `out/`) and click through every page and every project at desktop and 375px width. Keyboard only works too.
2. Run Lighthouse (same CLI and Mobile settings as the baseline) against the local build, 3 runs, median. Log it in the handbook's `nextjsMigration.md` XenSite section as a "Local build" row, clearly marked as not yet live. Commit the handbook straight to main.
3. Update PLAN.md's Features table statuses.

## Done when

- Every stage is committed and pushed to `nextjs`, and `npm run lint` and `npm run build` pass on the last commit.
- Every project has a prebuilt page, every page has a title, description and `<main>`, and no image is over 300 KB.
- No key or Supabase URL appears in any committed file.
- Local Lighthouse median is logged in the handbook.

## Hand back to Jake

- One short summary: what was built, and the local Lighthouse scores next to the baseline (Perf 70, A11y 91, BP 100, SEO 91, LCP 20.6s).
- **Slug table and SQL:** each title with its slug, plus one SQL statement that adds a unique `slug` text column to `project-cards` and fills it with exactly those values. Jake runs it himself in the Supabase SQL Editor. URLs won't change when he does.
- **Merge checklist** for Jake, in order: add the three Actions secrets, switch Pages source to GitHub Actions, merge `nextjs` into `main`, check the live site, then rerun Lighthouse on it for the After row.
- Anything that didn't port cleanly or that you weren't sure about.

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
