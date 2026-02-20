# Mandarin Pronunciation Drill — Improvement & Deployment Plan

## Context

The app is a Mandarin pronunciation drill SPA (React + Vite + TypeScript). It was refactored from a single `App.tsx` (~200 lines) into a well-structured, tested codebase with deployment config for Vercel.

---

## Phase 1: Project Infrastructure — DONE

- [x] **Add ESLint + Prettier** (project-local only)
  - Installed `eslint` v9, `prettier`, `eslint-config-prettier`, `@eslint/js`, `typescript-eslint` as dev dependencies
  - Created `eslint.config.js` (ESLint v9 flat config format)
  - Created `.prettierrc`
  - Added `lint`, `format`, `test`, `test:watch` scripts to `package.json`

- [x] **Add Vitest + Testing Library** (project-local only)
  - Installed `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`, `@testing-library/user-event`
  - Added test config to `vite.config.ts` (jsdom environment, globals, setup file)
  - Created `src/test/setup.ts` with jest-dom matchers

- [x] **Remove `node_modules/` from git tracking**
  - Was previously committed; removed with `git rm -r --cached node_modules`
  - `.gitignore` already had `node_modules` and `dist`

---

## Phase 2: Component Refactor — DONE

- [x] **Extract `CharacterCard` component** (`src/components/CharacterCard.tsx`)
- [x] **Extract `ControlButtons` component** (`src/components/ControlButtons.tsx`)
- [x] **Extract `NavigationButtons` component** (`src/components/NavigationButtons.tsx`)
- [x] **Extract `StatusMessage` component** (`src/components/StatusMessage.tsx`)
- [x] **Extract `Header` component** (`src/components/Header.tsx`)
- [x] **Create `useCharacterHistory` hook** (`src/hooks/useCharacterHistory.ts`)
- [x] **Create `useAudioPlayback` hook** (`src/hooks/useAudioPlayback.ts`)
- [x] **Slim down `App.tsx`** — now a thin orchestrator wiring hooks to components
- [x] **Move CSS** — `src/index.css` → `src/styles/global.css`

---

## Phase 3: Bug Fixes & UI Polish — DONE

- [x] **Fix `useSpeechSynthesis.ts` voice loading bug**
  - Added `voiceschanged` event listener with proper state; voices now load correctly on Chrome
- [x] **Improve `useRecorder.ts` cleanup**
  - Added `streamRef` for proper track cleanup on unmount
  - Safe `state === "recording"` check before stopping
  - Better error message for `NotAllowedError` (mic permission denied)
- [x] **UI polish**
  - Recording button pulse animation (red + opacity keyframe)
  - Recording status styled distinctly from info status
  - Better mobile responsiveness (breakpoints at 600px and 380px)
- [x] **Accessibility**
  - `aria-label` on all buttons
  - `role="alert"` on error messages, `role="status"` with `aria-live="polite"` on recording indicator
  - `focus-visible` outlines on buttons

---

## Phase 4: Tests — DONE

27 tests across 7 test files, all passing:

- [x] `src/utils/random.test.ts` — returns valid characters, variety over multiple calls
- [x] `src/hooks/useCharacterHistory.test.ts` — init, next, previous, boundary
- [x] `src/hooks/useAudioPlayback.test.ts` — play resolves on end, rejects on error
- [x] `src/components/CharacterCard.test.tsx` — renders hanzi/pinyin/gloss, aria-label
- [x] `src/components/ControlButtons.test.tsx` — button states, disabled logic, click handlers
- [x] `src/components/NavigationButtons.test.tsx` — enabled/disabled, click handlers
- [x] `src/App.test.tsx` — full app render, character display, navigation, button states

---

## Phase 5: Vercel Deployment — DONE

