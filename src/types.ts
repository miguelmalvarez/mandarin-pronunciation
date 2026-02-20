export interface CharacterEntry {
  hanzi: string;
  pinyin: string;
  gloss: string;
  ttsText?: string;
  category?: "character" | "word";
}

export interface AssessmentScore {
  pronScore: number;
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  words: {
    word: string;
    accuracyScore: number;
    errorType: string;
    phonemes: { phoneme: string; accuracyScore: number }[];
  }[];
}

