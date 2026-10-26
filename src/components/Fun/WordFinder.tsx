"use client";

import { useEffect, useId, useMemo, useState } from "react";
import {
  BLANK,
  MAX_LETTERS,
  MIN_WORD_LENGTH,
  countWords,
  findWords,
  normalizeLetters,
  normalizePattern,
} from "@/lib/wordFinder";
import styles from "./WordFinder.module.css";

type ListState = { status: "loading" } | { status: "ready"; words: string[] } | { status: "error" };

function plural(count: number, word: string): string {
  return `${count} ${word}${count === 1 ? "" : "s"}`;
}

// Everything runs here in the browser: the word list is a chunk of this page, and nothing is sent or stored
export default function WordFinder() {
  const [letters, setLetters] = useState("");
  const [pattern, setPattern] = useState("");
  const [list, setList] = useState<ListState>({ status: "loading" });
  const lettersId = useId();
  const patternId = useId();
  const lettersHintId = useId();
  const patternHintId = useId();

  useEffect(() => {
    let cancelled = false;
    import("@/lib/generated/words")
      .then(({ default: words }) => {
        if (!cancelled) setList({ status: "ready", words: words.split("\n") });
      })
      .catch(() => {
        if (!cancelled) setList({ status: "error" });
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const groups = useMemo(
    () => (list.status === "ready" ? findWords(list.words, letters, pattern) : []),
    [list, letters, pattern],
  );
  const total = countWords(groups);
  // What screen readers hear: the same text, but only once typing pauses, so a count isn't read out per keystroke
  const [announced, setAnnounced] = useState("");

  let status: string;
  if (list.status === "loading") status = "Loading the word list…";
  else if (list.status === "error") status = "The word list didn't load. Refresh the page to try again.";
  else if (letters.length < MIN_WORD_LENGTH) status = `Type at least ${MIN_WORD_LENGTH} letters to see words.`;
  else if (pattern && pattern.length > letters.length) status = "The pattern is longer than your letters, so no word fits.";
  else if (pattern && pattern.length < MIN_WORD_LENGTH) status = `Patterns need at least ${MIN_WORD_LENGTH} places.`;
  else status = `${plural(total, "word")} from ${letters.toUpperCase()}${pattern ? ` matching ${pattern.toUpperCase()}` : ""}.`;

  useEffect(() => {
    const timer = setTimeout(() => setAnnounced(status), 400);
    return () => clearTimeout(timer);
  }, [status]);

  return (
    <div className={styles.finder}>
      <form className={styles.inputs} onSubmit={(event) => event.preventDefault()} role="search" aria-label="Word finder">
        <div className={styles.field}>
          <label htmlFor={lettersId} className={styles.label}>
            Letters
          </label>
          <input
            id={lettersId}
            className={`${styles.input} ${styles.lettersInput}`}
            type="text"
            inputMode="text"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="e.g. TEARS"
            aria-describedby={lettersHintId}
            value={letters}
            onChange={(event) => setLetters(normalizeLetters(event.target.value))}
          />
          <p id={lettersHintId} className={styles.hint}>
            Up to {MAX_LETTERS} letters. Type a letter twice to use it twice.
          </p>
        </div>
        <div className={styles.field}>
          <label htmlFor={patternId} className={styles.label}>
            Pattern <span className={styles.optional}>(optional)</span>
          </label>
          <input
            id={patternId}
            className={`${styles.input} ${styles.patternInput}`}
            type="text"
            autoComplete="off"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            placeholder="e.g. _A_E"
            aria-describedby={patternHintId}
            value={pattern}
            onChange={(event) => setPattern(normalizePattern(event.target.value))}
          />
          <p id={patternHintId} className={styles.hint}>
            Use {BLANK} for each unknown letter, like {BLANK}a{BLANK}e for a four letter word with A second and E last.
          </p>
        </div>
        <div className={styles.field}>
          {/* Same height as a label, so the button lines up with the inputs */}
          <span className={`${styles.label} ${styles.labelSpacer}`} aria-hidden="true">
            &nbsp;
          </span>
          <button
          type="button"
          className={styles.clear}
          disabled={!letters && !pattern}
          onClick={() => {
            setLetters("");
            setPattern("");
            document.getElementById(lettersId)?.focus();
          }}
        >
          Clear
        </button>
        </div>
      </form>

      <div className={styles.tiles} aria-hidden="true">
        {Array.from({ length: MAX_LETTERS }, (_, i) => (
          <span key={i} className={`${styles.tile} ${letters[i] ? styles.tileFilled : ""}`}>
            {letters[i]?.toUpperCase() ?? ""}
          </span>
        ))}
      </div>

      <p className={styles.status} aria-hidden="true">
        {status}
      </p>
      <p className="visually-hidden" role="status">
        {announced}
      </p>

      <div className={styles.results}>
        {groups.map((group) => (
          <section key={group.length} className={styles.group} aria-labelledby={`len-${group.length}`}>
            <h2 id={`len-${group.length}`} className={styles.groupTitle}>
              {group.length} letters <span className={styles.count}>({group.words.length})</span>
            </h2>
            <ul className={styles.words}>
              {group.words.map((word) => (
                <li key={word} className={styles.word}>
                  {word}
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>
    </div>
  );
}
