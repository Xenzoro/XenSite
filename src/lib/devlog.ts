// Devlog posts: markdown files in a repo's devlog/ folder. Pure parsing, so it can be unit tested.
//
// A post can start with front matter:
//   ---
//   title: Porting to Next.js
//   date: 2026-10-25
//   summary: One line shown in the post list
//   ---
// Without it, the date comes from a "2026-10-25-" file name prefix and the title from a "# " heading on the first line.
import { isValidSlug, slugify } from "./slug.ts";

export interface DevlogPost {
  slug: string;
  title: string;
  /** YYYY-MM-DD */
  date: string;
  summary: string;
  markdown: string;
}

const DATE = /^\d{4}-\d{2}-\d{2}$/;

function isRealDate(value: string): boolean {
  if (!DATE.test(value)) return false;
  const date = new Date(`${value}T00:00:00Z`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function frontMatter(content: string): { fields: Record<string, string>; body: string } {
  const text = content.replace(/^﻿/, "").replace(/\r\n/g, "\n");
  const match = text.match(/^---\n([\s\S]*?)\n---\n?/);
  if (!match) return { fields: {}, body: text };
  const fields: Record<string, string> = {};
  for (const line of match[1].split("\n")) {
    const pair = line.match(/^([A-Za-z_]+):\s*(.*)$/);
    if (pair) fields[pair[1].toLowerCase()] = pair[2].trim().replace(/^(["'])(.*)\1$/, "$2");
  }
  return { fields, body: text.slice(match[0].length) };
}

/** Parses one post. Throws with the repo and file name when the date or slug can't be worked out. */
export function parsePost(repo: string, file: string, content: string): DevlogPost {
  const where = `devlog/${file} in ${repo}`;
  const stem = file.replace(/\.md$/i, "");
  const prefix = stem.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
  const { fields, body } = frontMatter(content);

  const date = fields.date ?? prefix?.[1];
  if (!date) throw new Error(`${where}: add a "date: YYYY-MM-DD" line to its front matter or start the file name with the date.`);
  if (!isRealDate(date)) throw new Error(`${where}: "${date}" is not a real date in YYYY-MM-DD form.`);

  let markdown = body.trim();
  let title = fields.title;
  if (!title) {
    // A "# " heading on the first line becomes the title and leaves the body, so the page doesn't show it twice.
    // Only the first line counts: a "# comment" inside a code block further down is not a title.
    const heading = markdown.match(/^#\s+(.+)(\n|$)/);
    if (heading) {
      title = heading[1].trim();
      markdown = markdown.slice(heading[0].length).trim();
    } else {
      title = (prefix?.[2] ?? stem).replace(/[-_]+/g, " ");
    }
  }

  const slug = slugify(fields.slug ?? prefix?.[2] ?? stem);
  if (!isValidSlug(slug)) throw new Error(`${where}: can't make a URL from the file name; rename it with letters or numbers.`);

  return { slug, title, date, summary: fields.summary ?? "", markdown };
}

/** All posts for a repo, newest first. Throws if two posts end up with the same URL. */
export function parsePosts(repo: string, files: readonly { file: string; content: string }[]): DevlogPost[] {
  const posts = files.map(({ file, content }) => parsePost(repo, file, content));
  const seen = new Set<string>();
  for (const post of posts) {
    if (seen.has(post.slug)) throw new Error(`devlog in ${repo}: two posts both become "${post.slug}"; rename one of them.`);
    seen.add(post.slug);
  }
  return posts.sort((a, b) => b.date.localeCompare(a.date) || a.title.localeCompare(b.title));
}

/** "2026-10-25" to "October 25, 2026", without time zone surprises */
export function formatDate(date: string): string {
  return new Date(`${date}T12:00:00Z`).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}
