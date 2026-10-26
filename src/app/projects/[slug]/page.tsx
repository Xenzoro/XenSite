import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ProjectContent from "@/components/Project/ProjectContent";
import Tags from "@/components/Project/Tags";
import { getProject, getProjects } from "@/lib/supabase";
import styles from "./detail.module.css";

// Only the slugs built here exist; anything else is a 404
export const dynamicParams = false;

export async function generateStaticParams() {
  const projects = await getProjects();
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

  return (
    <section className={styles.detail}>
      <div className="container">
        <Link href="/#projects" className={styles.backLink}>
          &larr; Back to Projects
        </Link>
        <Tags tags={project.tools} />
        <h1 className={styles.title}>{project.title}</h1>
        <ProjectContent project={project} headingLevel="h2" snippetHeadingLevel="h3" />
      </div>
    </section>
  );
}
