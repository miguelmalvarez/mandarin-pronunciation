import { characters } from "../data/characters";

export function pickRandomCharacter() {
  if (characters.length === 0) {
    throw new Error("No characters available.");
  }
  const index = Math.floor(Math.random() * characters.length);
  return characters[index];
}

