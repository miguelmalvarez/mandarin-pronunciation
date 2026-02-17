import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";

// Mock speechSynthesis
const mockSpeak = vi.fn();
const mockCancel = vi.fn();
const mockGetVoices = vi.fn().mockReturnValue([]);

beforeEach(() => {
  vi.stubGlobal("speechSynthesis", {
    speak: mockSpeak,
    cancel: mockCancel,
    getVoices: mockGetVoices,
    speaking: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
  });

  // Mock MediaRecorder
  vi.stubGlobal("MediaRecorder", vi.fn());
});

describe("App integration", () => {
  it("renders the app title", () => {
    render(<App />);
    expect(screen.getByText("Mandarin Pronunciation Drill")).toBeInTheDocument();
  });

  it("displays a character card with hanzi, pinyin, and gloss", () => {
    render(<App />);
    // There should be a character displayed (we don't know which one due to randomness)
    const card = document.querySelector(".card");
    expect(card).toBeInTheDocument();
    expect(card?.querySelector(".hanzi")?.textContent).toBeTruthy();
    expect(card?.querySelector(".pinyin")?.textContent).toBeTruthy();
    expect(card?.querySelector(".gloss")?.textContent).toBeTruthy();
  });

  it("has Play reference and Record buttons", () => {
    render(<App />);
    expect(screen.getByLabelText("Play reference pronunciation")).toBeInTheDocument();
    expect(screen.getByLabelText("Start recording")).toBeInTheDocument();
  });

  it("navigates to next character", async () => {
    render(<App />);
    await userEvent.click(screen.getByLabelText("Next character"));

    // Character may or may not change (random), but the app shouldn't crash
    expect(document.querySelector(".hanzi")?.textContent).toBeTruthy();
  });

  it("Previous is disabled at start", () => {
    render(<App />);
    expect(screen.getByLabelText("Previous character")).toBeDisabled();
  });

  it("Previous is enabled after navigating forward", async () => {
    render(<App />);
    await userEvent.click(screen.getByLabelText("Next character"));
    expect(screen.getByLabelText("Previous character")).toBeEnabled();
  });
});
