import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages, served from https://xenzoro.github.io/XenSite/
  output: "export",
  basePath: "/XenSite",
  trailingSlash: true,
  images: { unoptimized: true },
  // Keep AGENTS.md hand written; next dev would otherwise add its own block
  agentRules: false,
};

export default nextConfig;
