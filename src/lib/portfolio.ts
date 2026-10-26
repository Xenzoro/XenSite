// portfolio.json: lets a repo post itself to the site. These functions are pure so they can be unit tested;
// projects.ts feeds them the Supabase rows and the GitHub snapshot written by scripts/github.mjs.
import { isValidSlug } from "./slug.ts";
import type { CodeSnippet, Project, Section, TerminalStep } from "./types.ts";

export interface RepoSnapshot {
  name: string;
  fullName: string;
  private: boolean;
  htmlUrl: string;
  pushedAt: string;
  /** Raw text of portfolio.json */
  manifest: string;
  devlog: { file: string; content: string }[];
}

export interface Manifest {
  show: true;
  slug: string;
  title: string;
  summary: string;
  tags: string[];
  /** undefined: not given, so a matching Supabase row keeps its demo link; null: no live link */
  live?: string | null;
  test: string | null;
  section: Section;
  long_description?: string;
  code_snippets?: CodeSnippet[];
  terminal_session?: TerminalStep[];
  image_url?: string;
  sort_order?: number;
}

export interface ManifestEntry {
  repo: RepoSnapshot;
  manifest: Manifest;
}

const KNOWN_KEYS = new Set([
  "show", "slug", "title", "summary", "tags", "live", "test", "section",
  "long_description", "code_snippets", "terminal_session", "image_url", "sort_order",
  "$schema",
]);

export class ManifestError extends Error {
  constructor(repo: string, problem: string) {
    super(`portfolio.json in ${repo}: ${problem}`);
    this.name = "ManifestError";
  }
}

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

