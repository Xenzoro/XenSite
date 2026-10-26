# Next: Phase 2, layout and data

<!-- The current handoff. Read PLAN.md first for what the project is, its scope and its rules. -->

**Phase goal:** Every page shares one real layout (navbar, fonts, theme, landmarks), and the build can read both Supabase tables with types, so Phase 3 can port pages (PLAN.md features: Layout; groundwork for Home, Projects feed, Project detail, About).

## Steps

1. **Fonts:** load Archivo from `project-files/archivo.ttf` with `next/font/local` (copy the file into `src/app/fonts/`) and JetBrains Mono with `next/font/google`. Expose both as CSS variables. Code blocks use JetBrains Mono, everything else Archivo, matching the old site.
2. **Theme:** move the old site's colors, spacing and the dark background from `project-files/css/main.css` and `navbar.css` into theme variables in `src/app/globals.css`. No Bootstrap. Keep it visually the same.
3. **Navbar:** port the desktop "liquid" navbar and the mobile hamburger menu (`navbar.css`, `navbar.js`) into `src/components/Navbar/` with a CSS Module. Only the menu toggle is a client component. Links use `next/link` (Home, Projects, About Me, Contact) so the `/XenSite` path is handled. The hamburger has `aria-expanded` and `aria-controls`, Esc closes the menu, and focus stays visible.
4. **Layout:** `src/app/layout.tsx` renders the navbar and wraps page content in `<main>`, sets `lang="en"`, the site title template (`%s | Jacob Martinez`) and a meta description. This fixes the baseline's missing landmark and description.
5. **Data helper:** `src/lib/supabase.ts` with typed functions `getProjects()` (ordered by `sort_order`) and `getAbout()`, reading `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` at build time with plain `fetch` (no client library needed). If either variable is missing, the build fails with a clear message. Types in `src/lib/types.ts`, based on the columns in PLAN.md and how `project-files/js/detail.js` and `about-me.js` read `code_snippets`, `terminal_session` and the gallery.
6. **Prove the data path:** the placeholder home page lists project titles from `getProjects()` so the build shows real data. Phase 3 replaces it.
7. **Slugs (proposal only):** using `getProjects()`, list every project's title next to a proposed slug (lowercase, words joined with a hyphen, like `mips-calculator`, since URLs need a separator). Put the list and a ready to run SQL statement that adds a unique `slug` text column and fills it in under "Hand back". Don't run it.

## Done when

- `npm run build` passes with Jake's `.env.local` and fails with a clear message when a variable is removed.
- `npm run lint` passes.
- The home page shows real project titles, inside `<main>`, with the navbar above it.
- At 375px wide the hamburger opens and closes by click, Enter and Esc; at desktop width the full navbar shows.
- No key or Supabase URL appears in any committed file.

## Hand back to Jake

- A screenshot or plain description of the navbar at desktop and phone width.
- The slug table (title, proposed slug) and the SQL to add the column, for Jake to approve and run in the Supabase dashboard himself.
- Anything in the old CSS that didn't port cleanly.

## Log

| Date | What happened |
|---|---|
| 2026-10-25 | Plan written. Repo renamed to XenSite; `vanillaPrototype` and `failedPrototype` snapshot branches created; `nextjs` branch started with PLAN.md, NEXT.md, AGENTS.md and CLAUDE.md |
| 2026-10-25 | Steps 1 and 2: Baseline taken with the Lighthouse 13.4.1 CLI driving desktop Chrome (Mobile, 3 runs). Median Perf 70, A11y 91, BP 100, SEO 91, LCP 20.6s. Reports in the handbook's `reports/xensite/`, both handbook tables updated |
| 2026-10-25 | Steps 3 to 6: Next.js 16.4.3 scaffolded on `nextjs` (App Router, TypeScript, ESLint, `src/`, no Tailwind) with the export config, `.env.example`, `.gitignore` and a placeholder home page. `npm run build` writes `out/index.html`; `npm run lint` passes |
| 2026-10-25 | Phase 1 done. Phase 2 (layout and data) written |
