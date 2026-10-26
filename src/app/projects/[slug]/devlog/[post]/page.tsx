import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import projectStyles from "@/components/Project/Project.module.css";
import { formatDate } from "@/lib/devlog";
import { renderMarkdown } from "@/lib/markdown";
import { getAllProjects, getDevlog, getDevlogs, getProject } from "@/lib/projects";
import styles from "../devlog.module.css";

export const dynamicParams = false;

export async function generateStaticParams() {
  const params = [...(await getDevlogs())].flatMap(([slug, posts]) => posts.map((post) => ({ slug, post: post.slug })));
  if (params.length) return params;
  // A static export needs at least one page per route. With no devlogs anywhere yet, this one renders a 404.
  const [first] = await getAllProjects();
  return first ? [{ slug: first.slug, post: "none" }] : [];
}

async function load(params: PageProps<"/projects/[slug]/devlog/[post]">["params"]) {
  const { slug, post: postSlug } = await params;
  const project = await getProject(slug);
  const posts = await getDevlog(slug);
  const index = posts.findIndex((p) => p.slug === postSlug);
  return { project, posts, index, post: posts[index] };
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]/devlog/[post]">): Promise<Metadata> {
  const { project, post } = await load(params);
  if (!project || !post) return {};
  return {
    title: `${post.title} | ${project.title} Devlog`,
    description: post.summary || `${post.title}: a devlog post about ${project.title} by Jacob Martinez.`,
  };
}

export default async function DevlogPost({ params }: PageProps<"/projects/[slug]/devlog/[post]">) {
  const { project, posts, index, post } = await load(params);
  if (!project || !post) notFound();
  // Posts are newest first, so the one before in the list is newer
  const newer = posts[index - 1];
  const older = posts[index + 1];
  const base = `/projects/${project.slug}/devlog`;

  return (
    <section className={styles.page}>
      <div className="container">
        <Link href={`${base}/`} className={styles.backLink}>
          &larr; {project.title} Devlog
        </Link>
        <article>
          <h1 className={styles.title}>{post.title}</h1>
          <time dateTime={post.date} className={styles.date}>
            {formatDate(post.date)}
          </time>
          <div className={styles.prose} dangerouslySetInnerHTML={{ __html: renderMarkdown(post.markdown, projectStyles.code) }} />
        </article>
        {(newer || older) && (
          <nav className={styles.pager} aria-label="More posts">
            {older ? (
              <Link href={`${base}/${older.slug}/`} className={styles.pagerLink}>
                &larr; Older: {older.title}
              </Link>
            ) : (
              <span />
            )}
            {newer && (
              <Link href={`${base}/${newer.slug}/`} className={styles.pagerLink}>
                Newer: {newer.title} &rarr;
              </Link>
            )}
          </nav>
        )}
      </div>
    </section>
  );
}
