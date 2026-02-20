# Mandarin Pronunciation Drill — Architecture

## Overview

- React + Vite + TypeScript SPA with Vercel serverless backend.
- Two pages: **Word Practice** (main) and **Tone Practice** (dedicated tone drilling).
- Data: local datasets for words (~100 entries) and tone syllables (~15-20 syllables × 4 tones).
- Reference audio: **Azure Neural TTS** (`zh-CN-XiaoxiaoNeural`) via serverless proxy.
- Recording: `MediaRecorder` (WebM blobs, converted to WAV for assessment).
- Scoring: **Azure Pronunciation Assessment** (phoneme-level accuracy) + **client-side pitch analysis** (tone contour scoring).
- No user accounts or persistence (future work).

## System Diagram

```mermaid
flowchart TD
    subgraph Client [Browser — React SPA]
        UI[Pages & Components]
        REC[useRecorder — MediaRecorder]
        TTS[useAzureTts]
        ASSESS[usePronunciationAssessment]
        TONE[useToneScoring — pitch analysis]
        CONV[audioConvert — WebM→WAV]
    end

    subgraph Vercel [Vercel Serverless]
        API_TTS[/api/tts]
        API_ASSESS[/api/assess]
    end

    subgraph Azure [Azure Speech Services]
        AZ_TTS[Neural TTS — zh-CN]
        AZ_PA[Pronunciation Assessment]
    end

    UI -->|Play reference| TTS
    TTS -->|POST text| API_TTS
    API_TTS -->|SSML| AZ_TTS
    AZ_TTS -->|audio/mpeg| API_TTS
    API_TTS -->|audio blob| TTS

    UI -->|Record/Stop| REC
    REC -->|WebM blob URL| UI

    UI -->|Assess| ASSESS
    ASSESS -->|blob URL| CONV
    CONV -->|WAV ArrayBuffer| ASSESS
    ASSESS -->|POST WAV| API_ASSESS
    API_ASSESS -->|audio + config| AZ_PA
    AZ_PA -->|JSON scores| API_ASSESS
    API_ASSESS -->|AssessmentScore| ASSESS

    UI -->|Tone score| TONE
    TONE -->|F0 contour via Web Audio API| TONE

    UI -->|Next| DATA[Word & Tone datasets]
    DATA -->|Random pick| UI
```

## Pages & Routing

```
BrowserRouter
├── /              → PracticePage    (word/character practice + scoring)
└── /tones         → TonePracticePage (4-tone drilling per syllable)
```

Both pages share: `NavBar`, `useAzureTts`, `useRecorder`, `usePronunciationAssessment`.

## Component Tree

```
App (router shell)
├── NavBar (Word Practice | Tone Practice)
├── PracticePage
│   ├── Header
│   ├── CharacterCard (hanzi / pinyin / gloss)
│   ├── ControlButtons (play ref / record / play mine / play both / assess)
│   ├── ScoreDisplay (overall + per-phoneme breakdown)
│   ├── NavigationButtons (prev / next)
│   └── StatusMessage (errors / recording indicator)
└── TonePracticePage
    ├── SyllableSelector (dropdown + Random)
    └── ToneCard × 4 (2×2 grid)
        ├── Tone indicator + hanzi + pinyin + gloss
        ├── Play reference / Record / Assess buttons
        ├── Pronunciation score (Azure)
        └── Tone score + contour visualization (pitch analysis)
```

## Modules

### Pages
- `src/pages/PracticePage.tsx` — main word/character practice (extracted from original App.tsx)
- `src/pages/TonePracticePage.tsx` — tone drilling with 4 cards per syllable

### Hooks
- `src/hooks/useAzureTts.ts` — fetches audio from `/api/tts`, plays via `Audio` element. Interface: `{ play(text), stop(), supported }`.
- `src/hooks/useRecorder.ts` — mic permission, `MediaRecorder`, blob URL creation. Produces `audio/webm` blobs.
- `src/hooks/useAudioPlayback.ts` — plays blob URLs via `Audio` element.
- `src/hooks/useCharacterHistory.ts` — character navigation with back/forward history.
- `src/hooks/usePronunciationAssessment.ts` — converts WebM→WAV, calls `/api/assess`, parses `AssessmentScore`.
- `src/hooks/useToneScoring.ts` — extracts F0 pitch contour, compares against expected tone shape, returns `ToneScore`.
- `src/hooks/useSpeechSynthesis.ts` — (legacy, kept as offline fallback reference) browser `speechSynthesis` wrapper.

