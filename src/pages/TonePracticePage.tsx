import { useState, useCallback, useEffect, useRef } from "react";
import { useAzureTts } from "../hooks/useAzureTts";
import { useRecorder } from "../hooks/useRecorder";
import { useAudioPlayback } from "../hooks/useAudioPlayback";
import { usePronunciationAssessment } from "../hooks/usePronunciationAssessment";
import { useToneScoring, type ToneScore } from "../hooks/useToneScoring";
import { SyllableSelector } from "../components/SyllableSelector";
import { ToneCard } from "../components/ToneCard";
import { toneSyllables, type ToneSyllable } from "../data/tones";
import type { AssessmentScore } from "../types";

export function TonePracticePage() {
  const [selectedSyllable, setSelectedSyllable] = useState<ToneSyllable>(toneSyllables[0]);
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [cardRecordings, setCardRecordings] = useState<Record<number, string>>({});
  const [cardTranscripts, setCardTranscripts] = useState<Record<number, string | null>>({});
  const [cardScores, setCardScores] = useState<Record<number, AssessmentScore>>({});
  const [toneScores, setToneScores] = useState<Record<number, ToneScore>>({});
  const [playingCard, setPlayingCard] = useState<number | null>(null);
  const [playingUserCard, setPlayingUserCard] = useState<number | null>(null);
  const [assessingCard, setAssessingCard] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { play } = useAzureTts();
  const {
    start,
    stop: stopRecording,
    isRecording,
    recordingUrl,
    transcript,
    clearRecording,
  } = useRecorder();
  const { playBlob } = useAudioPlayback();
  const { assess } = usePronunciationAssessment();
  const { analyze } = useToneScoring();

  // Tracks which card initiated the recording; not cleared on stop so it's
  // still valid when recordingUrl arrives asynchronously from MediaRecorder.
  const lastRecordingCardRef = useRef<number | null>(null);

  useEffect(() => {
    if (recordingUrl && lastRecordingCardRef.current !== null) {
      const card = lastRecordingCardRef.current;
      setCardRecordings((prev) => ({ ...prev, [card]: recordingUrl }));
      setCardTranscripts((prev) => ({ ...prev, [card]: transcript ?? null }));
    }
  }, [recordingUrl, transcript]);

  const handleSyllableChange = useCallback(
    (syllable: ToneSyllable) => {
      setSelectedSyllable(syllable);
      setCardRecordings({});
      setCardTranscripts({});
      setCardScores({});
      setToneScores({});
      setActiveCard(null);
      setError(null);
      clearRecording();
    },
    [clearRecording],
  );

  const handlePlayReference = useCallback(
    async (tone: number) => {
      const variant = selectedSyllable.variants[tone - 1];
      setError(null);
      setPlayingCard(tone);
      try {
        await play(variant.ttsText);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not play reference audio.");
      } finally {
        setPlayingCard(null);
      }
    },
    [selectedSyllable, play],
  );

  const handleRecordToggle = useCallback(
    async (tone: number) => {
      setError(null);
      if (isRecording && activeCard === tone) {
        stopRecording();
        setActiveCard(null);
      } else {
        if (isRecording) {
          stopRecording();
        }
        clearRecording();
        lastRecordingCardRef.current = tone;
        setActiveCard(tone);
        try {
          await start();
        } catch (err) {
          setError(err instanceof Error ? err.message : "Could not start recording.");
          setActiveCard(null);
        }
      }
    },
    [isRecording, activeCard, start, stopRecording, clearRecording],
  );

  const handlePlayUserRecording = useCallback(
    async (tone: number) => {
      const recording = cardRecordings[tone];
      if (!recording) return;
      setError(null);
      setPlayingUserCard(tone);
      try {
        await playBlob(recording);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not play your recording.");
      } finally {
        setPlayingUserCard(null);
      }
    },
    [cardRecordings, playBlob],
  );

  const handleAssess = useCallback(
    async (tone: number) => {
      const recording = cardRecordings[tone];
      if (!recording) return;
      setError(null);
      setAssessingCard(tone);
      try {
        const variant = selectedSyllable.variants[tone - 1];
        const cardTranscript = cardTranscripts[tone] ?? null;

        // Run pronunciation assessment (sync) and tone analysis (async) in parallel
        const [pronResult, toneResult] = await Promise.all([
          Promise.resolve(assess(cardTranscript, variant.ttsText)),
          analyze(recording, variant.tone),
        ]);

        if (pronResult) {
          setCardScores((prev) => ({ ...prev, [tone]: pronResult }));
        }
        if (toneResult) {
          setToneScores((prev) => ({ ...prev, [tone]: toneResult }));
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Assessment failed.");
      } finally {
        setAssessingCard(null);
      }
    },
    [cardRecordings, cardTranscripts, selectedSyllable, assess, analyze],
  );

  return (
    <div className="tone-practice">
      <h1 className="title">Tone Practice</h1>
      <p className="subtitle">Practice the four tones for each syllable</p>

      <SyllableSelector selected={selectedSyllable} onSelect={handleSyllableChange} />

      <div className="tone-grid">
        {selectedSyllable.variants.map((variant) => (
          <ToneCard
            key={variant.tone}
            variant={variant}
            isActive={activeCard === variant.tone}
            isRecording={isRecording}
            recordingUrl={cardRecordings[variant.tone] ?? null}
            isPlayingRef={playingCard === variant.tone}
            isPlayingUser={playingUserCard === variant.tone}
            isAssessing={assessingCard === variant.tone}
            pronScore={cardScores[variant.tone] ?? null}
            toneScore={toneScores[variant.tone] ?? null}
            onPlayReference={() => handlePlayReference(variant.tone)}
            onRecordToggle={() => handleRecordToggle(variant.tone)}
            onPlayUserRecording={() => handlePlayUserRecording(variant.tone)}
            onAssess={() => handleAssess(variant.tone)}
          />
        ))}
      </div>

      {error && (
        <div className="error" role="alert">
          {error}
        </div>
      )}
    </div>
  );
}
