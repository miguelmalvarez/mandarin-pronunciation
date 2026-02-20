import { useState, useCallback, useEffect } from "react";
import { CharacterEntry } from "../types";
import { characters } from "../data/characters";
import { pickRandomCharacter } from "../utils/random";

export type CharacterFilter = "all" | "character" | "word";

function getPool(filter: CharacterFilter): CharacterEntry[] {
  if (filter === "all") return characters;
  return characters.filter((c) => c.category === filter);
}

export function useCharacterHistory(filter: CharacterFilter = "all") {
  const [history, setHistory] = useState<CharacterEntry[]>(() => [pickRandomCharacter(getPool(filter))]);
  const [historyIndex, setHistoryIndex] = useState(0);

  useEffect(() => {
    setHistory([pickRandomCharacter(getPool(filter))]);
    setHistoryIndex(0);
  }, [filter]);

  const current = history[historyIndex];
  const canGoBack = historyIndex > 0;

  const next = useCallback(() => {
    const pool = getPool(filter);
    setHistory((prev) => {
      const base = prev.slice(0, historyIndex + 1);
      return [...base, pickRandomCharacter(pool)];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex, filter]);

  const previous = useCallback(() => {
    if (historyIndex === 0) return;
    setHistoryIndex((prev) => Math.max(0, prev - 1));
  }, [historyIndex]);

  return { current, canGoBack, next, previous };
}
