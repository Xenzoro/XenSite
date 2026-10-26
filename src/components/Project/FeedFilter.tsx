"use client";

import { useId, useRef, useState } from "react";
import styles from "./Feed.module.css";

// Search box for the full feed. The sections are rendered on the server; this only hides the ones that don't match.
export default function FeedFilter({ children }: { children: React.ReactNode }) {
  const [query, setQuery] = useState("");
  const [visible, setVisible] = useState<number | null>(null);
  const feedRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  function filter(value: string) {
    setQuery(value);
    const sections = feedRef.current?.querySelectorAll<HTMLElement>("[data-search]") ?? [];
    const needle = value.trim().toLowerCase();
    let count = 0;
    sections.forEach((section) => {
      const matches = !needle || (section.dataset.search ?? "").includes(needle);
      section.hidden = !matches;
      if (matches) count++;
    });
    setVisible(needle ? count : null);
  }

  return (
    <>
      <div className="container">
        <div className={styles.searchWrapper}>
          <label htmlFor={inputId} className="visually-hidden">
            Search projects
          </label>
          <input
            id={inputId}
            type="search"
            className={styles.searchInput}
            placeholder="Search projects..."
            autoComplete="off"
            value={query}
            onChange={(event) => filter(event.target.value)}
          />
        </div>
        <p className="visually-hidden" aria-live="polite">
          {visible === null ? "" : `${visible} projects match`}
        </p>
      </div>
      <div ref={feedRef} className={styles.feed}>
        {children}
        {visible === 0 && <p className={styles.empty}>No projects match your search.</p>}
      </div>
    </>
  );
}
