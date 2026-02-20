import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAzureTts } from "./useAzureTts";

class MockSpeechSynthesisUtterance {
  text: string;
  voice: SpeechSynthesisVoice | null = null;
  onend: ((e: Event) => void) | null = null;
  onerror: ((e: Event) => void) | null = null;
  constructor(text: string) {
    this.text = text;
  }
}

function makeMockSynth() {
  return {
    speaking: false,
    cancel: vi.fn(),
    getVoices: vi.fn(() => []),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    speak: vi.fn((utterance: MockSpeechSynthesisUtterance) => {
      utterance.onend?.(new Event("end"));
    }),
  };
}

describe("useAzureTts", () => {
  let mockAudio: {
    play: ReturnType<typeof vi.fn>;
    pause: ReturnType<typeof vi.fn>;
    onended: (() => void) | null;
    onerror: (() => void) | null;
  };

  beforeEach(() => {
    vi.stubGlobal("SpeechSynthesisUtterance", MockSpeechSynthesisUtterance);
    mockAudio = {
      play: vi.fn().mockResolvedValue(undefined),
      pause: vi.fn(),
      onended: null,
      onerror: null,
    };
    vi.stubGlobal("Audio", vi.fn(() => mockAudio));
    vi.stubGlobal("URL", {
      createObjectURL: vi.fn(() => "blob:mock-url"),
      revokeObjectURL: vi.fn(),
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns supported as true", () => {
    const { result } = renderHook(() => useAzureTts());
    expect(result.current.supported).toBe(true);
  });

  it("play fetches from /api/tts and plays audio", async () => {
    const mockBlob = new Blob(["audio"], { type: "audio/mpeg" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      }),
    );

    const { result } = renderHook(() => useAzureTts());

    let playPromise: Promise<void>;
    act(() => {
      playPromise = result.current.play("你好");
    });

    await vi.waitFor(() => {
      expect(mockAudio.onended).not.toBeNull();
    });

    act(() => {
      mockAudio.onended!();
    });

    await playPromise!;

    expect(fetch).toHaveBeenCalledWith(
      "/api/tts",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ text: "你好" }),
      }),
    );
    expect(mockAudio.play).toHaveBeenCalled();
  });

  it("falls back to browser TTS on non-ok API response", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: false,
        json: () => Promise.resolve({ error: "Azure TTS error" }),
      }),
    );
    const mockSynth = makeMockSynth();
    vi.stubGlobal("speechSynthesis", mockSynth);

    const { result } = renderHook(() => useAzureTts());

    await act(async () => {
      await result.current.play("你好");
    });

    expect(mockSynth.speak).toHaveBeenCalled();
  });

  it("falls back to browser TTS on network error", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("Network error")));
    const mockSynth = makeMockSynth();
    vi.stubGlobal("speechSynthesis", mockSynth);

    const { result } = renderHook(() => useAzureTts());

    await act(async () => {
      await result.current.play("你好");
    });

    expect(mockSynth.speak).toHaveBeenCalled();
  });

  it("stop pauses the current audio", async () => {
    const mockBlob = new Blob(["audio"], { type: "audio/mpeg" });
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        blob: () => Promise.resolve(mockBlob),
      }),
    );

    const { result } = renderHook(() => useAzureTts());

    act(() => {
      result.current.play("你好");
    });

    await vi.waitFor(() => {
      expect(mockAudio.play).toHaveBeenCalled();
    });

    act(() => {
      result.current.stop();
    });

    expect(mockAudio.pause).toHaveBeenCalled();
  });
});
