import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { formatDate } from "@/lib/devlog";
import { getAllProjects, getDevlog, getDevlogs, getProject } from "@/lib/projects";
import styles from "./devlog.module.css";

export const dynamicParams = false;

export async function generateStaticParams() {
  const slugs = [...(await getDevlogs()).keys()];
  if (slugs.length) return slugs.map((slug) => ({ slug }));
  // A static export needs at least one page per route. With no devlogs anywhere yet, this one renders a 404.
  const [first] = await getAllProjects();
  return first ? [{ slug: first.slug }] : [];
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]/devlog">): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return {
    title: `${project.title} Devlog`,
    description: `Development notes for ${project.title} by Jacob Martinez, newest first.`,
  };
}

export default async function DevlogIndex({ params }: PageProps<"/projects/[slug]/devlog">) {
  const { slug } = await params;
  const project = await getProject(slug);
  const posts = await getDevlog(slug);
  if (!project || posts.length === 0) notFound();

  return (
    <section className={styles.page}>
      <div className="container">
        <Link href={`/projects/${slug}/`} className={styles.backLink}>
          &larr; Back to {project.title}
        </Link>
        <h1 className={styles.title}>
          {project.title} <span className={styles.blueText}>Devlog</span>
        </h1>
        <ul className={styles.list}>
          {posts.map((post) => (
            <li key={post.slug} className={styles.item}>
              <article>
                <h2 className={styles.itemTitle}>
                  <Link href={`/projects/${slug}/devlog/${post.slug}/`}>{post.title}</Link>
                </h2>
                <time dateTime={post.date} className={styles.date}>
                  {formatDate(post.date)}
                </time>
                {post.summary && <p className={styles.summary}>{post.summary}</p>}
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
