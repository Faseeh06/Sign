import { signDictionary, aslAlphabet, SignAction } from "./signDictionary";

// A very basic stemmer for common words.
function stem(word: string): string {
  if (word.endsWith("ing")) return word.slice(0, -3);
  if (word.endsWith("ed")) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 2) return word.slice(0, -1);
  return word;
}

export function normalizeWord(word: string): string {
  return word.toLowerCase().replace(/[^\w\s]|_/g, "");
}

// True if the original word was capitalized and isn't the start of a sentence?
// For our simple context, if word starts with a capital letter, it *might* be a proper noun.
// But Speech2Text might capitalize the first word of a sentence. We'll use a heuristic.
export function isProperNoun(originalWord: string): boolean {
  if (originalWord.length === 0) return false;
  return originalWord[0] === originalWord[0].toUpperCase();
}

export function getSignStrategy(word: string, isFirstWord: boolean): SignAction {
  const originalWord = word;
  const clean = normalizeWord(word);

  if (!clean) {
    return { type: "none", word: originalWord };
  }

  // 1. Check for proper nouns (if it's capitalized and not the first word of the sentence).
  if (isProperNoun(originalWord) && !isFirstWord) {
    return {
      type: "fingerspell",
      letters: clean.split("").filter((char) => aslAlphabet[char]),
      word: originalWord,
    };
  }

  // 2. Direct dictionary match
  if (signDictionary[clean]) {
    return { type: "sign", gif: signDictionary[clean], word: originalWord };
  }

  // 3. Stemmed dictionary match
  const stemmed = stem(clean);
  if (signDictionary[stemmed]) {
    return { type: "sign", gif: signDictionary[stemmed], word: originalWord };
  }

  // 4. Default to fingerspelling
  return {
    type: "fingerspell",
    letters: clean.split("").filter((char) => aslAlphabet[char]),
    word: originalWord,
  };
}
