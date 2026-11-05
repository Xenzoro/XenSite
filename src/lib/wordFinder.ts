// Word finder solver: which dictionary words can be spelled from a handful of letters, like a Wordscapes wheel.
// Pure functions, so the page and the unit tests share exactly the same logic.

export const MAX_LETTERS = 7;
export const MIN_WORD_LENGTH = 3;
/** Marks an unknown letter in a pattern, as in "_a_e" */
export const BLANK = "_";

export interface WordGroup {
  length: number;
  words: string[];
}

/** Lowercase a to z only, at most MAX_LETTERS */
export function normalizeLetters(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .slice(0, MAX_LETTERS);
}

/** Lowercase letters and blanks only, at most MAX_LETTERS. "?", "." and "*" also count as blanks. */
export function normalizePattern(input: string): string {
  return input
    .toLowerCase()
    .replace(/[?.*]/g, BLANK)
    .replace(/[^a-z_]/g, "")
    .slice(0, MAX_LETTERS);
}

/** How many of each letter a to z the string has */
export function letterCounts(letters: string): number[] {
  const counts = new Array<number>(26).fill(0);
  for (const char of letters) {
    const index = char.charCodeAt(0) - 97;
    if (index >= 0 && index < 26) counts[index]++;
  }
  return counts;
}

/** True when the word uses each letter no more often than `counts` allows */
export function canMake(word: string, counts: readonly number[]): boolean {
  const left = counts.slice();
  for (const char of word) {
    const index = char.charCodeAt(0) - 97;
    if (index < 0 || index >= 26 || left[index] === 0) return false;
    left[index]--;
  }
  return true;
}

/** True when the word has the pattern's length and its letter wherever the pattern isn't blank */
export function matchesPattern(word: string, pattern: string): boolean {
  if (word.length !== pattern.length) return false;
  for (let i = 0; i < pattern.length; i++) {
    if (pattern[i] !== BLANK && pattern[i] !== word[i]) return false;
  }
  return true;
}

/**
 * Every word of MIN_WORD_LENGTH or more letters that can be made from `letters`,
 * filtered by `pattern` when one is given. Grouped by length, longest first, alphabetical within.
 */
export function findWords(dictionary: readonly string[], letters: string, pattern = ""): WordGroup[] {
  const wheel = normalizeLetters(letters);
  const shape = normalizePattern(pattern);
  if (wheel.length < MIN_WORD_LENGTH) return [];
  if (shape && (shape.length < MIN_WORD_LENGTH || shape.length > wheel.length)) return [];

  const counts = letterCounts(wheel);
  const byLength = new Map<number, Set<string>>();
  for (const word of dictionary) {
    if (word.length < MIN_WORD_LENGTH || word.length > wheel.length) continue;
    if (shape && !matchesPattern(word, shape)) continue;
    if (!canMake(word, counts)) continue;
    let group = byLength.get(word.length);
    if (!group) byLength.set(word.length, (group = new Set()));
    group.add(word);
  }

  return [...byLength.entries()]
    .sort(([a], [b]) => b - a)
    .map(([length, words]) => ({ length, words: [...words].sort() }));
}

/** Total number of words across groups */
export function countWords(groups: readonly WordGroup[]): number {
  return groups.reduce((total, group) => total + group.words.length, 0);
}