### Utilities
- `src/utils/random.ts` — random-with-replacement character picker.
- `src/utils/audioConvert.ts` — converts WebM blob to 16kHz 16-bit mono PCM WAV using `AudioContext.decodeAudioData`. No external dependencies.
- `src/utils/pitchAnalysis.ts` — F0 extraction (autocorrelation via `AnalyserNode`), expected tone contours, DTW/cosine similarity comparison. Speaker-normalized (relative pitch).

### Data
- `src/data/characters.ts` — ~100 entries: `{ hanzi, pinyin, gloss, ttsText?, category? }`.
- `src/data/tones.ts` — ~15-20 syllables, each with 4 tonal variants: `{ tone: 1-4, pinyin, hanzi, gloss, ttsText }`.

### Serverless API
- `api/tts.ts` — POST proxy to Azure Neural TTS. Accepts `{ text, voice? }`, returns `audio/mpeg`. Caches responses 24h.
- `api/assess.ts` — POST proxy to Azure Pronunciation Assessment. Accepts raw WAV body + `?text=&lang=zh-CN`. Returns Azure JSON with per-phoneme scores.

## Key Types

```typescript
// Word/character entry
interface CharacterEntry {
  hanzi: string;
  pinyin: string;
  gloss: string;
  ttsText?: string;
  category?: "character" | "word";
}

// Tone practice entry
interface ToneSyllable {
  base: string;          // e.g. "ma"
  variants: [ToneVariant, ToneVariant, ToneVariant, ToneVariant];
}
interface ToneVariant {
  tone: 1 | 2 | 3 | 4;
  pinyin: string;        // e.g. "mā"
  hanzi: string;         // e.g. "妈"
  gloss: string;
  ttsText: string;
}

// Azure pronunciation assessment result (parsed)
interface AssessmentScore {
  pronScore: number;          // overall 0-100
  accuracyScore: number;
  fluencyScore: number;
  completenessScore: number;
  words: {
    word: string;
    accuracyScore: number;
    errorType: string;        // "None" | "Mispronunciation" | "Omission" | ...
    phonemes: { phoneme: string; accuracyScore: number }[];
  }[];
}

// Client-side tone analysis result
interface ToneScore {
  toneScore: number;            // 0-100
  detectedContour: number[];    // F0 over time (normalized)
  expectedContour: number[];    // reference tone shape
}
```

## Key States

### PracticePage
- `current`: current `CharacterEntry`
- `recordingUrl`: latest user recording (WebM blob URL)
- Flags: `isRecording`, `isPlayingRef`, `isPlayingUser`, `isPlayingBoth`
- `score`: `AssessmentScore | null`
- `isAssessing`: boolean
- `error`: inline user-facing message

### TonePracticePage
- `selectedSyllable`: current `ToneSyllable`
- `activeCard`: which tone (1-4) is being recorded (one mic stream shared)
- `cardRecordings`: `Record<number, string>` — blob URLs per tone card
- `cardScores`: `Record<number, AssessmentScore>` — Azure scores per card
- `toneScores`: `Record<number, ToneScore>` — pitch analysis scores per card

## Scoring Architecture

Two complementary scoring systems:

1. **Azure Pronunciation Assessment** — phoneme-level accuracy (consonants, vowels). Available on both pages. Requires server round-trip (record → convert WebM→WAV → POST to `/api/assess` → parse response).

2. **Client-side Pitch Analysis** — tone contour scoring. Used only on the Tone Practice page. Runs entirely in-browser (no network). Extracts F0 via Web Audio API autocorrelation, normalizes to relative pitch, compares against reference contour using DTW.

**Why two systems:** Azure Pronunciation Assessment does NOT support prosody/tone scoring for `zh-CN` (only `en-US` gets prosody). The phoneme accuracy score tells you if consonants/vowels are correct but cannot distinguish tone 2 from tone 4. Client-side pitch analysis fills this gap.

## Error & Fallback Handling

- Azure TTS failure: inline error, user can retry
- Azure Assessment failure: inline error, score not shown
- Recording unsupported: inline notice; reference playback + navigation still work
- Mic denied: inline error with recovery guidance
- Network offline: both Azure features degrade; pitch analysis still works (client-side)
- Autoplay: all playback initiated via user gesture

## Environment Variables

Set in Vercel dashboard (never committed):
- `AZURE_SPEECH_KEY` — Azure Cognitive Services subscription key
- `AZURE_SPEECH_REGION` — e.g. `eastus`

Local development: use `vercel dev` or Vite proxy to forward `/api` requests.

## Future Work

- Progress tracking / score persistence (localStorage or backend)
- Spaced repetition based on score history
- Offline / PWA mode with cached TTS audio
- Browser `speechSynthesis` fallback when Azure is unavailable
- Sentence-level practice with tone sandhi
