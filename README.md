# Jacob Martinez's Portfolio

My personal portfolio site, live at https://xenzoro.github.io/XenSite/. It's built to actually show the work, not just list it: coursework and personal projects across C++, x86-64 Assembly, Java, and web development, with real code excerpts and captured terminal output.

## Tech stack

- **Next.js 16** (App Router) with **TypeScript**, built as a static export (`output: "export"`) and served from the `/XenSite` path on GitHub Pages.
- **CSS Modules** per component, plus `src/app/globals.css` for the theme tokens. No Bootstrap.
- **Supabase** (Postgres and Storage) holds the project data and images. The site only reads from it.
- **GSAP** and **Lenis** for the home page intro and smooth scrolling, skipped when the visitor prefers reduced motion.
- **refractor** (Prism in Node) highlights code excerpts during the build, so no highlighting script reaches the browser.
- **sharp** converts images to WebP.

## Run it

```bash
npm install
cp .env.example .env.local   # then fill in the three values
npm run dev                  # http://localhost:3000/XenSite
npm run lint
npm run build                # static site in out/
```

`.env.local` needs `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_WEB3FORMS_KEY`. If one is missing, the build stops with a message naming it.

## How the data flows

Everything is fetched once, at build time:

1. `npm run build` first runs `scripts/images.mjs`. It reads both Supabase tables, downloads every image they point to from Storage, and writes sized WebP copies to `public/media/` plus a manifest in `src/lib/generated/media.json`. Both are gitignored and rebuilt every time.
2. `next build` renders every page. `src/lib/supabase.ts` reads the tables (`getProjects`, `getProject`, `getAbout`) and `src/lib/media.ts` swaps Storage URLs for the local WebP files.
3. The result in `out/` is plain HTML, CSS and JS. Pages arrive already filled in.

Changing data in Supabase needs a rebuild to show up (push to `main`, or rerun the deploy workflow).

### Tables

`project-cards`: `title`, `tools_used` (array of tags), `blurb`, `image_url`, `sort_order`, `long_description`, `code_snippets` (jsonb list of `{ label, language, code }`), `terminal_session` (jsonb list of `{ input, output }`), `demo_url`, and an optional `slug`.

`about-me`: `profile_photo_url` and `gallery` (jsonb list of `{ caption, images }`).

Row level security is on with a public read only policy. Any writes happen by hand in Supabase.

## Pages

- `/`: intro, the featured project grid with live tag search (tags come from the data, so they can't drift), and a contact card.
- `/projects/`: every project in full, with search.
- `/projects/<slug>/`: one prebuilt page per project: write up, code excerpts, then a terminal replay or a live demo link, depending on what the project has. The slug is the `slug` column when set, otherwise it comes from the title (`src/lib/slug.ts`). The build fails if two projects share a slug.
- `/about/`: about me, with a photo gallery. Cards with several photos get a small carousel and open in a lightbox.
- `/contact/`: a Web3Forms contact form. The Web3Forms access key is public by design; it only lets the form send to my inbox.
- `/detail.html?id=N`: old links from the vanilla site redirect to the matching `/projects/<slug>/`.

## The code and terminal output are real

Code snippets and terminal output come straight from the actual source repos and actual program runs. Where a project has a terminal section, it's labeled as captured output from a real run, not a live terminal, since nothing on the page actually runs code.

## Cover images

Each project's cover image is a custom generated diagram matching the site's dark theme, mostly for the C++ and Assembly projects, which have no real visual output to screenshot.

## Images

- Photos and the logo used directly by the pages live in `src/assets/` as WebP (made once with `node scripts/images.mjs local <folder of originals>`).
- Storage images are converted on every build, as above. Nothing over 300 KB ships.

## Deploy

`.github/workflows/deploy.yml` builds and publishes `out/` to GitHub Pages on every push to `main`. It needs the three `NEXT_PUBLIC_` values as repository secrets (Settings, Secrets and variables, Actions), and Pages set to deploy from GitHub Actions (Settings, Pages, Source).

## Folders

- `src/app/`: routes, one folder per page, with their CSS Modules
- `src/components/`: Navbar, Home, Project and About components
- `src/lib/`: Supabase reads, types, slugs, media lookup, highlighting
- `src/assets/`: committed WebP photos and logo
- `public/`: resume PDF and `.nojekyll`
- `scripts/images.mjs`: image conversion
