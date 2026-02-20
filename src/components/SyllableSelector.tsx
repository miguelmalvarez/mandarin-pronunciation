import { toneSyllables, type ToneSyllable } from "../data/tones";

interface SyllableSelectorProps {
  selected: ToneSyllable;
  onSelect: (syllable: ToneSyllable) => void;
}

export function SyllableSelector({ selected, onSelect }: SyllableSelectorProps) {
  const handleRandom = () => {
    const others = toneSyllables.filter((s) => s.base !== selected.base);
    const pick = others[Math.floor(Math.random() * others.length)];
    onSelect(pick);
  };

  return (
    <div className="syllable-selector">
      <select
        className="syllable-select"
        value={selected.base}
        onChange={(e) => {
          const found = toneSyllables.find((s) => s.base === e.target.value);
          if (found) onSelect(found);
        }}
        aria-label="Select syllable"
      >
        {toneSyllables.map((s) => (
          <option key={s.base} value={s.base}>
            {s.base}
          </option>
        ))}
      </select>
      <button className="btn secondary" onClick={handleRandom} aria-label="Random syllable">
        Random
      </button>
    </div>
  );
}
