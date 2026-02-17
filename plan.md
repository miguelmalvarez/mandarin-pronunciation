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

## Verification Checklist (all passing)

- [x] `npm run lint` — no errors
- [x] `npm run test` — 27 tests pass
- [x] `npm run build` — clean production build

---

## File Structure

```
src/
├── main.tsx
├── App.tsx                           (thin orchestrator)
├── App.test.tsx
├── types.ts
├── data/characters.ts
├── styles/global.css
├── test/setup.ts
├── components/
│   ├── CharacterCard.tsx
│   ├── CharacterCard.test.tsx
│   ├── ControlButtons.tsx
│   ├── ControlButtons.test.tsx
│   ├── NavigationButtons.tsx
│   ├── NavigationButtons.test.tsx
│   ├── StatusMessage.tsx
│   └── Header.tsx
├── hooks/
│   ├── useRecorder.ts
│   ├── useSpeechSynthesis.ts
│   ├── useCharacterHistory.ts
│   ├── useCharacterHistory.test.ts
│   ├── useAudioPlayback.ts
│   └── useAudioPlayback.test.ts
└── utils/
    ├── random.ts
    └── random.test.ts
```
