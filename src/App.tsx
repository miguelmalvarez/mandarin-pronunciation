import { useEffect, useMemo, useState } from "react";
import { characters } from "./data/characters";
import { useSpeechSynthesis } from "./hooks/useSpeechSynthesis";
import { useRecorder } from "./hooks/useRecorder";
import { CharacterEntry } from "./types";
import { pickRandomCharacter } from "./utils/random";

function App() {
  const [history, setHistory] = useState<CharacterEntry[]>(() => [pickRandomCharacter()]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isPlayingRef, setIsPlayingRef] = useState(false);
  const [isPlayingUser, setIsPlayingUser] = useState(false);
  const [isPlayingBoth, setIsPlayingBoth] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const current = history[historyIndex];

  const { play, stop, supported: ttsSupported } = useSpeechSynthesis({ voiceHintLang: "zh" });
  const { start, stop: stopRecording, isRecording, recordingUrl, error: recordError, supported: recorderSupported, clearRecording } =
    useRecorder();

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
    if (!recordingUrl) return;
    if (controlsLocked) return;
    setError(null);
    try {
      setIsPlayingUser(true);
      const audio = new Audio(recordingUrl);
      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play your recording.");
    } finally {
      setIsPlayingUser(false);
    }
  };

  const handleNextCharacter = () => {
    if (controlsLocked) return;
    stop();
    clearRecording();
    setError(null);
    setHistory((prev) => {
      const base = prev.slice(0, historyIndex + 1);
      return [...base, pickRandomCharacter()];
    });
    setHistoryIndex((prev) => prev + 1);
  };

  const handlePreviousCharacter = () => {
    if (controlsLocked) return;
    if (historyIndex === 0) return;
    stop();
    clearRecording();
    setError(null);
    setHistoryIndex((prev) => Math.max(0, prev - 1));
  };

  const handlePlayBoth = async () => {
    if (!recordingUrl) return;
    if (!ttsSupported) {
      setError("Speech synthesis not supported in this browser.");
      return;
    }
    if (controlsLocked || isPlayingUser) return;
    setError(null);
    setIsPlayingBoth(true);
    try {
      setIsPlayingRef(true);
      await play(current.ttsText ?? current.hanzi);
      setIsPlayingRef(false);
      setIsPlayingUser(true);
      const audio = new Audio(recordingUrl);
      await audio.play();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not play reference and recording.");
    } finally {
      setIsPlayingRef(false);
      setIsPlayingUser(false);
      setIsPlayingBoth(false);
    }
  };

  return (
    <div className="app">
      <div className="header">
        <div>
          <h1 className="title">Mandarin Pronunciation Drill</h1>
          <p className="subtitle">Hear, record, replay. Fast practice for common characters.</p>
        </div>
        {!recorderSupported && <span className="pill">Recording unsupported</span>}
      </div>

      <div className="card">
        <p className="hanzi">{current.hanzi}</p>
        <p className="pinyin">{current.pinyin}</p>
        <p className="gloss">{current.gloss}</p>
      </div>

      <div className="controls">
        <div className="controls-row">
          <button className="btn primary" onClick={handlePlayReference} disabled={controlsLocked}>
            {isPlayingRef ? "Playing..." : "Play reference"}
          </button>
          <button className="btn secondary" onClick={handleRecordToggle} disabled={!recorderSupported || controlsLocked}>
            {isRecording ? "Stop recording" : "Record"}
          </button>
          <button className="btn" onClick={handlePlayUserRecording} disabled={!hasRecording || isPlayingUser || controlsLocked}>
            {isPlayingUser ? "Playing..." : "Play my voice"}
          </button>
          <button className="btn" onClick={handlePlayBoth} disabled={!hasRecording || controlsLocked || isPlayingUser}>
            Play both
          </button>
        </div>
        <div className="controls-row">
          <button className="btn" onClick={handlePreviousCharacter} disabled={historyIndex === 0 || controlsLocked}>
            Previous character
          </button>
          <button className="btn" onClick={handleNextCharacter} disabled={controlsLocked}>
            Next character
          </button>
        </div>
      </div>

      {!recorderSupported && (
        <div className="status error">
          Recording not available in this browser. You can still hear reference audio and move between characters.
        </div>
      )}

      {isRecording && <div className="status">Recording... tap Stop to finish.</div>}

      {error && (
        <div className="status error">
          {error}
          <div className="inline-note">If mic is blocked, allow permission and try again.</div>
        </div>
      )}
    </div>
  );
}

export default App;

