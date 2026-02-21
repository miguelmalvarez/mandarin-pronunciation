import type { AssessmentScore } from "../types";

interface ScoreDisplayProps {
  score: AssessmentScore;
  approximate?: boolean;
}

function scoreColor(value: number): string {
  if (value >= 80) return "score-green";
  if (value >= 60) return "score-yellow";
  return "score-red";
}

export function ScoreDisplay({ score, approximate }: ScoreDisplayProps) {
  return (
    <div className="score-display">
      {approximate && (
        <p className="score-approximate-note">Approximate score (browser recognition)</p>
      )}
      <div className={`score-overall ${scoreColor(score.pronScore)}`}>
        <span className="score-value">{Math.round(score.pronScore)}</span>
        <span className="score-label">Overall</span>
      </div>
      {!approximate && (
        <div className="score-breakdown">
          <ScoreItem label="Accuracy" value={score.accuracyScore} />
          <ScoreItem label="Fluency" value={score.fluencyScore} />
          <ScoreItem label="Completeness" value={score.completenessScore} />
        </div>
      )}
      {score.words.length > 0 && (
        <div className="score-words">
          {score.words.map((w, i) => (
            <div key={i} className="score-word">
              <span className="score-word-text">{w.word}</span>
              {w.errorType !== "None" && (
                <span className="score-word-error">{w.errorType}</span>
              )}
              {!approximate && w.phonemes.length > 0 && (
                <div className="score-phonemes">
                  {w.phonemes.map((p, j) => (
                    <span key={j} className={`score-phoneme ${scoreColor(p.accuracyScore)}`}>
                      {p.phoneme}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ScoreItem({ label, value }: { label: string; value: number }) {
  return (
    <div className="score-item">
      <span className="score-item-label">{label}</span>
      <span className={`score-item-value ${scoreColor(value)}`}>{Math.round(value)}</span>
    </div>
  );
}
