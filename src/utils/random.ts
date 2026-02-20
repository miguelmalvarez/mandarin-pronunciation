import { characters } from "../data/characters";
import { CharacterEntry } from "../types";

export function pickRandomCharacter(pool?: CharacterEntry[]) {
  const source = pool && pool.length > 0 ? pool : characters;
  if (source.length === 0) {
    throw new Error("No characters available.");
  }
  const index = Math.floor(Math.random() * source.length);
  return source[index];
}
