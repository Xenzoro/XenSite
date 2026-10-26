// Syntax highlighting at build time with refractor (Prism in Node). Only the resulting HTML reaches the browser.
import { toHtml } from "hast-util-to-html";
import { refractor } from "refractor/core";
import bash from "refractor/bash";
import c from "refractor/c";
import clike from "refractor/clike";
import cpp from "refractor/cpp";
import css from "refractor/css";
import java from "refractor/java";
import javascript from "refractor/javascript";
import markup from "refractor/markup";
import nasm from "refractor/nasm";
import python from "refractor/python";
import sql from "refractor/sql";

for (const language of [clike, markup, css, c, cpp, java, javascript, python, bash, sql, nasm]) {
  refractor.register(language);
}

// Names the data may use for the same language
const ALIASES: Record<string, string> = {
  asm: "nasm",
  "c++": "cpp",
  html: "markup",
  js: "javascript",
  py: "python",
  sh: "bash",
  shell: "bash",
};

export function resolveLanguage(language: string | undefined): string {
  const name = (language || "clike").toLowerCase();
  const resolved = ALIASES[name] ?? name;
  return refractor.registered(resolved) ? resolved : "clike";
}

/** Highlighted HTML for a code excerpt. refractor escapes the source text. */
export function highlight(code: string, language: string | undefined): string {
  return toHtml(refractor.highlight(code ?? "", resolveLanguage(language)));
}
