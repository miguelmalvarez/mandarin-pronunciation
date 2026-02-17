import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAudioPlayback } from "./useAudioPlayback";

describe("useAudioPlayback", () => {
  let mockPlay: ReturnType<typeof vi.fn>;
  let mockPause: ReturnType<typeof vi.fn>;
  let audioInstance: { onended?: () => void; onerror?: () => void; play: typeof mockPlay; pause: typeof mockPause };

  beforeEach(() => {
    mockPlay = vi.fn().mockResolvedValue(undefined);
    mockPause = vi.fn();

    vi.stubGlobal(
      "Audio",
      vi.fn().mockImplementation(() => {
        audioInstance = { play: mockPlay, pause: mockPause };
        return audioInstance;
      }),
    );
  });

  it("plays a blob URL and resolves on end", async () => {
    const { result } = renderHook(() => useAudioPlayback());

    let resolved = false;
    let promise: Promise<void>;
    act(() => {
      promise = result.current.playBlob("blob:test").then(() => {
        resolved = true;
      });
    });

    // Simulate audio ending
    act(() => audioInstance.onended!());
    await promise!;

    expect(resolved).toBe(true);
    expect(mockPlay).toHaveBeenCalled();
  });

  it("rejects on audio error", async () => {
    const { result } = renderHook(() => useAudioPlayback());

    let promise: Promise<void>;
    act(() => {
      promise = result.current.playBlob("blob:test");
    });

    act(() => audioInstance.onerror!());

    await expect(promise!).rejects.toThrow("Could not play audio.");
  });
});
