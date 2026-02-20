import { useEffect, useMemo, useState } from "react";
import { useAzureTts } from "../hooks/useAzureTts";
import { useRecorder } from "../hooks/useRecorder";
import { useCharacterHistory, CharacterFilter } from "../hooks/useCharacterHistory";
import { useAudioPlayback } from "../hooks/useAudioPlayback";
import { usePronunciationAssessment } from "../hooks/usePronunciationAssessment";
import { Header } from "../components/Header";
import { CharacterCard } from "../components/CharacterCard";
import { ControlButtons } from "../components/ControlButtons";
import { NavigationButtons } from "../components/NavigationButtons";
import { StatusMessage } from "../components/StatusMessage";
import { ScoreDisplay } from "../components/ScoreDisplay";

export function PracticePage() {
  const [filter, setFilter] = useState<CharacterFilter>("all");
  const { current, canGoBack, next, previous } = useCharacterHistory(filter);
  const { play, stop, supported: ttsSupported } = useAzureTts();
  const {
    start,
    stop: stopRecording,
    isRecording,
    recordingUrl,
    error: recordError,
    supported: recorderSupported,
    clearRecording,
  } = useRecorder();
  const { playBlob } = useAudioPlayback();
  const {
    score,
    isAssessing,
    error: assessError,
    assess,
    clearScore,
  } = usePronunciationAssessment();

  const [isPlayingRef, setIsPlayingRef] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [isPlayingBoth, setIsPlayingBoth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recordError) setError(recordError);
  }, [recordError]);

  useEffect(() => {
    if (assessError) setError(assessError);
  }, [assessError]);

  const hasRecording = useMemo(() => !!recordingUrl, [recordingUrl]);
  const controlsLocked = isPlayingRef || isPlayingBoth;

  const handleFilterChange = (newFilter: CharacterFilter) => {
    stop();
    clearRecording();
    clearScore();
    setError(null);
    setFilter(newFilter);
  };

  const handlePlayReference = async () => {
    if (!ttsSupported) {
      setError("Speech synthesis not supported in this browser.");
      return;
    }
    try {
      setError(null);
      setIsPlayingRef(true);
      await play(current.ttsText ?? current.hanzi);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play reference audio.");
    } finally {
      setIsPlayingRef(false);
    }
  };

  const handleRecordToggle = async () => {
    if (controlsLocked) return;
    setError(null);
    if (isRecording) {
      stopRecording();
    } else {
      await start();
    }
  };

  const handlePlayUserRecording = async () => {
    if (!recordingUrl || controlsLocked) return;
    setError(null);
    try {
      setIsPlayingUser(true);
      await playBlob(recordingUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play your recording.");
    } finally {
      setIsPlayingUser(false);
    }
  };

  const handlePlayBoth = async () => {
    if (!recordingUrl || !ttsSupported || controlsLocked || isPlayingUser) return;
    setError(null);
    setIsPlayingBoth(true);
    try {
      setIsPlayingRef(true);
      await play(current.ttsText ?? current.hanzi);
      setIsPlayingRef(false);
      setIsPlayingUser(true);
      await playBlob(recordingUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play reference and recording.");
    } finally {
      setIsPlayingRef(false);
      setIsPlayingUser(false);
      setIsPlayingBoth(false);
    }
  };

  const handleAssess = async () => {
    if (!recordingUrl) return;
    setError(null);
    await assess(recordingUrl, current.ttsText ?? current.hanzi);
  };

  const handleNext = () => {
    if (controlsLocked) return;
    stop();
    clearRecording();
    clearScore();
    setError(null);
    next();
  };

  const handlePrevious = () => {
    if (controlsLocked) return;
    stop();
    clearRecording();
    clearScore();
    setError(null);
    previous();
  };

  return (
    <>
      <Header recorderSupported={recorderSupported} />
      <div className="filter-toggle" role="group" aria-label="Filter by type">
        {(["all", "character", "word"] as CharacterFilter[]).map((f) => (
          <button
            key={f}
            className={`filter-btn${filter === f ? " active" : ""}`}
            onClick={() => handleFilterChange(f)}
            aria-pressed={filter === f}
          >
            {f === "all" ? "All" : f === "character" ? "Characters" : "Words"}
          </button>
        ))}
      </div>
      <CharacterCard character={current} />
      <div className="controls">
        <ControlButtons
          isPlayingRef={isPlayingRef}
          isRecording={isRecording}
          isPlayingUser={isPlayingUser}
          hasRecording={hasRecording}
          recorderSupported={recorderSupported}
          controlsLocked={controlsLocked}
          isAssessing={isAssessing}
          onPlayReference={handlePlayReference}
          onRecordToggle={handleRecordToggle}
          onPlayUserRecording={handlePlayUserRecording}
          onPlayBoth={handlePlayBoth}
          onAssess={handleAssess}
        />
        <NavigationButtons
          canGoBack={canGoBack}
          controlsLocked={controlsLocked}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
      {score && <ScoreDisplay score={score} />}
      <StatusMessage
        isRecording={isRecording}
        recorderSupported={recorderSupported}
        error={error}
      />
    </>
  );
}
