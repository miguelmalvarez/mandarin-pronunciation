import { describe, it, expect } from "vitest";
import { tokenize, scoreTranscript } from "./scoreTranscript";

describe("tokenize", () => {
  it("splits CJK characters individually", () => {
    expect(tokenize("你好")).toEqual(["你", "好"]);
  });

  it("handles single character", () => {
    expect(tokenize("马")).toEqual(["马"]);
  });

  it("handles ASCII pinyin as a single token", () => {
    expect(tokenize("ma")).toEqual(["ma"]);
  });

  it("strips punctuation", () => {
    expect(tokenize("你好！")).toEqual(["你", "好"]);
  });

  it("handles empty string", () => {
    expect(tokenize("")).toEqual([]);
  });
});

describe("scoreTranscript", () => {
  it("returns 100 when transcript matches exactly", () => {
    const result = scoreTranscript("你好", "你好");
    expect(result.pronScore).toBe(100);
    expect(result.completenessScore).toBe(100);
    expect(result.accuracyScore).toBe(100);
    expect(result.words.every((w) => w.errorType === "None")).toBe(true);
  });

  it("returns 0 when transcript is null", () => {
    const result = scoreTranscript(null, "你好");
    expect(result.pronScore).toBe(0);
    expect(result.completenessScore).toBe(0);
    expect(result.words.every((w) => w.errorType === "Mispronunciation")).toBe(true);
  });

  it("returns 0 when transcript is empty string", () => {
    const result = scoreTranscript("", "你好");
    expect(result.pronScore).toBe(0);
  });

  it("returns 50 when half the characters match", () => {
    const result = scoreTranscript("你", "你好");
    expect(result.pronScore).toBe(50);
    expect(result.completenessScore).toBe(50);
  });

  it("marks matched words as None and missing as Mispronunciation", () => {
    const result = scoreTranscript("你", "你好");
    const matched = result.words.find((w) => w.word === "你");
    const missed = result.words.find((w) => w.word === "好");
    expect(matched?.errorType).toBe("None");
    expect(missed?.errorType).toBe("Mispronunciation");
  });

  it("fluencyScore is always 0 (unknown without API)", () => {
    const result = scoreTranscript("你好", "你好");
    expect(result.fluencyScore).toBe(0);
  });

  it("returns 0 scores when expectedText is empty", () => {
    const result = scoreTranscript("你好", "");
    expect(result.pronScore).toBe(0);
    expect(result.words).toHaveLength(0);
  });

  it("does not double-count repeated characters", () => {
    // Expected has one 你; transcript has two — should still be 100%
    const result = scoreTranscript("你你", "你");
    expect(result.completenessScore).toBe(100);
  });

  it("handles single-character expected text", () => {
    const full = scoreTranscript("马", "马");
    expect(full.pronScore).toBe(100);

    const miss = scoreTranscript("你", "马");
    expect(miss.pronScore).toBe(0);
  });
});
