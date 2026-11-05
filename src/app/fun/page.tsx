import type { Metadata } from "next";
import FunGrid from "@/components/Fun/FunGrid";
import styles from "@/components/Fun/Fun.module.css";
import { BUILT_IN_FUN, type FunCard } from "@/lib/fun";
import { media } from "@/lib/media";
import { getProjects } from "@/lib/projects";

export const metadata: Metadata = {
  title: "Fun Projects",
  description: "Small side projects by Jacob Martinez, like a word finder for word game wheels that runs entirely in your browser.",
};

export default async function FunPage() {
  // Projects whose portfolio.json says "section": "fun" join the built in ones
  const posted: FunCard[] = (await getProjects("fun")).map((project) => ({
    href: `/projects/${project.slug}/`,
    title: project.title,
    summary: project.blurb,
    tags: project.tools,
    cover: project.imageUrl ? media(project.imageUrl, "cover") : null,
  }));

  return (
    <section className={styles.page} aria-labelledby="fun-title">
      <div className="container">
        <h1 id="fun-title" className={styles.sectionTitle}>
          Fun <span className={styles.blueText}>Projects</span>
        </h1>
        <p className={styles.sectionSubtitle}>Small things I built because they were fun</p>
        <FunGrid cards={[...BUILT_IN_FUN, ...posted]} />
      </div>
    </section>
  );
}
