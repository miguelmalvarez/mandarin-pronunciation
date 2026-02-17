import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ControlButtons } from "./ControlButtons";

const defaultProps = {
  isPlayingRef: false,
  isRecording: false,
  isPlayingUser: false,
  hasRecording: false,
  recorderSupported: true,
  controlsLocked: false,
  onPlayReference: vi.fn(),
  onRecordToggle: vi.fn(),
  onPlayUserRecording: vi.fn(),
  onPlayBoth: vi.fn(),
};

describe("ControlButtons", () => {
  it("renders all four buttons", () => {
    render(<ControlButtons {...defaultProps} />);
    expect(screen.getByLabelText("Play reference pronunciation")).toBeInTheDocument();
    expect(screen.getByLabelText("Start recording")).toBeInTheDocument();
    expect(screen.getByLabelText("Play my recording")).toBeInTheDocument();
    expect(screen.getByLabelText("Play reference then my recording")).toBeInTheDocument();
  });

  it("disables Play my voice and Play both when no recording", () => {
    render(<ControlButtons {...defaultProps} hasRecording={false} />);
    expect(screen.getByLabelText("Play my recording")).toBeDisabled();
    expect(screen.getByLabelText("Play reference then my recording")).toBeDisabled();
  });

  it("shows 'Playing...' when isPlayingRef is true", () => {
    render(<ControlButtons {...defaultProps} isPlayingRef={true} />);
    expect(screen.getByLabelText("Play reference pronunciation")).toHaveTextContent("Playing...");
  });

  it("shows 'Stop recording' when isRecording is true", () => {
    render(<ControlButtons {...defaultProps} isRecording={true} />);
    expect(screen.getByLabelText("Stop recording")).toHaveTextContent("Stop recording");
  });

  it("calls onPlayReference when Play reference is clicked", async () => {
    const onPlayReference = vi.fn();
    render(<ControlButtons {...defaultProps} onPlayReference={onPlayReference} />);
    await userEvent.click(screen.getByLabelText("Play reference pronunciation"));
    expect(onPlayReference).toHaveBeenCalledOnce();
  });

  it("disables Record when recorder not supported", () => {
    render(<ControlButtons {...defaultProps} recorderSupported={false} />);
    expect(screen.getByLabelText("Start recording")).toBeDisabled();
  });
});