- [x] **Created `vercel.json`** with Vite framework config
- [x] **Build verified** — `npm run build` succeeds cleanly
- [x] **Pushed to GitHub** — `miguelmalvarez/mandarin-pronunciation`
- [ ] **Connect to Vercel** — import repo at [vercel.com/new](https://vercel.com/new), click Deploy

### Post-deploy verification:
- [ ] Open the Vercel URL on desktop and mobile
- [ ] Test: Play reference audio works
- [ ] Test: Microphone permission prompt appears
- [ ] Test: Record and playback works
- [ ] Test: Next/Previous character navigation works

---

## Phase 6: Azure Serverless API Proxies — DONE

- [x] **Create `/api/tts.ts`** — Vercel serverless function proxying Azure Neural TTS
  - `POST /api/tts` with `{ text, voice? }`, returns `audio/mpeg`
  - Default voice: `zh-CN-XiaoxiaoNeural`
  - 24h cache header for repeated requests
- [x] **Create `/api/assess.ts`** — Vercel serverless function proxying Azure Pronunciation Assessment
  - `POST /api/assess?text=你好&lang=zh-CN` with raw WAV body
  - Returns Azure JSON (accuracy, fluency, completeness, pronScore, per-word, per-phoneme)
  - Disable body parsing for raw audio handling
- [ ] **Configure environment variables** in Vercel: `AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`
  - Local dev: create `.env.local` with `AZURE_SPEECH_KEY` and `AZURE_SPEECH_REGION`, run `vercel dev`
  - Vercel proxy in `vite.config.ts` forwards `/api` → `localhost:3000` (vercel dev port)
- [x] **Update `vercel.json`** — add SPA rewrites, functions config

---

## Phase 7: Audio Format Conversion — DONE

- [x] **Create `src/utils/audioConvert.ts`** — client-side WebM → WAV conversion
  - Uses `AudioContext({ sampleRate: 16000 })` + `decodeAudioData`
  - Encodes 16-bit PCM WAV with RIFF header
  - No external dependencies (Web Audio API only)
- [x] **Tests** for WAV encoder (synthetic data, header verification)

---

## Phase 8: Azure Neural TTS Integration — DONE

- [x] **Create `src/hooks/useAzureTts.ts`** — replaces browser `speechSynthesis`
  - Same interface: `{ play(text), stop(), supported }`
  - Fetches from `/api/tts`, plays blob via `Audio` element
  - AbortController for in-flight request cancellation
- [x] **Update `App.tsx`** — swap `useSpeechSynthesis` → `useAzureTts`
- [x] **Add Vite dev proxy** — `/api` → Vercel dev server (`vite.config.ts`)
- [x] **Tests** for the new hook (mocked fetch + Audio)

---

## Phase 9: Pronunciation Scoring — DONE

- [x] **Create `src/hooks/usePronunciationAssessment.ts`**
  - Converts WebM recording to WAV, sends to `/api/assess`
  - Parses Azure response into typed `AssessmentScore` (pronScore, accuracy, fluency, completeness, per-word/phoneme)
- [x] **Create `src/components/ScoreDisplay.tsx`**
  - Large color-coded overall score (green ≥80, yellow ≥60, red <60)
  - Accuracy/fluency/completeness breakdown
  - Per-word phoneme detail
- [x] **Update `ControlButtons.tsx`** — add "Assess" button
- [x] **Wire scoring into main practice page**
- [x] **Tests** for assessment hook and score display

---

## Phase 10: React Router + Tone Practice Page — DONE

- [x] **Add `react-router-dom` v6**
- [x] **Extract `src/pages/PracticePage.tsx`** from current `App.tsx` logic
- [x] **Create `src/components/NavBar.tsx`** — links to Word Practice and Tone Practice
- [x] **Create `src/data/tones.ts`** — tone practice dataset (15 syllables × 4 tones)
- [x] **Create `src/pages/TonePracticePage.tsx`**
  - Syllable selector (dropdown + Random)
  - 2×2 grid of `ToneCard` components
  - Single shared `useRecorder` instance (one mic stream)
  - Azure TTS + pronunciation assessment per card
- [x] **Create `src/components/ToneCard.tsx`** — tone variant display + controls
  - Buttons: Play (ref) / Rec / Mine (play user recording) / Score
  - **Bug fixed:** `Mine` button was always greyed out due to race condition — `activeCard` was set to `null` before `recordingUrl` arrived asynchronously from MediaRecorder. Fixed by using `lastRecordingCardRef` (set on recording start, not cleared on stop) instead of `activeCardRef`.
- [x] **Create `src/components/SyllableSelector.tsx`** — syllable picker
- [x] **Update `src/main.tsx`** — wrap in `BrowserRouter`
- [x] **Update `src/App.tsx`** — thin router shell with `<Routes>`
- [x] **Update `src/styles/global.css`** — navbar, tone grid; removed per-tone accent colors in favour of uniform card style matching Word Practice

---

## Phase 11: Client-Side Pitch Analysis (Tone Scoring) — DONE

- [x] **Create `src/utils/pitchAnalysis.ts`**
  - `extractPitchContour(blobUrl)` — F0 extraction via Web Audio API + autocorrelation
  - `getExpectedContour(tone: 1-4)` — normalized reference contours (flat, rising, dipping, falling)
  - `compareToneContours(actual, expected)` — cosine similarity, returns 0-100
  - Speaker-normalized (relative pitch, not absolute frequency)
- [x] **Create `src/hooks/useToneScoring.ts`**
  - Returns `{ toneScore, detectedContour, expectedContour }`
- [x] **Update `TonePracticePage.tsx`** — runs pronunciation + tone assessment in parallel
- [x] **Update `ToneCard.tsx`** — displays Pron and Tone score badges
- [x] **Tests** with synthetic contour data

Note: Azure Pronunciation Assessment does NOT support prosody/tone scoring for zh-CN (only en-US). This client-side pitch analysis fills that gap specifically for the tone practice section.

---

## Phase 12: Word-Based Practice — DONE

- [x] **Update `src/types.ts`** — added `category?: "character" | "word"` to `CharacterEntry`
- [x] **Update `src/data/characters.ts`** — tagged all entries; added 11 new words (谢谢, 再见, 你好, 中文, 汉字, 电话, 手机, 电脑, 公司, 银行, 超市); total ~108 entries
- [x] **Update `PracticePage.tsx`** — filter toggle (All / Characters / Words) resets history and clears state on change
- [x] **Update `src/hooks/useCharacterHistory.ts`** — accepts `CharacterFilter` param; uses `getPool()` helper; resets via `useEffect` on filter change
- [x] **Update `src/utils/random.ts`** — `pickRandomCharacter(pool?)` accepts optional pool

---

## Future Work

- **Progress tracking** — persist scores over time (localStorage or backend), track mastery per character/tone
- **Spaced repetition** — prioritize weak characters/tones based on score history
- **Offline / PWA** — cache TTS audio, service worker for offline practice
- **Browser TTS fallback** — fall back to `speechSynthesis` when Azure is unavailable
- **Sentence-level practice** — longer utterances, tone sandhi across word boundaries

---

## Verification Checklist (Phases 1-5)

- [x] `npm run lint` — no errors
- [x] `npm run test` — 27 tests pass
- [x] `npm run build` — clean production build

---

## File Structure (Current + Planned)

```
├── api/                                  (NEW — Vercel serverless)
│   ├── tts.ts                            Azure TTS proxy
│   └── assess.ts                         Azure Pronunciation Assessment proxy
src/
├── main.tsx                              (modify: add BrowserRouter)
├── App.tsx                               (modify: router shell)
├── App.test.tsx                          (modify: MemoryRouter, updated mocks)
├── types.ts                              (modify: add category field)
├── data/
│   ├── characters.ts                     (modify: add category tags, more words)
│   └── tones.ts                          (NEW — tone syllable dataset)
├── styles/global.css                     (modify: navbar, tone grid, scores)
├── test/setup.ts
├── pages/                                (NEW directory)
│   ├── PracticePage.tsx                  Extracted from App.tsx
│   └── TonePracticePage.tsx              Tone practice page
├── components/
│   ├── CharacterCard.tsx
│   ├── ControlButtons.tsx                (modify: add Assess button)
│   ├── NavigationButtons.tsx
│   ├── StatusMessage.tsx
│   ├── Header.tsx
│   ├── NavBar.tsx                        (NEW)
│   ├── ScoreDisplay.tsx                  (NEW)
│   ├── ToneCard.tsx                      (NEW)
│   └── SyllableSelector.tsx              (NEW)
├── hooks/
│   ├── useRecorder.ts
│   ├── useSpeechSynthesis.ts             (kept as fallback reference)
│   ├── useAzureTts.ts                    (NEW — Azure TTS)
│   ├── usePronunciationAssessment.ts     (NEW — scoring)
│   ├── useToneScoring.ts                 (NEW — pitch analysis)
│   ├── useCharacterHistory.ts
│   └── useAudioPlayback.ts
└── utils/
    ├── random.ts
    ├── audioConvert.ts                   (NEW — WebM→WAV)
    └── pitchAnalysis.ts                  (NEW — F0 extraction)
```
