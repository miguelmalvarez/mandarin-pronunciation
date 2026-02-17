interface ControlButtonsProps {
  isPlayingRef: boolean;
  isRecording: boolean;
  isPlayingUser: boolean;
  hasRecording: boolean;
  recorderSupported: boolean;
  controlsLocked: boolean;
  onPlayReference: () => void;
  onRecordToggle: () => void;
  onPlayUserRecording: () => void;
  onPlayBoth: () => void;
}

export function ControlButtons({
  isPlayingRef,
  isRecording,
  isPlayingUser,
  hasRecording,
  recorderSupported,
  controlsLocked,
  onPlayReference,
  onRecordToggle,
  onPlayUserRecording,
  onPlayBoth,
}: ControlButtonsProps) {
  return (
    <div className="controls-row">
      <button
        className="btn primary"
        onClick={onPlayReference}
        disabled={controlsLocked}
        aria-label="Play reference pronunciation"
      >
        {isPlayingRef ? "Playing..." : "Play reference"}
      </button>
      <button
        className={`btn secondary${isRecording ? " recording" : ""}`}
        onClick={onRecordToggle}
        disabled={!recorderSupported || controlsLocked}
        aria-label={isRecording ? "Stop recording" : "Start recording"}
      >
        {isRecording ? "Stop recording" : "Record"}
      </button>
      <button
        className="btn"
        onClick={onPlayUserRecording}
        disabled={!hasRecording || isPlayingUser || controlsLocked}
        aria-label="Play my recording"
      >
        {isPlayingUser ? "Playing..." : "Play my voice"}
      </button>
      <button
        className="btn"
        onClick={onPlayBoth}
        disabled={!hasRecording || controlsLocked || isPlayingUser}
        aria-label="Play reference then my recording"
      >
        Play both
      </button>
    </div>
  );
}
