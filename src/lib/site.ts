// Served from https://xenzoro.github.io/XenSite/
export const BASE_PATH = "/XenSite";

export const SITE_NAME = "Jacob Martinez";
export const SITE_DESCRIPTION =
  "Coursework and personal projects by Jacob Martinez: C++, Assembly, Java and web, with real code excerpts and captured terminal output.";

export const RESUME_PATH = "/Jakes_Portf_09_21_26.pdf";

// Prefixes a path in public/ with the base path (next/image does not do this for string sources)
export function withBasePath(path: string): string {
  return `${BASE_PATH}${path}`;
}
