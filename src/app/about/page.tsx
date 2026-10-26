import type { Metadata } from "next";
import Image from "next/image";
import Gallery, { type GalleryCard } from "@/components/About/Gallery";
import { media } from "@/lib/media";
import { getAbout } from "@/lib/supabase";
import styles from "./about.module.css";

export const metadata: Metadata = {
  title: "About Me",
  description:
    "About Jacob Martinez: Information Systems and Computer Science at UNLV, leadership, hardware mods, custom keyboards and PC builds.",
};

// Shown when the about-me table has no gallery yet, so the section still reads correctly
const FALLBACK_GALLERY: GalleryCard[] = [
  { images: [], caption: "My desk, RTX 5090 build and all" },
  { images: [], caption: "GMMK Pro build, lubed Baby Kangaroos" },
  { images: [], caption: "A TMR stick swap in progress" },
];

const SKILLS = ["Web Development", "C++", "Java", "x86 Assembly", "Excel"];

function Icon({ children }: { children: React.ReactNode }) {
  return (
    <div className={styles.cardIcon}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </div>
  );
}

export default async function AboutPage() {
  const about = await getAbout();
  const photo = about.profilePhotoUrl ? media(about.profilePhotoUrl, "profile") : null;
  const gallery: GalleryCard[] = about.gallery.length
    ? about.gallery.map((item) => ({
        caption: item.caption,
        images: item.images.map((url) => ({ thumb: media(url, "thumb"), full: media(url, "full") })),
      }))
    : FALLBACK_GALLERY;

  return (
    <>
      <section className={styles.hero}>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.photoWrapper}>
              {photo ? (
                <Image
                  src={photo.src}
                  width={photo.width}
                  height={photo.height}
                  alt="Jacob Martinez"
                  className={styles.photo}
                  fetchPriority="high"
                  loading="eager"
                />
              ) : (
                <div className={`${styles.photo} ${styles.photoPlaceholder}`}>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
                  </svg>
                </div>
              )}
            </div>
            <div className={styles.headerInfo}>
              <h1 className={styles.name}>Jacob Martinez</h1>
              <p className={styles.tagline}>Information Systems &amp; Computer Science &middot; UNLV</p>
              <p className={styles.intro}>
                Pursuing a degree in Information Systems with a minor in Computer Science. Currently looking for an
                internship in Software Engineering.
              </p>
            </div>
          </div>

          <ul className={styles.skillPills} aria-label="Skills">
            {SKILLS.map((skill) => (
              <li key={skill} className={styles.skillPill}>
                {skill}
              </li>
            ))}
            <li className={`${styles.skillPill} ${styles.skillPillLearning}`}>Python (Data Analysis) &middot; Learning</li>
          </ul>
        </div>
      </section>

      <section className={styles.columns}>
        <div className={`${styles.container} ${styles.columnsInner}`}>
          <div className={`${styles.col} ${styles.colLeft}`}>
            <div className={styles.card}>
              <Icon>
                <path d="M22 10 12 5 2 10l10 5 10-5Z" />
                <path d="M6 12v5c0 1.5 2.5 3 6 3s6-1.5 6-3v-5" />
              </Icon>
              <h2 className={styles.cardTitle}>Education</h2>
              <ul className={styles.cardList}>
                <li>C++ and x86 Assembly</li>
                <li>Java, Python, and SQL</li>
                <li>Web Development and Data Structures &amp; Algorithms (CS 302) next semester</li>
              </ul>
            </div>
            <div className={styles.card}>
              <Icon>
                <path d="M12 2l2.9 6.3 6.9.6-5.2 4.6 1.6 6.8L12 16.9l-6.2 3.4 1.6-6.8L2.2 8.9l6.9-.6L12 2Z" />
              </Icon>
              <h2 className={styles.cardTitle}>Leadership</h2>
              <ul className={styles.cardList}>
                <li>Led a 5-person team through my Java project</li>
                <li>Active member of UNLV&apos;s Bit 2 Byte club</li>
                <li>AFJROTC Flight Commander and Director of R&amp;R (high school)</li>
              </ul>
            </div>
          </div>

          <div className={`${styles.col} ${styles.colRight}`}>
            <div className={styles.card}>
              <Icon>
                <path d="M17 2 21 6l-4 4" />
                <path d="M3 12v-2a4 4 0 0 1 4-4h14" />
                <path d="M7 22 3 18l4-4" />
                <path d="M21 12v2a4 4 0 0 1-4 4H3" />
              </Icon>
              <h2 className={styles.cardTitle}>Hands-On Work</h2>
              <p className={styles.cardText}>
                I love the whole design cycle. From random concepts to the nitty-gritty, time-consuming code, whether
                that&apos;s low-level assembly or a high-level web app. I keep that same hands-on philosophy in hardware.
                I taught myself to solder PCBs on gaming controllers like Xbox and PS4/5s as a side gig. I replaced stock
                joysticks with TMR (Tunnel Magnetoresistance) joysticks; these new modules are stick drift-free! I also
                recalibrated them myself. When I&apos;m branching into a new topic or hobby, I use AI as a tutor to expand
                my knowledge of what I know and want to know. I recognize it can be used as a crutch, but my own
                discipline has kept me grounded; my ideas have come from my own head, and my own dreams push me towards a
                future I&apos;ll build myself.
              </p>
            </div>
            <div className={styles.card}>
              <Icon>
                <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.6Z" />
              </Icon>
              <h2 className={styles.cardTitle}>Beyond Code</h2>
              <p className={styles.cardText}>
                I work to support myself and my hobbies, most of which tend to be expensive. I love building computers,
                and I&apos;m engrossed in the tech space as a whole. In my free time, I love to watch tech influencers like
                MKBHD, LTT, Jay&apos;s Two Cents, and a bunch more. I create custom keyboards, my main one coming from a
                GMMK Pro 75% shell, with Baby Kangaroo switches lubed with Krytox g02. My main desktop currently is a
                5090 MSI Trio, 9800X3D, 64 GB DDR5 RAM, 7 TB of storage. I also work on console controllers, mainly
                PS5/4 and Xbox controllers, and swap out joysticks for TMR ones, which have no stick drift. I also run a
                sticker shop with my girlfriend where we sell her art as sticker sheets, MaeNJake on Etsy if you&apos;re
                wondering! Her art is also featured on this site if you look for it. When I do have free time, and
                I&apos;m not working on my projects, I love to spend time with friends in person or gaming, which, on a
                side note, I run my own Minecraft server with 70+ plugins and 40+ datapacks running on Paper. I&apos;ve
                been running it for years and learned a lot from it; I&apos;ve only had to reset from a backup a few
                times in recent years. Other than that, I&apos;m in school grinding away.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.gallery} aria-labelledby="gallery-heading">
        <div className={styles.container}>
          <h2 id="gallery-heading" className={styles.galleryHeading}>
            A Few Things I&apos;ve Built
          </h2>
          <Gallery cards={gallery} />
        </div>
      </section>
    </>
  );
}
