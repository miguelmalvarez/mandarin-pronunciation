import { describe, it, expect } from "vitest";
import {
  extractF0FromSamples,
  getExpectedContour,
  compareToneContours,
} from "./pitchAnalysis";

describe("getExpectedContour", () => {
  it("returns 10 points for each tone", () => {
    for (const tone of [1, 2, 3, 4] as const) {
      const contour = getExpectedContour(tone);
      expect(contour).toHaveLength(10);
      contour.forEach((v) => {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      });
    }
  });

  it("tone 1 is flat (low variance)", () => {
    const contour = getExpectedContour(1);
    const min = Math.min(...contour);
    const max = Math.max(...contour);
    expect(max - min).toBeLessThan(0.1);
  });

  it("tone 2 ends higher than it starts", () => {
    const contour = getExpectedContour(2);
    expect(contour[contour.length - 1]).toBeGreaterThan(contour[0]);
  });

  it("tone 4 ends lower than it starts", () => {
    const contour = getExpectedContour(4);
    expect(contour[contour.length - 1]).toBeLessThan(contour[0]);
  });

  it("tone 3 dips in the middle", () => {
    const contour = getExpectedContour(3);
    const middle = contour[Math.floor(contour.length / 2)];
    expect(middle).toBeLessThan(contour[0]);
    expect(middle).toBeLessThan(contour[contour.length - 1]);
  });
});

describe("compareToneContours", () => {
  it("identical contours score 100", () => {
    const contour = getExpectedContour(1);
    expect(compareToneContours(contour, contour)).toBe(100);
  });

  it("similar contours score higher than dissimilar ones", () => {
    const rising = getExpectedContour(2);
    const falling = getExpectedContour(4);
    const alsoRising = [0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.75, 0.8, 0.85, 0.9];

    const similarScore = compareToneContours(alsoRising, rising);
    const dissimilarScore = compareToneContours(alsoRising, falling);

    expect(similarScore).toBeGreaterThan(dissimilarScore);
  });

  it("empty actual contour scores 0", () => {
    const expected = getExpectedContour(1);
    expect(compareToneContours([], expected)).toBe(0);
  });

  it("all-zero actual contour scores 0", () => {
    const expected = getExpectedContour(1);
    expect(compareToneContours([0, 0, 0, 0, 0], expected)).toBe(0);
  });
});

describe("extractF0FromSamples", () => {
  it("returns empty for empty input", () => {
    const result = extractF0FromSamples(new Float32Array(0), 16000);
    expect(result).toHaveLength(0);
  });

  it("returns zeros for silence", () => {
    const silence = new Float32Array(16000); // 1 second of silence
    const result = extractF0FromSamples(silence, 16000);
    result.forEach((v) => expect(v).toBe(0));
  });

  it("detects pitch from a synthetic sine wave", () => {
    const sampleRate = 16000;
    const duration = 0.5; // 500ms
    const frequency = 200; // Hz
    const numSamples = Math.floor(sampleRate * duration);
    const samples = new Float32Array(numSamples);

    for (let i = 0; i < numSamples; i++) {
      samples[i] = 0.5 * Math.sin(2 * Math.PI * frequency * (i / sampleRate));
    }

    const result = extractF0FromSamples(samples, sampleRate);
    // Should have voiced frames (non-zero values)
    const voiced = result.filter((v) => v > 0);
    expect(voiced.length).toBeGreaterThan(0);
  });
});
