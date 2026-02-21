import { useCallback, useEffect, useRef, useState } from "react";

// SpeechRecognition is not universally in TypeScript's DOM lib, so we use `any`
// to handle both the standard and webkit-prefixed variants (Chrome/Edge).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnySpeechRecognition = any;

function getSpeechRecognition(): AnySpeechRecognition | null {
  if (typeof window === "undefined") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const w = window as any;
  return w.SpeechRecognition ?? w.webkitSpeechRecognition ?? null;
}

interface RecorderState {
  isRecording: boolean;
  error: string | null;
  recordingUrl: string | null;
  transcript: string | null;
  supported: boolean;
}

export function useRecorder() {
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const recognitionRef = useRef<AnySpeechRecognition>(null);
  const [state, setState] = useState<RecorderState>({
    isRecording: false,
    error: null,
    recordingUrl: null,
    transcript: null,
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
      try {
        recognitionRef.current?.stop();
      } catch {
        // ignore errors on cleanup
      }
      recognitionRef.current = null;
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

      // Start SpeechRecognition in parallel for transcript (Chrome/Edge only)
      const SpeechRecognitionCtor = getSpeechRecognition();
      if (SpeechRecognitionCtor) {
        try {
          const recognition = new SpeechRecognitionCtor();
          recognition.lang = "zh-CN";
          recognition.continuous = false;
          recognition.interimResults = false;
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          recognition.onresult = (event: any) => {
            const last = event.results.length - 1;
            const t = event.results[last][0].transcript.trim();
            setState((prev) => ({ ...prev, transcript: t }));
          };
          recognition.onerror = () => {
            // Non-fatal: transcript just stays null
          };
          recognition.start();
          recognitionRef.current = recognition;
        } catch {
          // SpeechRecognition unavailable — transcript stays null
        }
      }

      setState((prev) => ({ ...prev, isRecording: true, error: null, transcript: null }));
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
    try {
      recognitionRef.current?.stop();
    } catch {
      // ignore
    }
    setState((prev) => ({ ...prev, isRecording: false }));
  }, []);

  const clearRecording = useCallback(() => {
    if (state.recordingUrl) {
      URL.revokeObjectURL(state.recordingUrl);
    }
    setState((prev) => ({ ...prev, recordingUrl: null, transcript: null }));
  }, [state.recordingUrl]);

  return {
    ...state,
    start,
    stop,
    clearRecording,
  };
}
