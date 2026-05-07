# learn-dutch-game — Claude Instructions

## Project overview

Dutch language learning game app for a student at CVO Groeipunt, niveau 2.4 schriftelijk.
Built with React 18 + TypeScript + Vite, no UI library, pure CSS, localStorage persistence.

The student has memory retention challenges. Pedagogy is built around spaced repetition (SM-2),
immediate feedback, chunked vocabulary, context sentences, and gamification (XP + streaks).

## Tech stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Pure CSS (src/index.css) — mobile-first, max-width 480px, CSS variables
- **Persistence**: localStorage (`dutch-game-progress` key)
- **Algorithm**: SM-2 spaced repetition (src/lib/srs.ts)
- **Routing**: View-state union in App.tsx (no router library)

## Architecture

```
src/
  types.ts              — all TypeScript interfaces and union types
  lib/
    srs.ts              — SM-2 algorithm (createCard, updateCard, isDue, getDueCards)
    storage.ts          — localStorage load/save/reset
  data/
    les1.ts             — Les 1 data (vocabulary + grammar + exercises)
    les2.ts             — Les 2 data
    les5.ts             — Les 5 data
    conjuncties.ts      — Extra: conjuncties module
    index.ts            — ALL_LESSONS array, getLessonById, getAllVocabulary, getAllExercises
  hooks/
    useProgress.ts      — React hook: rateCard, getDueReviewCards, initCardsForLesson, etc.
  components/
    games/
      FlashCard.tsx     — 3D CSS flip card with 4 SRS rating buttons
      MultipleChoice.tsx — 4-option grid with immediate color feedback
      FillInBlank.tsx   — Text input with hint, case-insensitive checking
      MatchingGame.tsx  — Two-column tap-to-match with shake on error
    screens/
      Dashboard.tsx     — Streak/XP badges, review card, lesson list
      LessonView.tsx    — Tabs: Concepten / Woordenschat / Oefenen
      GameSession.tsx   — Game runner with progress bar + results screen
      ReviewSession.tsx — SRS review runner
  App.tsx               — Top-level view router
  index.css             — Complete design system
```

## How to add a new lesson

1. Create `src/data/lesN.ts` following the pattern in `les1.ts`:
   - Export a `Lesson` object with `id`, `number`, `dateDisplay`, `theme`, `topics[]`
   - Add `vocabulary: VocabularyItem[]` — Dutch word, Spanish translation, example sentence
   - Add `grammar: GrammarRule[]` — title, explanation, rule summary, examples
   - Add `exercises: Exercise[]` — mix of `multiple-choice`, `fill-in-blank`, `matching`

2. Import and add to `ALL_LESSONS` in `src/data/index.ts`.

That's it — the Dashboard, LessonView, GameSession, and ReviewSession all pick it up automatically.

## Lesson data format

```typescript
// VocabularyItem
{ id: 'l1-word', dutch: 'de uitstap', translation: 'la excursión',
  example: 'We maken een uitstap naar Brugge.',
  exampleTranslation: 'Hacemos una excursión a Brujas.',
  category: 'zelfstandig naamwoord' }

// GrammarRule
{ id: 'l1-er-subject', title: "'er' als onderwerp",
  explanation: "...", rule: "'Er' + werkwoord + onderwerp",
  examples: [{ dutch: 'Er zijn veel mensen.', translation: 'Hay mucha gente.', highlight: 'er' }] }

// MultipleChoiceExercise
{ id: 'l1-mc1', type: 'multiple-choice',
  question: 'Wat betekent "de uitstap"?',
  options: ['la fiesta', 'la excursión', 'el descanso', 'la reunión'],
  correct: 1, explanation: '...' }

// FillInBlankExercise
{ id: 'l1-fib1', type: 'fill-in-blank',
  sentence: 'Er ___ veel mensen in het park.', answer: 'zijn',
  hint: 'vorm van "zijn"' }

// MatchingExercise
{ id: 'l1-match1', type: 'matching',
  pairs: [{ left: 'de uitstap', right: 'la excursión' }, ...] }
```

## SRS rating scale

| Button | Rating | SM-2 quality |
|--------|--------|--------------|
| Weet ik niet | 1 | 0 |
| Moeilijk | 2 | 2 |
| Goed | 3 | 4 |
| Makkelijk | 4 | 5 |

Cards rated 1-2 reset interval to 1 day. Cards rated 3-4 follow SM-2 EF progression.

## Gamification

- **XP**: +10 per correct answer
- **Streak**: increments daily when any session is completed (`updateStreak` checks date)
- Progress persisted in localStorage — `resetProgress()` in storage.ts clears everything

## Design system (CSS variables)

```css
--primary: #2d9cdb     /* blue — buttons, progress bar */
--success: #27ae60     /* green — correct answers */
--warning: #f2994a     /* orange — mediocre score */
--danger: #eb5757      /* red — wrong answers */
--bg: #f0f4f8          /* light grey background */
--card-bg: #ffffff
--text: #2d3748
--text-muted: #718096
```

## Commands

```bash
npm run dev      # start dev server
npm run build    # production build
npm run preview  # preview production build
```

## Lessons covered so far

| File | Les | Datum | Thema |
|------|-----|-------|-------|
| les1.ts | 1 | 05/02 | Activiteiten & uitstappen |
| les2.ts | 2 | 12/02 | Tijden & werkwoordvormen |
| les5.ts | 5 | 12/03 | Klachten & communicatie |
| conjuncties.ts | Extra | — | Ondergeschikte conjuncties |

## Pedagogy notes (for future lessons)

- Always include a Spanish translation for every vocabulary item
- Include at least one example sentence per word
- Grammar rules need: explanation (why) + rule (formula) + 2-3 examples with highlights
- Exercises should progress: recognition (MC) → production (fill-in) → connections (matching)
- Aim for 10-15 vocab items and 4-6 exercises per lesson
- Chunk vocabulary by semantic category (e.g., klachten / communicatie / emoties)
- For memory retention: vary game types, repeat core items across lessons when relevant
