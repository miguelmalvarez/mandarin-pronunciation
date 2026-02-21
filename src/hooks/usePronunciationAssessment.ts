import { useCallback, useState } from "react";
import { scoreTranscript } from "../utils/scoreTranscript";
import type { AssessmentScore } from "../types";

export function usePronunciationAssessment() {
  const [score, setScore] = useState<AssessmentScore | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assess = useCallback((transcript: string | null, referenceText: string) => {
    setIsAssessing(true);
    setError(null);
    setScore(null);

    try {
      const result = scoreTranscript(transcript, referenceText);
      setScore(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Pronunciation assessment failed";
      setError(message);
      return null;
    } finally {
      setIsAssessing(false);
    }
  }, []);

  const clearScore = useCallback(() => {
    setScore(null);
    setError(null);
  }, []);

  return { score, isAssessing, error, assess, clearScore };
}
