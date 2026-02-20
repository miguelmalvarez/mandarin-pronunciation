import type { ToneVariant } from "../data/tones";
import type { AssessmentScore } from "../types";
import type { ToneScore } from "../hooks/useToneScoring";

interface ToneCardProps {
  variant: ToneVariant;
  isActive: boolean;
  isRecording: boolean;
  recordingUrl: string | null;
  isPlayingRef: boolean;
  isPlayingUser: boolean;
  isAssessing: boolean;
  pronScore: AssessmentScore | null;
  toneScore: ToneScore | null;
  onPlayReference: () => void;
  onRecordToggle: () => void;
  onPlayUserRecording: () => void;
  onAssess: () => void;
}

const toneLabels: Record<number, string> = {
  1: "1st (flat)",
  2: "2nd (rising)",
  3: "3rd (dipping)",
  4: "4th (falling)",
};

function scoreColor(value: number): string {
  if (value >= 80) return "score-green";
  if (value >= 60) return "score-yellow";
  return "score-red";
}

export function ToneCard({
  variant,
  isActive,
  isRecording,
  recordingUrl,
  isPlayingRef,
  isPlayingUser,
  isAssessing,
  pronScore,
  toneScore,
  onPlayReference,
  onRecordToggle,
  onPlayUserRecording,
  onAssess,
}: ToneCardProps) {
  return (
    <div className={`tone-card${isActive ? " tone-active" : ""}`}>
      <div className="tone-indicator">Tone {toneLabels[variant.tone]}</div>
      <div className="tone-hanzi">{variant.hanzi}</div>
      <div className="tone-pinyin">{variant.pinyin}</div>
      <div className="tone-gloss">{variant.gloss}</div>

      {(pronScore || toneScore) && (
        <div className="tone-scores">
          {pronScore && (
            <span className={`tone-score-badge ${scoreColor(pronScore.pronScore)}`}>
              Pron: {Math.round(pronScore.pronScore)}
            </span>
          )}
          {toneScore && (
            <span className={`tone-score-badge ${scoreColor(toneScore.toneScore)}`}>
              Tone: {toneScore.toneScore}
            </span>
          )}
        </div>
      )}

      <div className="tone-controls">
        <button
          className="btn primary btn-sm"
          onClick={onPlayReference}
          disabled={isPlayingRef || isPlayingUser}
          aria-label={`Play tone ${variant.tone} reference`}
        >
          {isPlayingRef ? "..." : "Play"}
        </button>
        <button
          className={`btn secondary btn-sm${isRecording && isActive ? " recording" : ""}`}
          onClick={onRecordToggle}
          aria-label={
            isRecording && isActive
              ? `Stop recording tone ${variant.tone}`
              : `Record tone ${variant.tone}`
          }
        >
          {isRecording && isActive ? "Stop" : "Rec"}
        </button>
        <button
          className="btn btn-sm"
          onClick={onPlayUserRecording}
          disabled={!recordingUrl || isPlayingRef || isPlayingUser}
          aria-label={`Play my recording for tone ${variant.tone}`}
        >
          {isPlayingUser ? "..." : "Mine"}
        </button>
        <button
          className="btn btn-sm"
          onClick={onAssess}
          disabled={!recordingUrl || isAssessing}
          aria-label={`Assess tone ${variant.tone}`}
        >
          {isAssessing ? "..." : "Score"}
        </button>
      </div>
    </div>
  );
}
