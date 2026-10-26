"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { TerminalStep } from "@/lib/types";
import styles from "./Project.module.css";

// US ASCII Map's boundary and city render is genuinely wide ASCII art, so it is flagged by name
const WIDE_OUTPUT_INPUTS = ["./a.out boundary.csv city.csv"];

type Line = { kind: "cmd" | "output" | "error" | "notice"; text: string };

const LINE_CLASS: Record<Line["kind"], string> = {
  cmd: styles.lineCmd,
  output: styles.lineOutput,
  error: styles.lineError,
  notice: styles.lineNotice,
};

// Replays captured output: typing (or picking) a recorded command prints what the real run printed
export default function Terminal({ session }: { session: TerminalStep[] }) {
  const [lines, setLines] = useState<Line[]>([]);
  const [value, setValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const inputId = useId();

  useEffect(() => {
    const body = bodyRef.current;
    if (body) body.scrollTop = body.scrollHeight;
  }, [lines]);

  function run(command: string) {
    const trimmed = command.trim();
    if (!trimmed) return;
    const match = session.find((step) => step.input === trimmed);
    const next: Line[] = [
      { kind: "cmd", text: `$ ${trimmed}` },
      match ? { kind: "output", text: match.output } : { kind: "error", text: `command not found: ${trimmed}` },
    ];
    if (match && WIDE_OUTPUT_INPUTS.includes(match.input)) {
      next.push({ kind: "notice", text: "This output is wide, view fullscreen or on a larger screen for correct formatting." });
    }
    setLines((current) => [...current, ...next]);
    setValue("");
  }

  return (
    <div className={styles.terminal}>
      <div className={styles.terminalHeader} aria-hidden="true">
        <span className={`${styles.dot} ${styles.red}`} />
        <span className={`${styles.dot} ${styles.yellow}`} />
        <span className={`${styles.dot} ${styles.green}`} />
        <span className={styles.terminalTitle}>session</span>
      </div>
      <div ref={bodyRef} className={styles.terminalBody} role="log" aria-label="Terminal output" tabIndex={0}>
        {lines.map((line, i) =>
          line.kind === "notice" ? (
            <div key={i} className={LINE_CLASS.notice}>
              <span className={styles.infoIcon} aria-hidden="true">
                &#9432;
              </span>{" "}
              {line.text}
            </div>
          ) : (
            <div key={i} className={LINE_CLASS[line.kind]}>
              {line.text}
            </div>
          ),
        )}
      </div>
      <div className={styles.inputLine}>
        <span className={styles.prompt} aria-hidden="true">
          $
        </span>
        <label htmlFor={inputId} className="visually-hidden">
          Terminal command
        </label>
        <input
          ref={inputRef}
          id={inputId}
          type="text"
          className={styles.terminalInput}
          autoComplete="off"
          spellCheck={false}
          placeholder="Type a command and press Enter..."
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") run(value);
          }}
        />
      </div>
      <div className={styles.hints}>
        {session.map((step) => (
          <button
            key={step.input}
            type="button"
            className={styles.hintChip}
            aria-label={`Fill in command: ${step.input}`}
            onClick={() => {
              setValue(step.input);
              inputRef.current?.focus();
            }}
          >
            {step.input}
          </button>
        ))}
      </div>
    </div>
  );
}
