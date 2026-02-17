import { useCallback, useEffect, useRef, useState } from "react";

interface SpeechOptions {
  voiceHintLang?: string;
}

export function useSpeechSynthesis(options: SpeechOptions = {}) {
  const synth = typeof window !== "undefined" ? window.speechSynthesis : null;
  const playingRef = useRef<SpeechSynthesisUtterance | null>(null);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);

  useEffect(() => {
    if (!synth) return;

    const updateVoices = () => setVoices(synth.getVoices());

    updateVoices();
    synth.addEventListener("voiceschanged", updateVoices);
    return () => synth.removeEventListener("voiceschanged", updateVoices);
  }, [synth]);

  const pickVoice = useCallback(() => {
    if (!voices.length) return null;
    if (options.voiceHintLang) {
      const langPrefix = options.voiceHintLang.toLowerCase();
      const match = voices.find((v) => v.lang?.toLowerCase().startsWith(langPrefix));
      if (match) return match;
    }
    return voices[0] ?? null;
  }, [options.voiceHintLang, voices]);

  const play = useCallback(
    async (text: string) => {
      if (!synth) throw new Error("Speech synthesis not supported in this browser.");
      if (!text) throw new Error("Nothing to speak.");

      if (synth.speaking) {
        synth.cancel();
      }

      const utterance = new SpeechSynthesisUtterance(text);
      const voice = pickVoice();
      if (voice) utterance.voice = voice;
      playingRef.current = utterance;

      return new Promise<void>((resolve, reject) => {
        utterance.onend = () => {
          playingRef.current = null;
          resolve();
        };
        utterance.onerror = (event) => {
          playingRef.current = null;
          reject(event.error || new Error("Speech synthesis failed."));
        };
        synth.speak(utterance);
      });
    },
    [pickVoice, synth],
  );

  const stop = useCallback(() => {
    if (!synth) return;
    synth.cancel();
    playingRef.current = null;
  }, [synth]);

  return {
    supported: !!synth,
    voices,
    play,
    stop,
  };
}
