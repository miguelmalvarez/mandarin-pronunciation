import { useCallback, useEffect, useRef, useState } from "react";

export function useAzureTts() {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  // Browser TTS fallback — loads zh-CN voices asynchronously
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!synth) return;
    const update = () => setVoices(synth.getVoices());
    update();
    synth.addEventListener("voiceschanged", update);
    return () => synth.removeEventListener("voiceschanged", update);
  }, [synth]);

  const browserPlay = useCallback(
    (text: string): Promise<void> => {
      if (!synth) throw new Error("Speech synthesis not supported in this browser.");
      if (synth.speaking) synth.cancel();
      const voice = voices.find((v) => v.lang?.toLowerCase().startsWith("zh")) ?? null;
      const utterance = new SpeechSynthesisUtterance(text);
      if (voice) utterance.voice = voice;
      return new Promise<void>((resolve, reject) => {
        utterance.onend = () => resolve();
        utterance.onerror = (e) =>
          reject(new Error(String(e.error) || "Speech synthesis failed."));
        synth.speak(utterance);
      });
    },
    [synth, voices],
  );

  const play = useCallback(
    async (text: string) => {
      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      try {
        const response = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
          signal: controller.signal,
        });

        if (!response.ok) {
          return await browserPlay(text);
        }

        const blob = await response.blob();
        const url = URL.createObjectURL(blob);

        return new Promise<void>((resolve, reject) => {
          const audio = new Audio(url);
          audioRef.current = audio;
          audio.onended = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            resolve();
          };
          audio.onerror = () => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            reject(new Error("Failed to play TTS audio"));
          };
          audio.play().catch((err) => {
            URL.revokeObjectURL(url);
            audioRef.current = null;
            reject(err);
          });
        });
      } catch (err) {
        if ((err as Error).name === "AbortError") throw err;
        // Network error (API not running locally) — fall back to browser TTS
        return await browserPlay(text);
      }
    },
    [browserPlay],
  );

  const stop = useCallback(() => {
    abortRef.current?.abort();
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    synth?.cancel();
  }, [synth]);

  return {
    play,
    stop,
    supported: true,
  };
}
