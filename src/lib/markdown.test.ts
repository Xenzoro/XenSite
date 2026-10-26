import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isSafeUrl, renderMarkdown } from "./markdown.ts";

describe("isSafeUrl", () => {
  it("allows web, mail and site links", () => {
    for (const url of ["https://example.com", "http://x.dev/a", "mailto:me@example.com", "/projects/", "#top", "notes.md", "./img.png"]) {
      assert.equal(isSafeUrl(url), true, url);
    }
  });

  it("blocks script and data URLs", () => {
    for (const url of ["javascript:alert(1)", " JavaScript:alert(1)", "data:text/html,hi", "vbscript:x", "//evil.example"]) {
      assert.equal(isSafeUrl(url), false, url);
    }
  });
});

describe("renderMarkdown", () => {
  it("drops raw HTML and unsafe URLs, keeps safe links", () => {
    const html = renderMarkdown("<script>alert(1)</script>\n\n[bad](javascript:alert(1)) [good](https://example.com) ![x](data:image/png;base64,AA)", "code");
    assert.ok(!html.includes("<script"));
    assert.ok(!html.includes("javascript:"));
    assert.ok(!html.includes("data:image"));
    assert.ok(html.includes('href="https://example.com" rel="noopener noreferrer"'));
  });

  it("moves headings down a level and highlights code", () => {
    const html = renderMarkdown("# Big\n\n## Small\n\n```ts\nconst x = 1;\n```", "code");
    assert.ok(html.includes("<h2>Big</h2>"));
    assert.ok(html.includes("<h3>Small</h3>"));
    assert.ok(!html.includes("<h1"));
    assert.ok(html.includes('<pre class="code" tabindex="0">'));
    assert.ok(html.includes('class="token keyword"'));
  });
});
