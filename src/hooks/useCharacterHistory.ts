import { useState, useCallback } from "react";
import { CharacterEntry } from "../types";
import { pickRandomCharacter } from "../utils/random";

export function useCharacterHistory() {
  const [history, setHistory] = useState<CharacterEntry[]>(() => [pickRandomCharacter()]);
  const [historyIndex, setHistoryIndex] = useState(0);

  const current = history[historyIndex];
  const canGoBack = historyIndex > 0;

  const next = useCallback(() => {
    setHistory((prev) => {
      const base = prev.slice(0, historyIndex + 1);
      return [...base, pickRandomCharacter()];
    });
    setHistoryIndex((prev) => prev + 1);
  }, [historyIndex]);

  const previous = useCallback(() => {
    if (historyIndex === 0) return;
    setHistoryIndex((prev) => Math.max(0, prev - 1));
  }, [historyIndex]);

  return { current, canGoBack, next, previous };
}
