import { useCallback, useEffect, useRef, useState } from "react";

interface RecorderState {
  isRecording: boolean;
  error: string | null;
  recordingUrl: string | null;
  supported: boolean;
}

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    error: null,
    recordingUrl: null,
    supported: typeof window !== "undefined" && typeof MediaRecorder !== "undefined",
  });

  useEffect(() => {
    return () => {
      if (state.recordingUrl) {
        URL.revokeObjectURL(state.recordingUrl);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }
      if (mediaRecorderRef.current?.state === "recording") {
        mediaRecorderRef.current.stop();
      }
    };
  }, [state.recordingUrl]);

  const start = useCallback(async () => {
    if (!state.supported) {
      setState((prev) => ({ ...prev, error: "Recording not supported on this browser." }));
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      const chunks: BlobPart[] = [];

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      recorder.onstop = () => {
        const blob = new Blob(chunks, { type: "audio/webm" });
        const url = URL.createObjectURL(blob);
        setState((prev) => ({
          ...prev,
          isRecording: false,
          recordingUrl: url,
          error: null,
        }));
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setState((prev) => ({ ...prev, isRecording: true, error: null }));
    } catch (err) {
      const message =
        err instanceof DOMException && err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow mic permission in your browser settings and try again."
          : err instanceof Error
            ? err.message
            : "Could not start recording.";
      setState((prev) => ({
        ...prev,
        error: message,
        isRecording: false,
      }));
    }
  }, [state.supported]);

  const stop = useCallback(() => {
    if (mediaRecorderRef.current?.state === "recording") {
      mediaRecorderRef.current.stop();
    }
    setState((prev) => ({ ...prev, isRecording: false }));
  }, []);

  const clearRecording = useCallback(() => {
    if (state.recordingUrl) {
      URL.revokeObjectURL(state.recordingUrl);
    }
    setState((prev) => ({ ...prev, recordingUrl: null }));
  }, [state.recordingUrl]);

  return {
    ...state,
    start,
    stop,
    clearRecording,
  };
}
