# Mandarin Pronunciation Drill (React + Vite)

Single-page React app for quick Mandarin pronunciation drills: show a random common character, play reference audio via `speechSynthesis`, record with `MediaRecorder`, replay your attempt, and fetch another character.

## Getting Started

1) Install Node.js 18+ (npm or pnpm available).  
2) From main folder   
   - `npm install`  
   - `npm run dev`  
   - `npm run build` for a production bundle

## Key Decisions

- Pure client-side SPA; no backend required.  
- TTS via browser `speechSynthesis`, with a Mandarin voice if available; pluggable provider interface.  
- Recording via `MediaRecorder`; ephemeral blobs in-memory only.  
- Character data local with hanzi, pinyin, gloss.

## Compatibility``

- Requires HTTPS for mic access in production.  
- Needs browsers with `MediaRecorder`, `AudioContext`, and `speechSynthesis`.  

## Structure

- `src/App.tsx` — main UI and flows  
- `src/hooks/useSpeechSynthesis.ts` — TTS wrapper  
- `src/hooks/useRecorder.ts` — recording wrapper  
- `src/data/characters.ts` — character dataset  
- `src/utils/random.ts` — random selection helper  
- `src/index.css` — styling

## Vibe Code Alert
This project was 99% vibe coded to learn more JS.
