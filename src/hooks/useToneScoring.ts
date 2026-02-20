import { useCallback, useState } from "react";
import {
  extractPitchContour,
  getExpectedContour,
  compareToneContours,
} from "../utils/pitchAnalysis";

export interface ToneScore {
  toneScore: number;
  detectedContour: number[];
  expectedContour: number[];
}

export function useToneScoring() {
  const [toneScore, setToneScore] = useState<ToneScore | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const analyze = useCallback(async (recordingUrl: string, tone: 1 | 2 | 3 | 4) => {
    setIsAnalyzing(true);
    try {
      const detectedContour = await extractPitchContour(recordingUrl);
      const expectedContour = getExpectedContour(tone);
      const score = compareToneContours(detectedContour, expectedContour);

      const result: ToneScore = { toneScore: score, detectedContour, expectedContour };
      setToneScore(result);
      return result;
    } catch {
      setToneScore(null);
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  }, []);

  const clearToneScore = useCallback(() => {
    setToneScore(null);
  }, []);

  return { toneScore, isAnalyzing, analyze, clearToneScore };
}
