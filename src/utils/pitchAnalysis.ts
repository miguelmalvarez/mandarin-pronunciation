/**
 * Client-side F0 pitch extraction and tone contour comparison.
 * Uses Web Audio API autocorrelation — no external dependencies.
 */

const MIN_F0 = 75; // Hz — lower bound of human voice
const MAX_F0 = 500; // Hz — upper bound for Mandarin tones

/**
 * Extract pitch contour (F0 over time) from an audio blob URL.
 * Returns normalized pitch values (0-1) sampled at ~100 Hz.
 */
export async function extractPitchContour(blobUrl: string): Promise<number[]> {
  const response = await fetch(blobUrl);
  const arrayBuffer = await response.arrayBuffer();

  const sampleRate = 16000;
  const audioContext = new AudioContext({ sampleRate });

  try {
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
    const samples = audioBuffer.getChannelData(0);
    return extractF0FromSamples(samples, sampleRate);
  } finally {
    await audioContext.close();
  }
}

/**
 * Extract F0 values from raw PCM samples using autocorrelation.
 */
export function extractF0FromSamples(samples: Float32Array, sampleRate: number): number[] {
  const frameSize = Math.floor(sampleRate * 0.03); // 30ms frames
  const hopSize = Math.floor(sampleRate * 0.01); // 10ms hop (100 Hz output)
  const pitchValues: number[] = [];

  const minLag = Math.floor(sampleRate / MAX_F0);
  const maxLag = Math.floor(sampleRate / MIN_F0);

  for (let start = 0; start + frameSize < samples.length; start += hopSize) {
    const frame = samples.subarray(start, start + frameSize);
    const f0 = estimateF0(frame, sampleRate, minLag, maxLag);
    pitchValues.push(f0);
  }

  // Normalize to 0-1 range relative to the speaker's own range
  return normalizePitch(pitchValues);
}

/**
 * Estimate fundamental frequency using autocorrelation.
 */
function estimateF0(
  frame: Float32Array,
  sampleRate: number,
  minLag: number,
  maxLag: number,
): number {
  // Check if frame has enough energy (silence detection)
  let energy = 0;
  for (let i = 0; i < frame.length; i++) {
    energy += frame[i] * frame[i];
  }
  if (energy / frame.length < 0.001) return 0; // too quiet

  const clampedMaxLag = Math.min(maxLag, frame.length - 1);

  // Compute normalized autocorrelation
  let bestLag = 0;
  let bestCorr = -1;

  for (let lag = minLag; lag <= clampedMaxLag; lag++) {
    let sum = 0;
    let norm1 = 0;
    let norm2 = 0;

    for (let i = 0; i < frame.length - lag; i++) {
      sum += frame[i] * frame[i + lag];
      norm1 += frame[i] * frame[i];
      norm2 += frame[i + lag] * frame[i + lag];
    }

    const normFactor = Math.sqrt(norm1 * norm2);
    const corr = normFactor > 0 ? sum / normFactor : 0;

    if (corr > bestCorr) {
      bestCorr = corr;
      bestLag = lag;
    }
  }

  // Require minimum correlation threshold
  if (bestCorr < 0.3 || bestLag === 0) return 0;

  return sampleRate / bestLag;
}

/**
 * Normalize pitch values to 0-1 range, filtering out unvoiced frames (0).
 */
function normalizePitch(pitchValues: number[]): number[] {
  const voiced = pitchValues.filter((f) => f > 0);
  if (voiced.length === 0) return pitchValues.map(() => 0);

  const minF0 = Math.min(...voiced);
  const maxF0 = Math.max(...voiced);
  const range = maxF0 - minF0;

  if (range < 1) {
    // Flat pitch
    return pitchValues.map((f) => (f > 0 ? 0.5 : 0));
  }

  return pitchValues.map((f) => (f > 0 ? (f - minF0) / range : 0));
}

/**
 * Get the expected normalized contour for a given Mandarin tone.
 * Returns ~10 sample points representing the tone shape.
 */
export function getExpectedContour(tone: 1 | 2 | 3 | 4): number[] {
  switch (tone) {
    case 1: // High flat: ¯
      return [0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9, 0.9];
    case 2: // Rising: /
      return [0.3, 0.35, 0.4, 0.45, 0.5, 0.6, 0.7, 0.8, 0.85, 0.9];
    case 3: // Dipping: \/
      return [0.6, 0.5, 0.4, 0.3, 0.2, 0.15, 0.2, 0.3, 0.5, 0.7];
    case 4: // Falling: \
      return [0.9, 0.85, 0.8, 0.7, 0.6, 0.5, 0.4, 0.3, 0.2, 0.1];
  }
}

/**
 * Compare two contours using cosine similarity.
 * Returns a score from 0-100.
 */
export function compareToneContours(actual: number[], expected: number[]): number {
  // Resample actual to match expected length
  const resampled = resample(actual.filter((v) => v > 0), expected.length);
  if (resampled.length === 0) return 0;

  // Cosine similarity
  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < expected.length; i++) {
    const a = resampled[i] ?? 0;
    const b = expected[i];
    dotProduct += a * b;
    normA += a * a;
    normB += b * b;
  }

  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  if (denom === 0) return 0;

  const similarity = dotProduct / denom;
  // Convert from [-1, 1] cosine to [0, 100] score
  return Math.round(Math.max(0, Math.min(100, similarity * 100)));
}

/**
 * Resample an array to a target length using linear interpolation.
 */
function resample(input: number[], targetLength: number): number[] {
  if (input.length === 0) return [];
  if (input.length === 1) return new Array(targetLength).fill(input[0]);

  const result: number[] = [];
  for (let i = 0; i < targetLength; i++) {
    const pos = (i / (targetLength - 1)) * (input.length - 1);
    const low = Math.floor(pos);
    const high = Math.min(low + 1, input.length - 1);
    const frac = pos - low;
    result.push(input[low] * (1 - frac) + input[high] * frac);
  }
  return result;
}
