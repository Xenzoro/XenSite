// The one place pages get projects from: Supabase rows merged with portfolio.json manifests from GitHub.
import { cache } from "react";
import { parsePosts, type DevlogPost } from "./devlog";
import snapshot from "./generated/github.json";
import { collectManifests, mergeProjects, type RepoSnapshot } from "./portfolio";
import { getProjectRows } from "./supabase";
import type { Project, Section } from "./types";

interface Snapshot {
  status: "ok" | "skipped";
  reason?: string;
  repos: RepoSnapshot[];
}

const github = snapshot as Snapshot;

// Warnings print once per build worker; they never stop the build
let warned = false;
function warnOnce(messages: string[]) {
  if (warned || messages.length === 0) return;
  warned = true;
  for (const message of messages) console.warn(`warning: ${message}`);
}

const getMerged = cache(async () => {
  const warnings: string[] = [];
  if (github.status === "skipped") {
    warnings.push(`portfolio.json manifests skipped (${github.reason ?? "no snapshot"}). Set GITHUB_TOKEN to include them.`);
  }
  const entries = collectManifests(github.repos, warnings);
  const projects = mergeProjects(await getProjectRows(), entries);

  const devlogs = new Map<string, DevlogPost[]>();
  for (const { repo, manifest } of entries) {
    if (repo.devlog.length) devlogs.set(manifest.slug, parsePosts(repo.name, repo.devlog));
  }
  warnOnce(warnings);
  return { projects, devlogs };
});

/** Every shown project, both sections */
export async function getAllProjects(): Promise<Project[]> {
  return (await getMerged()).projects;
}

/** Projects for one section: "main" for the home page and feed, "fun" for /fun/ */
export async function getProjects(section: Section = "main"): Promise<Project[]> {
  return (await getAllProjects()).filter((project) => project.section === section);
}

export async function getProject(slug: string): Promise<Project | undefined> {
  return (await getAllProjects()).find((project) => project.slug === slug);
}

/** Devlog posts for a project, newest first (empty when it has none) */
export async function getDevlog(slug: string): Promise<DevlogPost[]> {
  return (await getMerged()).devlogs.get(slug) ?? [];
}

/** Every project with at least one devlog post */
export async function getDevlogs(): Promise<Map<string, DevlogPost[]>> {
  return (await getMerged()).devlogs;
}
