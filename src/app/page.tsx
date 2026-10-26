import Image from "next/image";
import Link from "next/link";
import contactPhoto from "@/assets/selfie-contact.webp";
import heroPhoto from "@/assets/selfie-hero.webp";
import HomeMotion from "@/components/Home/HomeMotion";
import ProjectGrid, { type ProjectCard } from "@/components/Home/ProjectGrid";
import { media } from "@/lib/media";
import { RESUME_PATH, withBasePath } from "@/lib/site";
import { getProjects } from "@/lib/supabase";
import styles from "./page.module.css";

export default async function Home() {
  const projects = await getProjects();
  const cards: ProjectCard[] = projects.map((project) => ({
    slug: project.slug,
    title: project.title,
    tools: project.tools,
    blurb: project.blurb,
    cover: project.imageUrl ? media(project.imageUrl, "cover") : null,
  }));

  return (
    <>
      <HomeMotion />

      <section className={styles.intro} aria-labelledby="intro-name">
        <div className={`container ${styles.introRow}`}>
          <div className={styles.photoCol} data-intro="photo">
            <div className={styles.profileWrapper}>
              <Image
                src={heroPhoto}
                alt="Picture of Jacob Martinez"
                className={styles.profilePic}
                sizes="(min-width: 768px) 340px, 90vw"
                fetchPriority="high"
                loading="eager"
              />
            </div>
          </div>
          <div className={styles.introContent} data-intro="content">
            <div className={styles.introLabels}>
              <h1 id="intro-name" className={styles.nameTag}>
                Jacob Martinez
              </h1>
              <p className={styles.roleTag}>Aspiring Software Engineer</p>
            </div>
            <p className={styles.introText}>
              I love to create. I&apos;m currently studying Information Systems and Computer Science, with hands-on
              experience ranging from x86 assembly to full-stack web development.
            </p>
            <a href={withBasePath(RESUME_PATH)} target="_blank" rel="noopener" className={styles.resumeBtn}>
              <span aria-hidden="true">&#11015;</span> View Resume
              <span className="visually-hidden"> (PDF, opens in a new tab)</span>
            </a>
          </div>
        </div>
      </section>

      <section id="projects" className={styles.projects} aria-labelledby="projects-title">
        <div className="container">
          <h2 id="projects-title" className={styles.sectionTitle}>
            Featured <span className={styles.blueText}>Projects</span>
          </h2>
          <p className={styles.sectionSubtitle}>C++ &bull; Assembly &bull; Java &bull; Web Development</p>
          <ProjectGrid cards={cards} />
        </div>
      </section>

      <section className={styles.contactSection} aria-labelledby="contact-title">
        <div className="container">
          <div className={styles.contactCard}>
            <h2 id="contact-title" className={`${styles.sectionTitle} ${styles.contactTitle}`}>
              Contact <span className={styles.blueText}>Me</span>
            </h2>
            <div className={styles.contactRow}>
              <div className={styles.contactPicCol}>
                <Image src={contactPhoto} alt="Jacob Martinez" width={160} height={160} className={styles.contactPic} />
              </div>
              <div className={styles.contactInfo}>
                <p className={styles.tagline}>Have a project in mind? Let&apos;s talk.</p>
                <div className={styles.contactActions}>
                  <Link href="/contact/" className={styles.contactBtn}>
                    Get in Touch
                  </Link>
                  <span className={styles.contactStatus}>Open to internships and collaboration</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
