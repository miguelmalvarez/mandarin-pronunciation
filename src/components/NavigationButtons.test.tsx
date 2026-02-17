import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NavigationButtons } from "./NavigationButtons";

describe("NavigationButtons", () => {
  it("disables Previous when canGoBack is false", () => {
    render(
      <NavigationButtons
        canGoBack={false}
        controlsLocked={false}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Previous character")).toBeDisabled();
    expect(screen.getByLabelText("Next character")).toBeEnabled();
  });

  it("calls onNext when Next is clicked", async () => {
    const onNext = vi.fn();
    render(
      <NavigationButtons
        canGoBack={false}
        controlsLocked={false}
        onPrevious={vi.fn()}
        onNext={onNext}
      />,
    );
    await userEvent.click(screen.getByLabelText("Next character"));
    expect(onNext).toHaveBeenCalledOnce();
  });

  it("calls onPrevious when Previous is clicked", async () => {
    const onPrevious = vi.fn();
    render(
      <NavigationButtons
        canGoBack={true}
        controlsLocked={false}
        onPrevious={onPrevious}
        onNext={vi.fn()}
      />,
    );
    await userEvent.click(screen.getByLabelText("Previous character"));
    expect(onPrevious).toHaveBeenCalledOnce();
  });

  it("disables all buttons when controlsLocked is true", () => {
    render(
      <NavigationButtons
        canGoBack={true}
        controlsLocked={true}
        onPrevious={vi.fn()}
        onNext={vi.fn()}
      />,
    );
    expect(screen.getByLabelText("Previous character")).toBeDisabled();
    expect(screen.getByLabelText("Next character")).toBeDisabled();
  });
});
