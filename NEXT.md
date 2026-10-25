# Next: Phase 1, baseline and scaffold

<!-- The current handoff. Read PLAN.md first for what the project is, its scope and its rules. -->

**Phase goal:** Record how the current site scores, then stand up an empty Next.js app on the `nextjs` branch that builds for GitHub Pages (PLAN.md features: Baseline, Scaffold).

## Steps

1. **Baseline (needs Jake's PC, a real Chrome):** follow the handbook's `lighthouse.md` on the live site `https://xenzoro.github.io/XenSite/`. Three Mobile runs, all categories. Save the JSON reports to the handbook as `reports/xensite/before-run1.json` to `before-run3.json`.
2. Log the median in the handbook: a row in `lighthouse.md`'s Results log and a new `### Project: XenSite` section in `nextjsMigration.md` with the Before row and the failing audits, matching the charityWater and loreal-Project entries.
3. On the `nextjs` branch, scaffold Next.js (App Router, TypeScript, ESLint, `src/` folder, no Tailwind) next to the existing files without deleting them yet.
4. Set `output: "export"`, `basePath: "/XenSite"`, `trailingSlash: true` and `images.unoptimized: true` in `next.config.ts`.
5. Add `.env.example` listing `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` and `NEXT_PUBLIC_WEB3FORMS_KEY` with placeholder values only. Add `.env.local` and `.next/`, `out/`, `node_modules/` to `.gitignore`.
6. Add a placeholder home page that says the port is in progress, so the build has something to export.

## Done when

- `reports/xensite/` in the handbook has three JSON reports and both handbook tables have the XenSite Before row.
- `npm run build` finishes with no errors and `out/index.html` exists.
- `npm run lint` passes.
- No keys or URLs with keys appear in any committed file (`git grep -i "eyJ"` returns nothing).

## Hand back to Jake

- The Before scores in one line, plus the top three failing audits.
- Whether the build and lint passed.
- Leave for Jake: filling in `.env.local` with the real values, and changing the Pages source to GitHub Actions (only when the port is ready to merge).

## Log

| Date | What happened |
|---|---|
| 2026-10-25 | Plan written. Repo renamed to XenSite; `vanillaPrototype` and `failedPrototype` snapshot branches created; `nextjs` branch started with PLAN.md, NEXT.md, AGENTS.md and CLAUDE.md |
