// Markdown to HTML at build time for devlog posts. Raw HTML in the markdown is dropped (remark-rehype's default),
// and fenced code blocks get the same build time highlighting as the project code excerpts.
import type { Element, Root, Text } from "hast";
import rehypeStringify from "rehype-stringify";
import remarkGfm from "remark-gfm";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import { unified } from "unified";
import { highlightTree } from "./highlight.ts";

function textOf(node: Element): string {
  return node.children.map((child) => (child.type === "text" ? (child as Text).value : child.type === "element" ? textOf(child) : "")).join("");
}

// Links and images may only point to the web, mail, or this site; anything else (javascript:, data:) is removed
export function isSafeUrl(url: string): boolean {
  const value = url.trim();
  if (/^(https?:|mailto:)/i.test(value)) return true;
  // No scheme at all: a path, a fragment or a relative link
  return !/^[a-z][a-z0-9+.-]*:/i.test(value) && !value.startsWith("//");
}

/**
 * Post clean up on the HTML tree:
 * - headings move down a level (the page title is the only h1, so "# " in a post becomes h2)
 * - fenced code blocks get build time highlighting and the shared code style class
 * - unsafe link and image URLs are dropped; external links get rel="noopener noreferrer"
 */
function rehypePost(preClassName: string) {
  return (tree: Root) => {
    const visit = (node: Root | Element) => {
      for (const child of node.children) {
        if (child.type !== "element") continue;
        const heading = child.tagName.match(/^h([1-6])$/);
        if (heading) child.tagName = `h${Math.min(Number(heading[1]) + 1, 6)}`;
        if (child.tagName === "pre") {
          child.properties = { ...child.properties, className: [preClassName], tabIndex: 0 };
          const code = child.children.find((c): c is Element => c.type === "element" && c.tagName === "code");
          if (code) {
            const classes = (code.properties?.className as string[] | undefined) ?? [];
            const language = classes.find((c) => c.startsWith("language-"))?.slice("language-".length);
            if (language) code.children = highlightTree(textOf(code).replace(/\n$/, ""), language).children as Element["children"];
          }
          continue;
        }
        for (const key of ["href", "src"] as const) {
          const value = child.properties?.[key];
          if (typeof value === "string" && !isSafeUrl(value)) delete child.properties[key];
        }
        if (child.tagName === "a" && typeof child.properties?.href === "string" && /^https?:/i.test(child.properties.href)) {
          child.properties.rel = ["noopener", "noreferrer"];
        }
        visit(child);
      }
    };
    visit(tree);
  };
}

export function renderMarkdown(markdown: string, preClassName: string): string {
  return String(
    unified()
      .use(remarkParse)
      .use(remarkGfm)
      .use(remarkRehype)
      .use(() => rehypePost(preClassName))
      .use(rehypeStringify)
      .processSync(markdown),
  );
}
