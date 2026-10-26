import type { Metadata } from "next";
import Link from "next/link";
import styles from "./not-found.module.css";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "This page doesn't exist. Head back to Jacob Martinez's portfolio home page or the full project list.",
};

export default function NotFound() {
  return (
    <section className={styles.page}>
      <p className={styles.code}>404</p>
      <h1 className={styles.title}>
        Page <span className={styles.blueText}>Not Found</span>
      </h1>
      <p className={styles.text}>The page you were looking for doesn&apos;t exist or has moved.</p>
      <div className={styles.actions}>
        <Link href="/" className={styles.button}>
          Back Home
        </Link>
        <Link href="/projects/" className={styles.outline}>
          All Projects
        </Link>
      </div>
    </section>
  );
}