function isHttpUrl(value: unknown): value is string {
  if (typeof value !== "string") return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

/**
 * Validates one portfolio.json. Returns null when the project should not appear (show missing or false).
 * Throws ManifestError with a readable message when the file is broken. Unknown keys only produce warnings.
 */
export function parseManifest(raw: string, repo: string, warnings: string[] = []): Manifest | null {
  let data: unknown;
  try {
    data = JSON.parse(raw);
  } catch (error) {
    throw new ManifestError(repo, `is not valid JSON (${(error as Error).message})`);
  }
  if (!isRecord(data)) throw new ManifestError(repo, "must be a JSON object");

  const fail = (problem: string): never => {
    throw new ManifestError(repo, problem);
  };

  if (data.show !== undefined && typeof data.show !== "boolean") fail(`"show" must be true or false`);
  if (data.show !== true) return null;

  for (const key of Object.keys(data)) {
    if (!KNOWN_KEYS.has(key)) warnings.push(`portfolio.json in ${repo}: unknown field "${key}" was ignored`);
  }

  const text = (key: string): string => {
    const value = data[key];
    if (typeof value !== "string" || !value.trim()) fail(`"${key}" must be a non empty string`);
    return (value as string).trim();
  };
  const optionalUrl = (key: string): string | null | undefined => {
    const value = data[key];
    if (value === undefined || value === null) return value;
    if (!isHttpUrl(value)) fail(`"${key}" must be a full http or https URL, or null`);
    return value as string;
  };

  const slug = text("slug");
  if (!isValidSlug(slug)) fail(`"slug" must be lowercase words joined by hyphens, like "word-finder" (got "${slug}")`);

  const tags = data.tags;
  if (!Array.isArray(tags) || !tags.every((tag) => typeof tag === "string" && tag.trim())) {
    fail(`"tags" must be a list of strings`);
  }

  const section = data.section ?? "main";
  if (section !== "main" && section !== "fun") fail(`"section" must be "main" or "fun"`);

  const manifest: Manifest = {
    show: true,
    slug,
    title: text("title"),
    summary: text("summary"),
    tags: (tags as string[]).map((tag) => tag.trim()),
    test: optionalUrl("test") ?? null,
    section: section as Section,
  };
  if ("live" in data) manifest.live = optionalUrl("live") ?? null;

  if (data.long_description !== undefined) manifest.long_description = text("long_description");
  if (data.image_url !== undefined) {
    if (!isHttpUrl(data.image_url)) fail(`"image_url" must be a full http or https URL`);
    manifest.image_url = data.image_url as string;
  }
  if (data.sort_order !== undefined) {
    if (typeof data.sort_order !== "number" || !Number.isFinite(data.sort_order)) fail(`"sort_order" must be a number`);
    manifest.sort_order = data.sort_order as number;
  }
  if (data.code_snippets !== undefined) {
    const snippets = data.code_snippets;
    const ok =
      Array.isArray(snippets) &&
      snippets.every(
        (s) =>
          isRecord(s) &&
          typeof s.code === "string" &&
          (s.label === undefined || typeof s.label === "string") &&
          (s.language === undefined || typeof s.language === "string"),
      );
    if (!ok) fail(`"code_snippets" must be a list of { "label", "language", "code" } with "code" as a string`);
    manifest.code_snippets = snippets as CodeSnippet[];
  }
  if (data.terminal_session !== undefined) {
    const steps = data.terminal_session;
    const ok = Array.isArray(steps) && steps.every((s) => isRecord(s) && typeof s.input === "string" && typeof s.output === "string");
    if (!ok) fail(`"terminal_session" must be a list of { "input", "output" } strings`);
    manifest.terminal_session = steps as TerminalStep[];
  }
  return manifest;
}

/** Applies a manifest on top of a project (or builds a new one when there is no Supabase row) */
function applyManifest(base: Project | undefined, { manifest, repo }: ManifestEntry): Project {
  return {
    id: base?.id ?? null,
    slug: manifest.slug,
    title: manifest.title,
    tools: manifest.tags,
    blurb: manifest.summary,
    imageUrl: manifest.image_url ?? base?.imageUrl ?? null,
    longDescription: manifest.long_description ?? base?.longDescription ?? "",
    codeSnippets: manifest.code_snippets ?? base?.codeSnippets ?? [],
    terminalSession: manifest.terminal_session ?? base?.terminalSession ?? [],
    demoUrl: manifest.live !== undefined ? manifest.live : (base?.demoUrl ?? null),
    testUrl: manifest.test,
    // Private repos never get a repo link
    repoUrl: repo.private ? null : repo.htmlUrl,
    section: manifest.section,
    sortOrder: manifest.sort_order ?? base?.sortOrder ?? null,
  };
}

/**
 * Merges Supabase projects with shown manifests. A manifest whose slug matches a row fills in or overrides it;
 * any other manifest becomes a new project. Throws on invalid or duplicate slugs.
 * Order: by sort order (missing ones last), then manifest only projects by most recent push.
 */
export function mergeProjects(rows: readonly Project[], entries: readonly ManifestEntry[]): Project[] {
  const rowsBySlug = new Map<string, Project>();
  for (const row of rows) {
    if (!isValidSlug(row.slug)) {
      throw new Error(`"${row.title}" has the slug "${row.slug}", which is empty or not lowercase words joined by hyphens.`);
    }
    const other = rowsBySlug.get(row.slug);
    if (other) throw new Error(`"${other.title}" and "${row.title}" both have the slug "${row.slug}". Give one a different slug.`);
    rowsBySlug.set(row.slug, row);
  }

  const manifestRepo = new Map<string, string>();
  for (const { manifest, repo } of entries) {
    const other = manifestRepo.get(manifest.slug);
    if (other) {
      throw new Error(`The repos ${other} and ${repo.name} both use the slug "${manifest.slug}" in portfolio.json. Change one of them.`);
    }
    manifestRepo.set(manifest.slug, repo.name);
  }

  const pushedAt = new Map(entries.map((entry) => [entry.manifest.slug, entry.repo.pushedAt]));
  const merged = rows.map((row) => {
    const entry = entries.find((e) => e.manifest.slug === row.slug);
    return entry ? applyManifest(row, entry) : row;
  });
  for (const entry of entries) {
    if (!rowsBySlug.has(entry.manifest.slug)) merged.push(applyManifest(undefined, entry));
  }

  const position = new Map(merged.map((project, i) => [project.slug, i]));
  return merged.sort((a, b) => {
    const orderA = a.sortOrder ?? Number.POSITIVE_INFINITY;
    const orderB = b.sortOrder ?? Number.POSITIVE_INFINITY;
    if (orderA !== orderB) return orderA - orderB;
    const pushA = pushedAt.get(a.slug) ?? "";
    const pushB = pushedAt.get(b.slug) ?? "";
    if (pushA !== pushB) return pushB.localeCompare(pushA);
    return position.get(a.slug)! - position.get(b.slug)!;
  });
}

/** Parses every repo's manifest; repos that don't ask to be shown are left out */
export function collectManifests(repos: readonly RepoSnapshot[], warnings: string[] = []): ManifestEntry[] {
  const entries: ManifestEntry[] = [];
  for (const repo of repos) {
    const manifest = parseManifest(repo.manifest, repo.name, warnings);
    if (manifest) entries.push({ repo, manifest });
  }
  return entries;
}
