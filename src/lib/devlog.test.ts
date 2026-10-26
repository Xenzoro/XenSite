import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { formatDate, parsePost, parsePosts } from "./devlog.ts";

describe("parsePost", () => {
  it("reads front matter", () => {
    const post = parsePost("r", "port.md", "---\ntitle: \"Porting\"\ndate: 2026-10-25\nsummary: Moved to Next.js\n---\n\nBody text");
    assert.deepEqual(post, { slug: "port", title: "Porting", date: "2026-10-25", summary: "Moved to Next.js", markdown: "Body text" });
  });

  it("falls back to the file name date and the first heading", () => {
    const post = parsePost("r", "2026-10-20-first-steps.md", "# First Steps\n\nHello");
    assert.equal(post.slug, "first-steps");
    assert.equal(post.date, "2026-10-20");
    assert.equal(post.title, "First Steps");
    assert.equal(post.markdown, "Hello");
  });

  it("fails clearly without a usable date", () => {
    assert.throws(() => parsePost("XenSite", "notes.md", "# Notes"), /devlog\/notes.md in XenSite: add a "date/);
    assert.throws(() => parsePost("r", "x.md", "---\ndate: 2026-02-30\n---\nx"), /not a real date/);
  });
});

describe("parsePosts", () => {
  it("sorts newest first", () => {
    const posts = parsePosts("r", [
      { file: "2026-01-01-a.md", content: "# A" },
      { file: "2026-03-01-c.md", content: "# C" },
      { file: "2026-02-01-b.md", content: "# B" },
    ]);
    assert.deepEqual(posts.map((p) => p.slug), ["c", "b", "a"]);
  });

  it("fails when two posts get the same URL", () => {
    assert.throws(
      () => parsePosts("r", [{ file: "2026-01-01-hello.md", content: "x" }, { file: "2026-02-01-hello.md", content: "y" }]),
      /two posts both become "hello"/,
    );
  });
});

describe("formatDate", () => {
  it("formats without shifting the day", () => {
    assert.equal(formatDate("2026-10-25"), "October 25, 2026");
  });
});

describe("title fallback", () => {
  it("ignores a # comment inside a code block", () => {
    const post = parsePost("r", "2026-10-01-shell-notes.md", "Intro text\n\n```bash\n# install\nnpm i\n```");
    assert.equal(post.title, "shell notes");
    assert.ok(post.markdown.startsWith("Intro text"));
  });
});
