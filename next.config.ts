import type { NextConfig } from "next";
import { BASE_PATH } from "./src/lib/site";

const nextConfig: NextConfig = {
  // Static export, hosted on Vercel at the domain root (see src/lib/site.ts)
  output: "export",
  basePath: BASE_PATH,
  trailingSlash: true,
  images: { unoptimized: true },
  // About 6 KB of CSS gzipped: inlining it removes the render blocking stylesheet requests
  experimental: { inlineCss: true },
  // Keep AGENTS.md hand written; next dev would otherwise add its own block
  agentRules: false,
};

export default nextConfig;
