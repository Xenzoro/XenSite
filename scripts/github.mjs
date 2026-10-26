// Reads portfolio.json and devlog/*.md from Jake's GitHub repos and saves them to src/lib/generated/github.json
// (gitignored). The site build validates that snapshot and merges it with Supabase (src/lib/portfolio.ts).
//
// Needs GITHUB_TOKEN: a read only token (see README.md). Without it the snapshot is marked "skipped", the build
// prints a warning, and the site builds from Supabase alone. With a token, any GitHub error stops the build.
// Runs before `npm run dev` (with --soft: a failure keeps the last snapshot) and `npm run build`.

import { existsSync } from "node:fs";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "src/lib/generated/github.json");
const API = "https://api.github.com";
const MAX_POSTS = 200;

async function save(snapshot) {
  await mkdir(path.dirname(out), { recursive: true });
  await writeFile(out, `${JSON.stringify(snapshot, null, 2)}\n`);
}

function client(token) {
  const headers = {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "xensite-build",
  };
  return async function request(url, { allow404 = false } = {}) {
    const full = url.startsWith("/") ? `${API}${url}` : url;
    // The token only ever goes to the GitHub API, even if a pagination link pointed elsewhere
    if (!full.startsWith(`${API}/`)) throw new Error(`Refusing to send the GitHub token to ${new URL(full).host}`);
    const res = await fetch(full, { headers });
    if (allow404 && res.status === 404) return { data: null, res };
    if (res.status === 401) throw new Error("GitHub rejected GITHUB_TOKEN (401). Check that it hasn't expired.");
    if (!res.ok) throw new Error(`GitHub request failed: ${res.status} ${res.statusText} for ${url.replace(API, "")}`);
    return { data: await res.json(), res };
  };
}

// Repos the token can see that Jake owns, following pagination
async function listRepos(request) {
  const repos = [];
  let url = "/user/repos?per_page=100&affiliation=owner&sort=pushed";
  while (url) {
    const { data, res } = await request(url);
    repos.push(...data);
    url = res.headers.get("link")?.match(/<([^>]+)>;\s*rel="next"/)?.[1] ?? null;
  }
  return repos;
}

function decode(file) {
  return Buffer.from(file.content ?? "", file.encoding === "base64" ? "base64" : "utf8").toString("utf8");
}

// Only the fields the build needs, so the snapshot stays small
async function readRepo(request, repo) {
  const base = `/repos/${repo.full_name}/contents`;
  const { data: file } = await request(`${base}/portfolio.json`, { allow404: true });
  if (!file || Array.isArray(file)) return null;
  const manifest = decode(file);

  const snapshot = {
    name: repo.name,
    fullName: repo.full_name,
    private: repo.private,
    htmlUrl: repo.html_url,
    pushedAt: repo.pushed_at,
    manifest,
    devlog: [],
  };

  // Devlogs are only fetched for manifests that ask to be shown; broken JSON is reported later by the build
  let show = false;
  try {
    show = JSON.parse(manifest)?.show === true;
  } catch {
    return snapshot;
  }
  if (!show) return snapshot;

  const { data: entries } = await request(`${base}/devlog`, { allow404: true });
  if (Array.isArray(entries)) {
    const posts = entries.filter((entry) => entry.type === "file" && entry.name.toLowerCase().endsWith(".md"));
    if (posts.length > MAX_POSTS) throw new Error(`${repo.name}/devlog has ${posts.length} posts; the limit is ${MAX_POSTS}.`);
    for (const post of posts) {
      const { data } = await request(`${base}/devlog/${encodeURIComponent(post.name)}`);
      snapshot.devlog.push({ file: post.name, content: decode(data) });
    }
  }
  return snapshot;
}

async function main() {
  const envFile = path.join(root, ".env.local");
  if (existsSync(envFile)) process.loadEnvFile(envFile);
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    await save({ status: "skipped", reason: "GITHUB_TOKEN is not set", repos: [] });
    console.warn("github: GITHUB_TOKEN is not set, so portfolio.json manifests and devlogs are skipped. The site builds from Supabase only.");
    return;
  }

  const request = client(token);
  const repos = (await listRepos(request)).filter((repo) => !repo.fork);
  const found = [];
  // A few at a time keeps this quick without hammering the API
  for (let i = 0; i < repos.length; i += 6) {
    const batch = await Promise.all(repos.slice(i, i + 6).map((repo) => readRepo(request, repo)));
    found.push(...batch.filter(Boolean));
  }
  await save({ status: "ok", repos: found });
  const posts = found.reduce((total, repo) => total + repo.devlog.length, 0);
  console.log(`github: ${repos.length} repos checked, ${found.length} with portfolio.json, ${posts} devlog posts`);
}

try {
  await main();
} catch (error) {
  if (process.argv.includes("--soft") && existsSync(out)) {
    console.warn(`github: refresh failed, keeping the last snapshot (${error.message})`);
  } else {
    throw error;
  }
}
