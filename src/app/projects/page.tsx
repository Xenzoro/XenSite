import type { Metadata } from "next";
import FeedFilter from "@/components/Project/FeedFilter";
import styles from "@/components/Project/Feed.module.css";
import ProjectContent from "@/components/Project/ProjectContent";
import Tags from "@/components/Project/Tags";
import { getProjects } from "@/lib/supabase";
import Link from "next/link";

export const metadata: Metadata = {
  title: "All Projects",
  description:
    "Every project by Jacob Martinez with full write ups, real code excerpts and replays of captured terminal output.",
};

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <section className={styles.page} aria-labelledby="projects-title">
      <div className="container">
        <h1 id="projects-title" className={styles.sectionTitle}>
          All <span className={styles.blueText}>Projects</span>
        </h1>
        <p className={styles.sectionSubtitle}>Full write-ups, code, and terminal replays</p>
      </div>
      <FeedFilter>
        {projects.map((project, index) => (
          <article
            key={project.slug}
            id={project.slug}
            className={styles.section}
            data-search={[project.title, project.tools.join(" "), project.blurb, project.longDescription]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()}
          >
            <div className="container">
              <div className={styles.header}>
                <span className={styles.index} aria-hidden="true">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h2 className={styles.title}>
                  <Link href={`/projects/${project.slug}/`} className={styles.titleLink}>
                    {project.title}
                  </Link>
                </h2>
              </div>
              <Tags tags={project.tools} />
              <ProjectContent project={project} headingLevel="h3" snippetHeadingLevel="h4" />
            </div>
          </article>
        ))}
      </FeedFilter>
    </section>
  );
}
