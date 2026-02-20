import { useCallback, useState } from "react";
import { blobUrlToWav } from "../utils/audioConvert";
import type { AssessmentScore } from "../types";

export function usePronunciationAssessment() {
  const [score, setScore] = useState<AssessmentScore | null>(null);
  const [isAssessing, setIsAssessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const assess = useCallback(async (recordingUrl: string, referenceText: string) => {
    setIsAssessing(true);
    setError(null);
    setScore(null);

    try {
      const wavBuffer = await blobUrlToWav(recordingUrl);

      const response = await fetch(
        `/api/assess?text=${encodeURIComponent(referenceText)}&lang=zh-CN`,
        {
          method: "POST",
          headers: { "Content-Type": "audio/wav" },
          body: wavBuffer,
        },
      );

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Assessment failed" }));
        throw new Error(err.error ?? "Assessment failed");
      }

      const result = await response.json();
      const parsed = parseAzureResponse(result);
      setScore(parsed);
      return parsed;
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

function parseAzureResponse(result: Record<string, unknown>): AssessmentScore {
  const nBest = (result.NBest as Record<string, unknown>[])?.[0];
  if (!nBest) {
    throw new Error("No recognition result from Azure");
  }

  const pa = nBest.PronunciationAssessment as Record<string, number>;
  const words = (nBest.Words as Record<string, unknown>[]) ?? [];

  return {
    pronScore: pa?.PronScore ?? 0,
    accuracyScore: pa?.AccuracyScore ?? 0,
    fluencyScore: pa?.FluencyScore ?? 0,
    completenessScore: pa?.CompletenessScore ?? 0,
    words: words.map((w) => {
      const wpa = w.PronunciationAssessment as Record<string, unknown>;
      const phonemes = (w.Phonemes as Record<string, unknown>[]) ?? [];
      return {
        word: (w.Word as string) ?? "",
        accuracyScore: (wpa?.AccuracyScore as number) ?? 0,
        errorType: (wpa?.ErrorType as string) ?? "None",
        phonemes: phonemes.map((p) => {
          const ppa = p.PronunciationAssessment as Record<string, number>;
          return {
            phoneme: (p.Phoneme as string) ?? "",
            accuracyScore: ppa?.AccuracyScore ?? 0,
          };
        }),
      };
    }),
  };
}
