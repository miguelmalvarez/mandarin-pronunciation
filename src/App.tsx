import { useEffect, useMemo, useState } from "react";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import { useRecorder } from "./hooks/useRecorder";
import { useCharacterHistory } from "./hooks/useCharacterHistory";
import { useAudioPlayback } from "./hooks/useAudioPlayback";
import { Header } from "./components/Header";
import { CharacterCard } from "./components/CharacterCard";
import { ControlButtons } from "./components/ControlButtons";
import { NavigationButtons } from "./components/NavigationButtons";
import { StatusMessage } from "./components/StatusMessage";

function App() {
  const { current, canGoBack, next, previous } = useCharacterHistory();
  const { play, stop, supported: ttsSupported } = useSpeechSynthesis({ voiceHintLang: "zh" });
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

  const [isPlayingRef, setIsPlayingRef] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [isPlayingBoth, setIsPlayingBoth] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (recordError) setError(recordError);
  }, [recordError]);

  const hasRecording = useMemo(() => !!recordingUrl, [recordingUrl]);
  const controlsLocked = isPlayingRef || isPlayingBoth;

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

  const handleNext = () => {
    if (controlsLocked) return;
    stop();
    clearRecording();
    setError(null);
    next();
  };

  const handlePrevious = () => {
    if (controlsLocked) return;
    stop();
    clearRecording();
    setError(null);
    previous();
  };

  return (
    <div className="app">
      <Header recorderSupported={recorderSupported} />
      <CharacterCard character={current} />
      <div className="controls">
        <ControlButtons
          isPlayingRef={isPlayingRef}
          isRecording={isRecording}
          isPlayingUser={isPlayingUser}
          hasRecording={hasRecording}
          recorderSupported={recorderSupported}
          controlsLocked={controlsLocked}
          onPlayReference={handlePlayReference}
          onRecordToggle={handleRecordToggle}
          onPlayUserRecording={handlePlayUserRecording}
          onPlayBoth={handlePlayBoth}
        />
        <NavigationButtons
          canGoBack={canGoBack}
          controlsLocked={controlsLocked}
          onPrevious={handlePrevious}
          onNext={handleNext}
        />
      </div>
      <StatusMessage
        isRecording={isRecording}
        recorderSupported={recorderSupported}
        error={error}
      />
    </div>
  );
}

export default App;
