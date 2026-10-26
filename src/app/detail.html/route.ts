// Old links looked like detail.html?id=N. This builds a tiny static page that maps each id to its new /projects/<slug>/ URL.
import { BASE_PATH } from "@/lib/site";
import { getProjects } from "@/lib/supabase";

export const dynamic = "force-static";

export async function GET() {
  const projects = await getProjects();
  const slugs = Object.fromEntries(projects.map((project) => [project.id, project.slug]));
  const projectsUrl = `${BASE_PATH}/projects/`;

  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>Redirecting | Jacob Martinez</title>
<link rel="canonical" href="${projectsUrl}">
<script>
var slugs = ${JSON.stringify(slugs).replace(/</g, "\\u003c")};
var id = new URLSearchParams(location.search).get("id");
var slug = Object.prototype.hasOwnProperty.call(slugs, id) ? slugs[id] : null;
location.replace(slug ? "${BASE_PATH}/projects/" + slug + "/" : "${projectsUrl}");
</script>
</head>
<body style="background:#1c1c1c;color:#fff;font-family:sans-serif">
<p>This page moved. <a href="${projectsUrl}" style="color:#4db3e6">See all projects</a>.</p>
</body>
</html>
`;

  return new Response(html, { headers: { "Content-Type": "text/html; charset=utf-8" } });
}
