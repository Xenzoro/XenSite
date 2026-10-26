"use client";

import Image from "next/image";
import Link from "next/link";
import { useId, useMemo, useState } from "react";
import Tags from "@/components/Project/Tags";
import type { MediaImage } from "@/lib/media";
import styles from "./ProjectGrid.module.css";

export interface ProjectCard {
  slug: string;
  title: string;
  tools: string[];
  blurb: string;
  cover: MediaImage | null;
}

// Featured grid with the live tag search: tags come from the data, so the filter can't drift from the projects
export default function ProjectGrid({ cards }: { cards: ProjectCard[] }) {
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<string[]>([]);
  const [suggestionsOpen, setSuggestionsOpen] = useState(false);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const inputId = useId();
  const suggestionsId = useId();

  const allTags = useMemo(
    () => [...new Set(cards.flatMap((card) => card.tools))].sort((a, b) => a.localeCompare(b)),
    [cards],
  );

  const trimmed = query.trim().toLowerCase();
  const suggestions = trimmed
    ? allTags.filter((tag) => !activeTags.includes(tag) && tag.toLowerCase().includes(trimmed))
    : [];
  const showSuggestions = suggestionsOpen && suggestions.length > 0;

  const visibleCards = activeTags.length
    ? cards.filter((card) => card.tools.some((tag) => activeTags.includes(tag)))
    : cards;

  function addTag(tag: string) {
    setActiveTags((tags) => [...tags, tag]);
    setQuery("");
    document.getElementById(inputId)?.focus();
  }

  function toggleExpanded(slug: string) {
    setExpanded((current) => {
      const next = new Set(current);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  }

  return (
    <>
      <div className={styles.filter}>
        <div
          className={styles.searchWrapper}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setSuggestionsOpen(false);
          }}
        >
          <label htmlFor={inputId} className="visually-hidden">
            Filter projects by tag
          </label>
          <input
            id={inputId}
            type="text"
            className={styles.searchInput}
            placeholder="Search tags..."
            autoComplete="off"
            aria-controls={suggestionsId}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setSuggestionsOpen(true);
            }}
            onKeyDown={(event) => {
              if (event.key === "Escape") setSuggestionsOpen(false);
              if (event.key === "Enter" && suggestions.length) addTag(suggestions[0]);
            }}
          />
          <div id={suggestionsId} role="group" aria-label="Tag suggestions" className={`${styles.suggestions} ${showSuggestions ? styles.open : ""}`}>
            {showSuggestions &&
              suggestions.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  className={styles.suggestion}
                  // Keeps focus in the input so Safari's blur doesn't close the list before the click lands
                  onMouseDown={(event) => event.preventDefault()}
                  onClick={() => addTag(tag)}
                >
                  {tag}
                </button>
              ))}
          </div>
        </div>
        {activeTags.length > 0 && (
          <ul className={styles.chips} aria-label="Active tag filters">
            {activeTags.map((tag) => (
              <li key={tag} className={styles.chip}>
                {tag}
                <button
                  type="button"
                  className={styles.chipRemove}
                  aria-label={`Remove ${tag} filter`}
                  onClick={() => setActiveTags((tags) => tags.filter((t) => t !== tag))}
                >
                  &times;
                </button>
              </li>
            ))}
          </ul>
        )}
        <p className="visually-hidden" aria-live="polite">
          {activeTags.length ? `${visibleCards.length} projects shown` : ""}
        </p>
      </div>

      <div className={styles.grid}>
        {visibleCards.map((card, index) => {
          const isExpanded = expanded.has(card.slug);
          const descId = `desc-${card.slug}`;
          return (
            <article key={card.slug} className={`${styles.card} ${index === 0 ? styles.featured : ""}`}>
              <div className={styles.cardImg}>
                {card.cover && (
                  <Image
                    src={card.cover.src}
                    width={card.cover.width}
                    height={card.cover.height}
                    alt={`Cover art for ${card.title}`}
                    sizes="(min-width: 768px) 66vw, 100vw"
                  />
                )}
              </div>
              <div className={styles.cardBody}>
                <Tags tags={card.tools} className={styles.cardTags} />
                <h3 className={styles.cardTitle}>
                  <Link href={`/projects/${card.slug}/`} className={styles.cardLink}>
                    {card.title}
                  </Link>
                </h3>
                <p id={descId} className={`${styles.cardDesc} ${isExpanded ? styles.expanded : ""}`}>
                  {card.blurb}
                </p>
                <button
                  type="button"
                  className={`${styles.readMore} ${isExpanded ? styles.readMoreExpanded : ""}`}
                  aria-expanded={isExpanded}
                  aria-controls={descId}
                  onClick={() => toggleExpanded(card.slug)}
                >
                  {isExpanded ? "Read Less" : "Read More"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </>
  );
}
