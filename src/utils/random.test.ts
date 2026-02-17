import { describe, it, expect } from "vitest";
import { pickRandomCharacter } from "./random";
import { characters } from "../data/characters";

describe("pickRandomCharacter", () => {
  it("returns a character from the characters list", () => {
    const result = pickRandomCharacter();
    expect(characters).toContainEqual(result);
  });

  it("returns an object with hanzi, pinyin, and gloss", () => {
    const result = pickRandomCharacter();
    expect(result).toHaveProperty("hanzi");
    expect(result).toHaveProperty("pinyin");
    expect(result).toHaveProperty("gloss");
  });

  it("returns different characters over multiple calls", () => {
    const results = new Set<string>();
    for (let i = 0; i < 50; i++) {
      results.add(pickRandomCharacter().hanzi);
    }
    expect(results.size).toBeGreaterThan(1);
  });
});
