import type { Metadata } from "next";
import FunGrid from "@/components/Fun/FunGrid";
import styles from "@/components/Fun/Fun.module.css";
import { BUILT_IN_FUN } from "@/lib/fun";

export const metadata: Metadata = {
  title: "Fun Projects",
  description: "Small side projects by Jacob Martinez, like a word finder for word game wheels that runs entirely in your browser.",
};

export default function FunPage() {
  return (
    <section className={styles.page} aria-labelledby="fun-title">
      <div className="container">
        <h1 id="fun-title" className={styles.sectionTitle}>
          Fun <span className={styles.blueText}>Projects</span>
        </h1>
        <p className={styles.sectionSubtitle}>Small things I built because they were fun</p>
        <FunGrid cards={BUILT_IN_FUN} />
      </div>
    </section>
  );
}
