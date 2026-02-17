import { useCallback, useRef } from "react";

export function useAudioPlayback() {
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const playBlob = useCallback(async (url: string) => {
    const audio = new Audio(url);
    audioRef.current = audio;
    await new Promise<void>((resolve, reject) => {
      audio.onended = () => {
        audioRef.current = null;
        resolve();
      };
      audio.onerror = () => {
        audioRef.current = null;
        reject(new Error("Could not play audio."));
      };
      audio.play().catch((err) => {
        audioRef.current = null;
        reject(err);
      });
    });
  }, []);

  const stopPlayback = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
  }, []);

  return { playBlob, stopPlayback };
}
