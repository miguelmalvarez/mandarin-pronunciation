import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScoreDisplay } from "./ScoreDisplay";
import type { AssessmentScore } from "../types";

const mockScore: AssessmentScore = {
  pronScore: 85,
  accuracyScore: 90,
  fluencyScore: 75,
  completenessScore: 100,
  words: [
    {
      word: "你",
      accuracyScore: 92,
      errorType: "None",
      phonemes: [
        { phoneme: "n", accuracyScore: 95 },
        { phoneme: "i", accuracyScore: 89 },
      ],
    },
    {
      word: "好",
      accuracyScore: 45,
      errorType: "Mispronunciation",
      phonemes: [
        { phoneme: "h", accuracyScore: 60 },
        { phoneme: "ao", accuracyScore: 30 },
      ],
    },
  ],
};

describe("ScoreDisplay", () => {
  it("renders overall score", () => {
    render(<ScoreDisplay score={mockScore} />);
    expect(screen.getByText("85")).toBeInTheDocument();
    expect(screen.getByText("Overall")).toBeInTheDocument();
  });

  it("renders breakdown scores", () => {
    render(<ScoreDisplay score={mockScore} />);
    expect(screen.getByText("Accuracy")).toBeInTheDocument();
    expect(screen.getByText("90")).toBeInTheDocument();
    expect(screen.getByText("Fluency")).toBeInTheDocument();
    expect(screen.getByText("75")).toBeInTheDocument();
    expect(screen.getByText("Completeness")).toBeInTheDocument();
    expect(screen.getByText("100")).toBeInTheDocument();
  });

  it("renders per-word details", () => {
    render(<ScoreDisplay score={mockScore} />);
    expect(screen.getByText("你")).toBeInTheDocument();
    expect(screen.getByText("好")).toBeInTheDocument();
    expect(screen.getByText("Mispronunciation")).toBeInTheDocument();
  });

  it("renders phonemes", () => {
    render(<ScoreDisplay score={mockScore} />);
    expect(screen.getByText("n")).toBeInTheDocument();
    expect(screen.getByText("ao")).toBeInTheDocument();
  });

  it("applies correct color classes", () => {
    const { container } = render(<ScoreDisplay score={mockScore} />);
    const overall = container.querySelector(".score-overall");
    expect(overall?.classList.contains("score-green")).toBe(true);
  });
});
