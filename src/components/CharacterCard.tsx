import { CharacterEntry } from "../types";

interface CharacterCardProps {
  character: CharacterEntry;
}

export function CharacterCard({ character }: CharacterCardProps) {
  return (
    <div className="card" aria-label={`Character: ${character.hanzi}`}>
      <p className="hanzi">{character.hanzi}</p>
      <p className="pinyin">{character.pinyin}</p>
      <p className="gloss">{character.gloss}</p>
    </div>
  );
}
