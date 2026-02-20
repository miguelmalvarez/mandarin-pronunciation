import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

beforeEach(() => {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue({
      ok: true,
      blob: () => Promise.resolve(new Blob(["audio"], { type: "audio/mpeg" })),
      json: () => Promise.resolve({}),
    }),
  );

  vi.stubGlobal("MediaRecorder", vi.fn());
});

function renderApp(initialRoute = "/") {
  return render(
    <MemoryRouter initialEntries={[initialRoute]}>
      <App />
    </MemoryRouter>,
  );
}

describe("App integration", () => {
  it("renders the navbar with both links", () => {
    renderApp();
    expect(screen.getByText("Word Practice")).toBeInTheDocument();
    expect(screen.getByText("Tone Practice")).toBeInTheDocument();
  });

  it("renders the practice page by default", () => {
    renderApp();
    expect(screen.getByText("Mandarin Pronunciation Drill")).toBeInTheDocument();
    const card = document.querySelector(".card");
    expect(card).toBeInTheDocument();
    expect(card?.querySelector(".hanzi")?.textContent).toBeTruthy();
  });

  it("has Play reference and Record buttons on practice page", () => {
    renderApp();
    expect(screen.getByLabelText("Play reference pronunciation")).toBeInTheDocument();
    expect(screen.getByLabelText("Start recording")).toBeInTheDocument();
  });

  it("navigates to next character", async () => {
    renderApp();
    await userEvent.click(screen.getByLabelText("Next character"));
    expect(document.querySelector(".hanzi")?.textContent).toBeTruthy();
  });

  it("Previous is disabled at start", () => {
    renderApp();
    expect(screen.getByLabelText("Previous character")).toBeDisabled();
  });

  it("Previous is enabled after navigating forward", async () => {
    renderApp();
    await userEvent.click(screen.getByLabelText("Next character"));
    expect(screen.getByLabelText("Previous character")).toBeEnabled();
  });

  it("renders the tone practice page at /tones", () => {
    renderApp("/tones");
    expect(screen.getByRole("heading", { name: "Tone Practice" })).toBeInTheDocument();
    expect(screen.getByLabelText("Select syllable")).toBeInTheDocument();
  });

  it("navigates between pages via navbar", async () => {
    renderApp();
    expect(screen.getByText("Mandarin Pronunciation Drill")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Tone Practice"));
    expect(screen.getByLabelText("Select syllable")).toBeInTheDocument();

    await userEvent.click(screen.getByText("Word Practice"));
    expect(screen.getByText("Mandarin Pronunciation Drill")).toBeInTheDocument();
  });
});
