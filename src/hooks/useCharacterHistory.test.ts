import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useCharacterHistory } from "./useCharacterHistory";

describe("useCharacterHistory", () => {
  it("initializes with a random character", () => {
    const { result } = renderHook(() => useCharacterHistory());
    expect(result.current.current).toBeDefined();
    expect(result.current.current.hanzi).toBeDefined();
    expect(result.current.canGoBack).toBe(false);
  });

  it("advances to a new character on next()", () => {
    const { result } = renderHook(() => useCharacterHistory());

    act(() => result.current.next());

    expect(result.current.current).toBeDefined();
    expect(result.current.canGoBack).toBe(true);
    // It should be a different object (new random pick), though hanzi could theoretically match
  });

  it("goes back to previous character", () => {
    const { result } = renderHook(() => useCharacterHistory());
    const first = result.current.current;

    act(() => result.current.next());
    act(() => result.current.previous());

    expect(result.current.current).toEqual(first);
    expect(result.current.canGoBack).toBe(false);
  });

  it("does nothing when calling previous() at index 0", () => {
    const { result } = renderHook(() => useCharacterHistory());
    const first = result.current.current;

    act(() => result.current.previous());

    expect(result.current.current).toEqual(first);
    expect(result.current.canGoBack).toBe(false);
  });
});
