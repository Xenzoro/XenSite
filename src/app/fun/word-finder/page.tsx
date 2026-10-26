import type { Metadata } from "next";
import Link from "next/link";
import WordFinder from "@/components/Fun/WordFinder";
import styles from "./word-finder.module.css";

export const metadata: Metadata = {
  title: "Word Finder",
  description:
    "Type the letters from a word game wheel and see every English word of three or more letters you can make, grouped by length, with an optional pattern filter.",
};

export default function WordFinderPage() {
  return (
    <section className={styles.page} aria-labelledby="word-finder-title">
      <div className="container">
        <Link href="/fun/" className={styles.backLink}>
          &larr; Back to Fun Projects
        </Link>
        <h1 id="word-finder-title" className={styles.title}>
          Word <span className={styles.blueText}>Finder</span>
        </h1>
        <p className={styles.intro}>
          Stuck on a word wheel? Type its letters and every word you can make shows up below, longest first. Each letter
          counts as many times as you type it. Everything runs in your browser; nothing you type leaves the page.
        </p>
        <WordFinder />
        <p className={styles.credit}>
          Word list from <a href="http://wordlist.aspell.net/">SCOWL</a>, copyright 2000 to 2016 Kevin Atkinson and others,
          used under its <a href="/licenses/scowl.txt">copyright and permission notice</a>.
        </p>
      </div>
    </section>
  );
}
