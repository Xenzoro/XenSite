import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { collectManifests, mergeProjects, parseManifest, type ManifestEntry, type RepoSnapshot } from "./portfolio.ts";
import type { Project } from "./types.ts";

function row(slug: string, extra: Partial<Project> = {}): Project {
  return {
    id: 1,
    slug,
    title: slug,
    tools: ["C++"],
    blurb: "from supabase",
    imageUrl: "https://example.com/cover.png",
    longDescription: "long",
    codeSnippets: [{ code: "int main() {}", language: "cpp" }],
    terminalSession: [],
    demoUrl: "https://example.com/demo",
    testUrl: null,
    repoUrl: null,
    section: "main",
    sortOrder: 1,
    ...extra,
  };
}

function repo(name: string, manifest: object | string, extra: Partial<RepoSnapshot> = {}): RepoSnapshot {
  return {
    name,
    fullName: `Xenzoro/${name}`,
    private: false,
    htmlUrl: `https://github.com/Xenzoro/${name}`,
    pushedAt: "2026-10-01T00:00:00Z",
    manifest: typeof manifest === "string" ? manifest : JSON.stringify(manifest),
    devlog: [],
    ...extra,
  };
}

const base = { show: true, slug: "word-finder", title: "Word Finder", summary: "Finds words", tags: ["TypeScript"] };

function entry(manifest: object, extra: Partial<RepoSnapshot> = {}): ManifestEntry {
  const snapshot = repo(extra.name ?? "repo", manifest, extra);
  return { repo: snapshot, manifest: parseManifest(snapshot.manifest, snapshot.name)! };
}

describe("parseManifest", () => {
  it("returns null when show is missing or false", () => {
    assert.equal(parseManifest(JSON.stringify({ ...base, show: false }), "r"), null);
    const { show: _show, ...noShow } = base;
    void _show;
    assert.equal(parseManifest(JSON.stringify(noShow), "r"), null);
  });

  it("defaults section to main and test to null", () => {
    const manifest = parseManifest(JSON.stringify(base), "r")!;
    assert.equal(manifest.section, "main");
    assert.equal(manifest.test, null);
    assert.equal("live" in manifest, false);
  });

  it("fails clearly on broken JSON, even with show off", () => {
    assert.throws(() => parseManifest("{ show: true", "charityWater"), /portfolio.json in charityWater: is not valid JSON/);
  });

  it("fails on wrong types and bad values", () => {
    assert.throws(() => parseManifest(JSON.stringify({ ...base, show: "yes" }), "r"), /"show" must be true or false/);
    assert.throws(() => parseManifest(JSON.stringify({ ...base, slug: "Word Finder" }), "r"), /"slug" must be lowercase/);
    assert.throws(() => parseManifest(JSON.stringify({ ...base, tags: "ts" }), "r"), /"tags" must be a list/);
    assert.throws(() => parseManifest(JSON.stringify({ ...base, title: " " }), "r"), /"title" must be a non empty string/);
    assert.throws(() => parseManifest(JSON.stringify({ ...base, section: "side" }), "r"), /"section" must be "main" or "fun"/);
    assert.throws(() => parseManifest(JSON.stringify({ ...base, live: "example.com" }), "r"), /"live" must be a full http/);
    assert.throws(() => parseManifest(JSON.stringify({ ...base, code_snippets: [{ label: "x" }] }), "r"), /"code_snippets"/);
    assert.throws(() => parseManifest(JSON.stringify([]), "r"), /must be a JSON object/);
  });

  it("warns about unknown fields instead of failing", () => {
    const warnings: string[] = [];
    parseManifest(JSON.stringify({ ...base, colour: "blue" }), "r", warnings);
    assert.deepEqual(warnings, ['portfolio.json in r: unknown field "colour" was ignored']);
  });
});

describe("mergeProjects", () => {
  it("adds a manifest with a new slug as a new project", () => {
    const merged = mergeProjects([row("blackjack")], [entry({ ...base, live: "https://x.dev", section: "fun" })]);
    assert.deepEqual(merged.map((p) => p.slug), ["blackjack", "word-finder"]);
    const added = merged[1];
    assert.equal(added.id, null);
    assert.equal(added.blurb, "Finds words");
    assert.equal(added.demoUrl, "https://x.dev");
    assert.equal(added.section, "fun");
    assert.equal(added.repoUrl, "https://github.com/Xenzoro/repo");
  });

  it("overrides matching rows and keeps fields the manifest leaves out", () => {
    const [merged] = mergeProjects([row("word-finder")], [entry(base)]);
    assert.equal(merged.id, 1);
    assert.equal(merged.title, "Word Finder");
    assert.equal(merged.blurb, "Finds words");
    assert.deepEqual(merged.tools, ["TypeScript"]);
    assert.equal(merged.longDescription, "long");
    assert.equal(merged.demoUrl, "https://example.com/demo");
    assert.equal(merged.imageUrl, "https://example.com/cover.png");
    assert.equal(merged.codeSnippets.length, 1);
  });

  it("lets live: null remove a demo link", () => {
    const [merged] = mergeProjects([row("word-finder")], [entry({ ...base, live: null })]);
    assert.equal(merged.demoUrl, null);
  });

  it("never links private repos", () => {
    const [merged] = mergeProjects([], [entry(base, { private: true })]);
    assert.equal(merged.repoUrl, null);
  });

  it("fails on duplicate slugs between manifests or between rows", () => {
    assert.throws(
      () => mergeProjects([], [entry(base, { name: "one" }), entry(base, { name: "two" })]),
      /one and two both use the slug "word-finder"/,
    );
    assert.throws(() => mergeProjects([row("a", { title: "A" }), row("a", { title: "B" })], []), /"A" and "B" both have the slug "a"/);
  });

  it("orders by sort order, then new projects by latest push", () => {
    const merged = mergeProjects(
      [row("first", { sortOrder: 1 }), row("second", { sortOrder: 2 })],
      [
        entry({ ...base, slug: "old" }, { name: "old", pushedAt: "2026-01-01T00:00:00Z" }),
        entry({ ...base, slug: "new" }, { name: "new", pushedAt: "2026-09-01T00:00:00Z" }),
        entry({ ...base, slug: "pinned", sort_order: 1.5 }, { name: "pinned" }),
      ],
    );
    assert.deepEqual(merged.map((p) => p.slug), ["first", "pinned", "second", "new", "old"]);
  });
});

describe("collectManifests", () => {
  it("skips hidden repos and keeps shown ones", () => {
    const entries = collectManifests([repo("hidden", { ...base, show: false }), repo("shown", base)]);
    assert.deepEqual(entries.map((e) => e.repo.name), ["shown"]);
  });
});
