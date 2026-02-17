import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { CharacterCard } from "./CharacterCard";

describe("CharacterCard", () => {
  const character = { hanzi: "你", pinyin: "nǐ", gloss: "you (singular)" };

  it("renders hanzi, pinyin, and gloss", () => {
    render(<CharacterCard character={character} />);
    expect(screen.getByText("你")).toBeInTheDocument();
    expect(screen.getByText("nǐ")).toBeInTheDocument();
    expect(screen.getByText("you (singular)")).toBeInTheDocument();
  });

  it("has an aria-label with the character", () => {
    render(<CharacterCard character={character} />);
    expect(screen.getByLabelText("Character: 你")).toBeInTheDocument();
  });
});
