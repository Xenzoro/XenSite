// Side projects that live inside this site. Projects from other repos join them through portfolio.json ("section": "fun").
import type { MediaImage } from "./media";

export interface FunCard {
  href: string;
  title: string;
  summary: string;
  tags: string[];
  cover: MediaImage | null;
  /** Letters drawn as tiles when there is no cover image */
  tiles?: string;
}

export const BUILT_IN_FUN: FunCard[] = [
  {
    href: "/fun/word-finder/",
    title: "Word Finder",
    summary:
      "Type up to seven letters from a word game wheel and get every English word of three or more letters you can make from them, grouped by length. Add a pattern like _a_e to narrow it down. Runs entirely in your browser.",
    tags: ["TypeScript", "React", "Algorithms"],
    cover: null,
    tiles: "WORDS",
  },
];
