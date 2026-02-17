interface StatusMessageProps {
  isRecording: boolean;
  recorderSupported: boolean;
  error: string | null;
}

export function StatusMessage({ isRecording, recorderSupported, error }: StatusMessageProps) {
  return (
    <>
      {!recorderSupported && (
        <div className="status error" role="alert">
          Recording not available in this browser. You can still hear reference audio and move
          between characters.
        </div>
      )}

      {isRecording && (
        <div className="status recording-status" role="status" aria-live="polite">
          Recording... tap Stop to finish.
        </div>
      )}

      {error && (
        <div className="status error" role="alert">
          {error}
          {error.toLowerCase().includes("denied") || error.toLowerCase().includes("permission") ? (
            <div className="inline-note">
              Open your browser settings, find microphone permissions for this site, and set it to
              Allow. Then reload the page.
            </div>
          ) : (
            <div className="inline-note">If mic is blocked, allow permission and try again.</div>
          )}
        </div>
      )}
    </>
  );
}
