import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canMake,
  countWords,
  findWords,
  letterCounts,
  matchesPattern,
  normalizeLetters,
  normalizePattern,
} from "./wordFinder.ts";

const DICTIONARY = [
  "ate", "eat", "tea", "eta", "teat", "tat", "tee", "seat", "east", "eats", "sate", "teas",
  "beet", "bee", "beets", "best", "bets", "set", "sea", "at", "a", "toast", "stoat", "tote",
];

describe("normalizeLetters", () => {
  it("keeps lowercase a to z only and caps at 7", () => {
    assert.equal(normalizeLetters("T e-A!s9"), "teas");
    assert.equal(normalizeLetters("abcdefghij"), "abcdefg");
  });
});

describe("normalizePattern", () => {
  it("keeps letters and underscores, maps ? . * to underscores", () => {
    assert.equal(normalizePattern("_A_e"), "_a_e");
    assert.equal(normalizePattern("?a.e*"), "_a_e_");
    assert.equal(normalizePattern("t-e 1a"), "tea");
  });
});

describe("letter counts", () => {
  it("counts each letter", () => {
    const counts = letterCounts("teat");
    assert.equal(counts[19], 2); // t
    assert.equal(counts[4], 1); // e
    assert.equal(counts[0], 1); // a
    assert.equal(counts.reduce((a, b) => a + b, 0), 4);
  });

  it("only allows words within the counts", () => {
    assert.equal(canMake("tea", letterCounts("eat")), true);
    assert.equal(canMake("seat", letterCounts("eat")), false);
  });
});

describe("repeated letters", () => {
  it("uses a letter only as many times as it was typed", () => {
    assert.equal(canMake("teat", letterCounts("tea")), false);
    assert.equal(canMake("teat", letterCounts("teat")), true);
    assert.equal(canMake("tee", letterCounts("tea")), false);
  });

  it("finds words with repeats when the letters repeat", () => {
    const words = findWords(DICTIONARY, "teat").flatMap((g) => g.words);
    assert.ok(words.includes("teat"));
    assert.ok(words.includes("tat"));
    assert.ok(!words.includes("tee"));
  });
});

describe("findWords", () => {
  it("groups by length, longest first, alphabetical within", () => {
    const groups = findWords(DICTIONARY, "seat");
    assert.deepEqual(groups, [
      { length: 4, words: ["east", "eats", "sate", "seat", "teas"] },
      { length: 3, words: ["ate", "eat", "eta", "sea", "set", "tea"] },
    ]);
    assert.equal(countWords(groups), 11);
  });

  it("ignores words shorter than 3 letters", () => {
    const words = findWords(DICTIONARY, "seat").flatMap((g) => g.words);
    assert.ok(!words.includes("at"));
    assert.ok(!words.includes("a"));
  });

  it("is not fooled by case or symbols in the input", () => {
    assert.deepEqual(findWords(DICTIONARY, "S-E A T"), findWords(DICTIONARY, "seat"));
  });

  it("drops duplicate dictionary entries", () => {
    const groups = findWords([...DICTIONARY, "tea", "tea"], "tea");
    assert.deepEqual(groups, [{ length: 3, words: ["ate", "eat", "eta", "tea"] }]);
  });
});

describe("pattern filter", () => {
  it("matches length and fixed letters", () => {
    assert.equal(matchesPattern("sate", "_a_e"), true);
    assert.equal(matchesPattern("seat", "_a_e"), false);
    assert.equal(matchesPattern("sat", "_a_e"), false);
  });

  it("filters results to words that fit", () => {
    assert.deepEqual(findWords(DICTIONARY, "seat", "_a_e"), [{ length: 4, words: ["sate"] }]);
    assert.deepEqual(findWords(DICTIONARY, "seat", "___"), [
      { length: 3, words: ["ate", "eat", "eta", "sea", "set", "tea"] },
    ]);
  });

  it("finds nothing when the pattern is longer than the letters or too short", () => {
    assert.deepEqual(findWords(DICTIONARY, "tea", "____"), []);
    assert.deepEqual(findWords(DICTIONARY, "seat", "_a"), []);
  });

  it("treats an empty pattern as no filter", () => {
    assert.deepEqual(findWords(DICTIONARY, "seat", ""), findWords(DICTIONARY, "seat"));
  });
});

describe("empty input", () => {
  it("returns no groups for no letters", () => {
    assert.deepEqual(findWords(DICTIONARY, ""), []);
    assert.deepEqual(findWords(DICTIONARY, "   "), []);
  });

  it("returns no groups for fewer than 3 letters", () => {
    assert.deepEqual(findWords(DICTIONARY, "at"), []);
  });

  it("returns no groups for an empty dictionary", () => {
    assert.deepEqual(findWords([], "seat"), []);
  });
});
