import { describe, it, expect } from "vitest";
import { encodeWav } from "./audioConvert";

describe("encodeWav", () => {
  it("produces a valid WAV header for empty data", () => {
    const samples = new Float32Array(0);
    const buffer = encodeWav(samples, 16000);
    const view = new DataView(buffer);

    expect(buffer.byteLength).toBe(44); // header only
    expect(getString(view, 0, 4)).toBe("RIFF");
    expect(view.getUint32(4, true)).toBe(36); // 36 + 0 data bytes
    expect(getString(view, 8, 4)).toBe("WAVE");
    expect(getString(view, 12, 4)).toBe("fmt ");
    expect(view.getUint32(16, true)).toBe(16); // fmt chunk size
    expect(view.getUint16(20, true)).toBe(1); // PCM format
    expect(view.getUint16(22, true)).toBe(1); // mono
    expect(view.getUint32(24, true)).toBe(16000); // sample rate
    expect(view.getUint32(28, true)).toBe(32000); // byte rate (16000 * 1 * 2)
    expect(view.getUint16(32, true)).toBe(2); // block align
    expect(view.getUint16(34, true)).toBe(16); // bits per sample
    expect(getString(view, 36, 4)).toBe("data");
    expect(view.getUint32(40, true)).toBe(0); // data size
  });

  it("encodes samples correctly", () => {
    const samples = new Float32Array([0, 1, -1, 0.5, -0.5]);
    const buffer = encodeWav(samples, 16000);
    const view = new DataView(buffer);

    expect(buffer.byteLength).toBe(44 + 10); // header + 5 samples * 2 bytes
    expect(view.getUint32(40, true)).toBe(10); // data size

    expect(view.getInt16(44, true)).toBe(0); // 0
    expect(view.getInt16(46, true)).toBe(0x7fff); // +1 → max int16
    expect(view.getInt16(48, true)).toBe(-0x8000); // -1 → min int16
    expect(view.getInt16(50, true)).toBeCloseTo(0x7fff * 0.5, -2); // ~0.5
    expect(view.getInt16(52, true)).toBeCloseTo(-0x8000 * 0.5, -2); // ~-0.5
  });

  it("clamps values beyond [-1, 1]", () => {
    const samples = new Float32Array([2.0, -3.0]);
    const buffer = encodeWav(samples, 16000);
    const view = new DataView(buffer);

    expect(view.getInt16(44, true)).toBe(0x7fff); // clamped to +1
    expect(view.getInt16(46, true)).toBe(-0x8000); // clamped to -1
  });

  it("uses correct sample rate in header", () => {
    const buffer = encodeWav(new Float32Array(100), 44100);
    const view = new DataView(buffer);

    expect(view.getUint32(24, true)).toBe(44100);
    expect(view.getUint32(28, true)).toBe(88200); // 44100 * 2
  });
});

function getString(view: DataView, offset: number, length: number): string {
  let str = "";
  for (let i = 0; i < length; i++) {
    str += String.fromCharCode(view.getUint8(offset + i));
  }
  return str;
}
