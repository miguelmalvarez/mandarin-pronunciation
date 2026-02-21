import type { AssessmentScore } from "../types";

/**
 * Tokenize a Chinese/mixed string into individual characters (hanzi) and
 * ASCII words, stripping punctuation and normalizing to lower-case.
 */
export function tokenize(text: string): string[] {
  // Split on whitespace, then flatten each chunk into individual characters
  // for CJK ranges so "你好" → ["你", "好"].
  return text
    .split(/\s+/)
    .flatMap((chunk) => {
      // If the chunk is purely ASCII, treat it as one token (e.g. pinyin)
      if (/^[\x00-\x7F]+$/.test(chunk)) {
        const word = chunk.replace(/[^\w]/g, "").toLowerCase();
        return word ? [word] : [];
      }
      // For CJK (and mixed), split into individual characters, drop punctuation
      return chunk.split("").filter((c) => /\p{L}/u.test(c));
    })
    .filter(Boolean);
}

/**
 * Compare a speech-recognition transcript against the expected reference text
 * and return an AssessmentScore (0–100) based on word/character overlap.
 *
 * @param transcript - What the speech recognizer heard (may be null/empty)
 * @param expectedText - The reference text the learner was supposed to say
 */
export function scoreTranscript(
  transcript: string | null,
  expectedText: string,
): AssessmentScore {
  const expected = tokenize(expectedText);
  const heard = transcript ? tokenize(transcript) : [];

  if (expected.length === 0) {
    return {
      pronScore: 0,
      accuracyScore: 0,
      fluencyScore: 0,
      completenessScore: 0,
      words: [],
    };
  }

  // Build a mutable set of heard tokens; consume each match once
  const heardPool = [...heard];
  const wordResults = expected.map((token) => {
    const idx = heardPool.indexOf(token);
    const matched = idx !== -1;
    if (matched) heardPool.splice(idx, 1);
    return {
      word: token,
      accuracyScore: matched ? 100 : 0,
      errorType: matched ? "None" : "Mispronunciation",
      phonemes: [] as { phoneme: string; accuracyScore: number }[],
    };
  });

  const matchedCount = wordResults.filter((w) => w.errorType === "None").length;
  const completenessScore = Math.round((matchedCount / expected.length) * 100);
  // pronScore / accuracyScore: overlap ratio, weighted toward completeness
  const overlapScore = completenessScore;

  return {
    pronScore: overlapScore,
    accuracyScore: overlapScore,
    fluencyScore: 0,
    completenessScore,
    words: wordResults,
  };
}
