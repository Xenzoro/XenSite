// Read only Supabase access, used during `next build`. Nothing here ships to the browser.
import { cache } from "react";
import { isValidSlug, slugify } from "./slug";
import type { About, AboutRow, Project, ProjectRow } from "./types";

function requireEnv(name: "NEXT_PUBLIC_SUPABASE_URL" | "NEXT_PUBLIC_SUPABASE_ANON_KEY"): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `${name} is not set. Copy .env.example to .env.local and fill it in, or add it as an Actions secret in CI.`,
    );
  }
  return value;
}

async function select<T>(table: string, query: string): Promise<T[]> {
  const url = requireEnv("NEXT_PUBLIC_SUPABASE_URL");
  const key = requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  const res = await fetch(`${url}/rest/v1/${table}?${query}`, {
    headers: { apikey: key, Authorization: `Bearer ${key}` },
  });
  if (!res.ok) {
    throw new Error(`Supabase request for "${table}" failed: ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  if (!Array.isArray(data)) {
    throw new Error(`Supabase returned something other than a list for "${table}"`);
  }
  return data as T[];
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    slug: row.slug || slugify(row.title),
    title: row.title,
    tools: Array.isArray(row.tools_used) ? row.tools_used : [],
    blurb: row.blurb ?? "",
    imageUrl: row.image_url,
    longDescription: row.long_description ?? "",
    codeSnippets: Array.isArray(row.code_snippets) ? row.code_snippets : [],
    terminalSession: Array.isArray(row.terminal_session) ? row.terminal_session : [],
    demoUrl: row.demo_url,
  };
}

/** Every project, ordered by `sort_order`. Fails if two projects share a slug. */
export const getProjects = cache(async (): Promise<Project[]> => {
  const rows = await select<ProjectRow>("project-cards", "select=*&order=sort_order.asc");
  const projects = rows.map(toProject);

  const seen = new Map<string, string>();
  for (const project of projects) {
    if (!isValidSlug(project.slug)) {
      throw new Error(`"${project.title}" has the slug "${project.slug}", which is empty or not lowercase words joined by hyphens.`);
    }
    const other = seen.get(project.slug);
    if (other) {
      throw new Error(`"${other}" and "${project.title}" both have the slug "${project.slug}". Give one a different slug.`);
    }
    seen.set(project.slug, project.title);
  }
  return projects;
});

export async function getProject(slug: string): Promise<Project | undefined> {
  const projects = await getProjects();
  return projects.find((project) => project.slug === slug);
}

export const getAbout = cache(async (): Promise<About> => {
  const rows = await select<AboutRow>("about-me", "id=eq.1&select=*");
  const row = rows[0];
  return {
    profilePhotoUrl: row?.profile_photo_url ?? null,
    gallery: Array.isArray(row?.gallery)
      ? row.gallery.map((item) => ({
          caption: item.caption ?? "",
          images: Array.isArray(item.images) ? item.images.filter(Boolean) : [],
        }))
      : [],
  };
});
