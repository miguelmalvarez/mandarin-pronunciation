# Mandarin Pronunciation Drill — Architecture

## Overview
- React + Vite SPA, all client-side.
- Data: local list of ~100 characters (`hanzi`, `pinyin`, `gloss`, optional `ttsText`).
- Audio: reference via `speechSynthesis`; recording via `MediaRecorder`; blobs held in-memory only.
- No backend; only external dependency is browser APIs (TTS/mic).

## Component & Flow Diagram
```mermaid
flowchart TD
    UI[App / Controls] -->|Play reference| TTS[TTS Provider (speechSynthesis)]
    UI -->|Record/Stop| REC[Recorder (MediaRecorder)]
    UI -->|Play my voice| Audio[Audio element]
    UI -->|Next| Data[Character list (~100)]
    REC -->|Blob URL| UI
    Data -->|Random pick| UI
```

## Modules
- `src/App.tsx`: orchestrates state, actions (play ref, record/stop, play user, next).
- `src/hooks/useSpeechSynthesis.ts`: voice selection (pref zh-*), play/stop, error propagation.
- `src/hooks/useRecorder.ts`: support check, mic permission, start/stop, blob URL creation, cleanup.
- `src/data/characters.ts`: static dataset (hanzi/pinyin/gloss/ttsText).
- `src/utils/random.ts`: simple random-with-replacement picker.

## Key States
- `current`: current `CharacterEntry`.
- `recordingUrl`: latest user recording (Blob URL).
- Flags: `isRecording`, `isPlayingRef`, `isPlayingUser`.
- `error`: inline user-facing message.

## Error & Fallback Handling
- TTS unsupported or failure: inline error, retry via button.
- Recording unsupported: inline notice; reference playback + navigation still work.
- Mic denied: inline error; user can retry after granting permission.
- Autoplay: reference playback initiated via user click to satisfy gesture requirements.

## Open Choices (future)
- Swap TTS provider (Azure/Google/Polly) behind same `play(text)` API.
- Add PWA/offline cache for data and UI shell.
- Persist recordings (local-first or backend) if/when required.
```

