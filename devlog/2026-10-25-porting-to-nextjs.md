---
title: Porting XenSite to Next.js
date: 2026-10-25
summary: From a vanilla site that loaded everything in the browser to a static Next.js build, and what changed in the scores.
---

The first version of this site was plain HTML, CSS and JavaScript with Bootstrap. Every page fetched its projects from Supabase after it loaded, so visitors saw an empty page first, and the photos were straight off my phone at over 2 MB each.

## What changed

- **Built ahead of time.** Next.js reads Supabase during the build and writes every page as finished HTML, so nothing waits on the database in the browser.
- **Images.** A build script downloads the photos from Supabase Storage and converts them to WebP at the sizes the pages actually use. Nothing over 300 KB ships.
- **Code highlighting at build time.** The code excerpts are highlighted while the site builds, so no highlighting library is sent to the browser.
- **Readable links.** Projects live at `/projects/<slug>/` instead of `detail.html?id=3`, and the old links still redirect.

## Scores

| | Performance | Accessibility | SEO | Largest paint |
| --- | --- | --- | --- | --- |
| Before | 70 | 91 | 91 | 20.6 s |
| After | 95 | 100 | 100 | 2.6 s |

Lighthouse mobile, median of three runs.
