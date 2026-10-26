# Jacob Martinez's Portfolio

My personal portfolio site, hosted on Vercel. It's built to actually show the work, not just list it: coursework and personal projects across C++, x86-64 Assembly, Java, and web development, with real code excerpts and captured terminal output.

## Tech stack

- **Next.js 16** (App Router) with **TypeScript**, built as a static export (`output: "export"`) and hosted on Vercel.
- **CSS Modules** per component, plus `src/app/globals.css` for the theme tokens. No Bootstrap.
- **Supabase** (Postgres and Storage) holds the project data and images. The site only reads from it.
- **GSAP** and **Lenis** for the home page intro and smooth scrolling, skipped when the visitor prefers reduced motion.
- **refractor** (Prism in Node) highlights code excerpts during the build, so no highlighting script reaches the browser.
- **sharp** converts images to WebP.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the three values
npm run dev                  # http://localhost:3000
npm run lint
npm test                     # unit tests (Node's built in runner)
npm run build                # static site in out/
```

`.env.local` needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_WEB3FORMS_KEY`. If one is missing, the build stops with a message naming it. `GITHUB_TOKEN` is optional (see [Projects from other repos](#projects-from-other-repos-portfoliojson)).

`npm run dev` and `npm run build` first run three scripts that write gitignored files into `src/lib/generated/` (and `public/media/`): `scripts/words.mjs` (word finder dictionary), `scripts/github.mjs` (portfolio.json snapshot) and `scripts/images.mjs` (WebP images). Run `npm run build` once on a fresh clone before running `tsc` on its own, since those files are imported.

## How the data flows

Everything is fetched once, at build time:

1. `scripts/github.mjs` lists my GitHub repos and saves every `portfolio.json` and `devlog/*.md` it finds to `src/lib/generated/github.json` (skipped with a warning when `GITHUB_TOKEN` is not set).
2. `scripts/images.mjs` reads both Supabase tables and the shown manifests, downloads every image they point to, and writes sized WebP copies to `public/media/` plus a manifest in `src/lib/generated/media.json`. Both are gitignored and rebuilt every time.
3. `next build` renders every page. `src/lib/supabase.ts` reads the tables, `src/lib/portfolio.ts` validates the manifests and merges them in, `src/lib/projects.ts` is what pages ask for projects and devlogs, and `src/lib/media.ts` swaps image URLs for the local WebP files.
4. The result in `out/` is plain HTML, CSS and JS. Pages arrive already filled in.

Changing data in Supabase needs a rebuild to show up (push to `main`, redeploy in Vercel, or push to any project repo that calls the rebuild workflow below).

### Tables

`project-cards`: `title`, `tools_used` (array of tags), `blurb`, `image_url`, `sort_order`, `long_description`, `code_snippets` (jsonb list of `{ label, language, code }`), `terminal_session` (jsonb list of `{ input, output }`), `demo_url`, and an optional `slug`.

`about-me`: `profile_photo_url` and `gallery` (jsonb list of `{ caption, images }`).

Row level security is on with a public read only policy. Any writes happen by hand in Supabase.

## Pages

- `/`: intro, the featured project grid with live tag search (tags come from the data, so they can't drift), and a contact card.
- `/projects/`: every project in full, with search.
- `/projects/<slug>/`: one prebuilt page per project: write up, code excerpts, then a terminal replay or a live demo link, depending on what the project has. Projects from a public repo's `portfolio.json` also link to the code, and to the devlog when it has posts. The slug is the `slug` column when set, otherwise it comes from the title (`src/lib/slug.ts`). The build fails if two projects share a slug.
- `/projects/<slug>/devlog/` and `/projects/<slug>/devlog/<post>/`: devlog posts from the project repo's `devlog/` folder, newest first.
- `/fun/`: small side projects. `/fun/word-finder/` lists every word you can make from up to seven letters, with an optional `_a_e` pattern; it runs entirely in the browser with a SCOWL word list (notice at `/licenses/scowl.txt`).
- `/about/`: about me, with a photo gallery. Cards with several photos get a small carousel and open in a lightbox.
- `/contact/`: a Web3Forms contact form. The Web3Forms access key is public by design; it only lets the form send to my inbox.
- `/detail.html?id=N`: old links from the vanilla site redirect to the matching `/projects/<slug>/`.

## Projects from other repos (portfolio.json)

Any of my repos can put itself on the site by adding a `portfolio.json` at its root. At build time the site reads every repo's manifest and merges it with the `project-cards` rows: when the `slug` matches a row, the manifest fills in or overrides that row's fields; otherwise it becomes a new project. No file, or `"show": false`, means the repo never appears.

```json
{
  "show": true,
  "slug": "aqua-blaster",
  "title": "Aqua Blaster",
  "summary": "One or two sentences for the card.",
  "tags": ["JavaScript", "Game Dev"],
  "live": "https://xenzoro.github.io/charityWater/",
  "test": "https://example.com/preview",
  "section": "main"
}
```

| Field | Required | What it does |
| --- | --- | --- |
| `show` | no, default `false` | Only `true` puts the project on the site |
| `slug` | yes | URL name, lowercase words joined by hyphens: `/projects/<slug>/`. Matching a `project-cards` slug overrides that row |
| `title` | yes | Card and page title |
| `summary` | yes | Card text (the `blurb` column) |
| `tags` | yes | List of tools, shown as tags and used by the home page tag search (the `tools_used` column) |
| `live` | no | Live site URL for the "View Live Demo" button (the `demo_url` column). `null` removes a demo link the row has |
| `test` | no | URL of a test or preview build, shown as a "Test Build" link |
| `section` | no, default `"main"` | `"main"` shows on the home page and the projects feed; `"fun"` shows on `/fun/` |
| `long_description` | no | Write up on the project page |
| `code_snippets` | no | List of `{ "label", "language", "code" }`, highlighted at build time |
| `terminal_session` | no | List of `{ "input", "output" }` for the terminal replay |
| `image_url` | no | Full `https` URL of a cover image anyone can download; converted to WebP at build time |
| `sort_order` | no | Position among the projects (lower first). Without it, new projects go after the Supabase ones, most recently pushed first |

Rules the build enforces:

- A manifest that isn't valid JSON, or has a wrong field type, fails the build with a message naming the repo and the field. That includes a `portfolio.json` with `"show": false`: any file by that name has to be valid JSON. Unknown fields only print a warning.
- Two repos with the same `slug` fail the build.
- **Private repos never get a repo link.** Public repos get a "Code on GitHub" link on their project page. Everything else a shown private repo provides (its card, cover image and devlog posts) is public on the site.
- Forks are ignored.

### Devlogs

Markdown files in a shown repo's `devlog/` folder become posts at `/projects/<slug>/devlog/<post>/`, listed newest first at `/projects/<slug>/devlog/`, and the project page links to them. Each post needs a date, either in front matter or as a `YYYY-MM-DD-` file name prefix:

```markdown
---
title: Porting XenSite to Next.js
date: 2026-10-25
summary: One line for the post list
---

The post, in GitHub flavored markdown.
```

Without a `title`, a `# ` heading on the first line is used, otherwise the file name. Headings in the post move down one level (`#` becomes the page's second level), since the post title is the page heading. The URL comes from the file name (minus the date). Raw HTML in posts is dropped, links and images other than web, mail or site paths are removed, fenced code blocks are highlighted, and images need full URLs.

### GITHUB_TOKEN

The build reads the manifests with a read only GitHub token:

1. GitHub, Settings, Developer settings, Fine grained tokens, Generate new token. Resource owner: Xenzoro. Repository access: All repositories (so private ones can post too). Permissions: Contents read only (Metadata read only comes with it). Pick an expiry and set a reminder.
2. Put it in `.env.local` as `GITHUB_TOKEN=...` for local builds, and in Vercel, Project Settings, Environment Variables, as `GITHUB_TOKEN` for Production and Preview.

Without the token the build still works: it prints a warning and uses Supabase alone.

### Rebuild when a project changes

Vercel only rebuilds when this repo changes, so project repos ping it:

1. In Vercel, Project Settings, Git, Deploy Hooks, create a hook named `project repos` for the `main` branch, and copy its URL.
2. In each project repo, Settings, Secrets and variables, Actions, add a repository secret named `XENSITE_DEPLOY_HOOK` with that URL.
3. Copy `.github/workflows/notify-xensite.yml` from this repo into the project repo's `.github/workflows/`. On every push to its `main`, it calls the reusable `rebuild-site.yml` here, which posts to the hook. Without the secret it only warns.

XenSite has its own `portfolio.json`, `devlog/` and the caller workflow as the example; the caller skips itself here because Vercel already redeploys XenSite on every push.

## The code and terminal output are real

Code snippets and terminal output come straight from the actual source repos and actual program runs. Where a project has a terminal section, it's labeled as captured output from a real run, not a live terminal, since nothing on the page actually runs code.

## Cover images

Each project's cover image is a custom generated diagram matching the site's dark theme, mostly for the C++ and Assembly projects, which have no real visual output to screenshot.

## Images

- Photos and the logo used directly by the pages live in `src/assets/` as WebP (made once with `node scripts/images.mjs local <folder of originals>`).
- Storage images are converted on every build, as above. Nothing over 300 KB ships.

## Deploy

Vercel is connected to this repo. Every push to `main` deploys to production, and every other branch gets its own preview URL. The three `NEXT_PUBLIC_` values from `.env.example` and the optional `GITHUB_TOKEN` are Vercel environment variables. Project repos trigger rebuilds through the deploy hook above.

## Folders

- `src/app/`: routes, one folder per page, with their CSS Modules
- `src/components/`: Navbar, Home, Fun, Project and About components
- `src/lib/`: Supabase reads, manifests and merging (`portfolio.ts`, `projects.ts`), devlogs and markdown, the word finder solver, types, slugs, media lookup, highlighting. Tests sit next to what they test (`*.test.ts`)
- `src/assets/`: committed WebP photos and logo
- `public/`: resume PDF and the SCOWL notice
- `scripts/`: `words.mjs`, `github.mjs` and `images.mjs`, which run before every build
- `portfolio.json`, `devlog/`: this site's own entry, as the example
- `.github/workflows/`: `rebuild-site.yml` (reusable) and `notify-xensite.yml` (the caller to copy)
