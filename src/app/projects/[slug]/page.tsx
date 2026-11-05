import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectContent from "@/components/Project/ProjectContent";
import Tags from "@/components/Project/Tags";
import { getAllProjects, getDevlog, getProject } from "@/lib/projects";
import styles from "./detail.module.css";

// Only the slugs built here exist; anything else is a 404
export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getAllProjects();
  return projects.map((project) => ({ slug: project.slug }));
}

export async function generateMetadata({ params }: PageProps<"/projects/[slug]">): Promise<Metadata> {
  const project = await getProject((await params).slug);
  if (!project) return {};
  return {
    title: project.title,
    description: project.blurb || `${project.title}, a project by Jacob Martinez.`,
  };
}

export default async function ProjectPage({ params }: PageProps<"/projects/[slug]">) {
  const project = await getProject((await params).slug);
  if (!project) notFound();
  const posts = await getDevlog(project.slug);
  const fun = project.section === "fun";

  return (
    <section className={styles.detail}>
      <div className="container">
        <Link href={fun ? "/fun/" : "/#projects"} className={styles.backLink}>
          &larr; Back to {fun ? "Fun Projects" : "Projects"}
        </Link>
        <Tags tags={project.tools} />
        <h1 className={styles.title}>{project.title}</h1>
        {(project.repoUrl || project.testUrl || posts.length > 0) && (
          <ul className={styles.links} aria-label="More about this project">
            {posts.length > 0 && (
              <li>
                <Link href={`/projects/${project.slug}/devlog/`} className={styles.pill}>
                  Devlog ({posts.length} {posts.length === 1 ? "post" : "posts"})
                </Link>
              </li>
            )}
            {project.repoUrl && (
              <li>
                <a href={project.repoUrl} target="_blank" rel="noopener noreferrer" className={styles.pill}>
                  Code on GitHub<span className="visually-hidden"> (opens in a new tab)</span>
                </a>
              </li>
            )}
            {project.testUrl && (
              <li>
                <a href={project.testUrl} target="_blank" rel="noopener noreferrer" className={styles.pill}>
                  Test Build<span className="visually-hidden"> of {project.title} (opens in a new tab)</span>
                </a>
              </li>
            )}
          </ul>
        )}
        <ProjectContent project={project} headingLevel="h2" snippetHeadingLevel="h3" />
      </div>
    </section>
  );
}
