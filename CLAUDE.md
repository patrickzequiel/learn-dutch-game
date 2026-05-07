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
  - Views: `dashboard` | `lesson` | `game` | `game-custom` | `review`
  - `game-custom` carries a synthetic `Lesson` object (Mix / Weak words) instead of a lessonId

## Architecture

```
src/
  types.ts              — all TypeScript interfaces and union types
  lib/
    srs.ts              — SM-2 algorithm (createCard, updateCard, isDue, getDueCards)
    storage.ts          — localStorage load/save/reset
  data/
    les1.json           — Les 1 data (JSON)
    les2.json           — Les 2 data (JSON)
    les3.json           — Les 3 data (JSON)
    les4.json           — Les 4 data (JSON)
    les5.json           — Les 5 data (JSON)
    les6.json           — Les 6 data (JSON)
    les7.json           — Les 7 data (JSON)
    les8.json           — Les 8 data (JSON)
    les9.json           — Les 9 data (JSON)
    les10.json          — Les 10 data (JSON)
    les11.json          — Les 11 data (JSON)
    conjuncties.json    — Extra: conjuncties module (JSON)
    index.ts            — imports all JSON files → exports ALL_LESSONS, getLessonById,
                          getAllVocabulary, getAllGrammar, getAllExercises
    les1.ts             — LEGACY (superseded by les1.json, keep for reference)
    les2.ts             — LEGACY
    les5.ts             — LEGACY
    conjuncties.ts      — LEGACY
  hooks/
    useProgress.ts      — React hook: rateCard, getDueReviewCards, getCardForItem,
                          initCardsForLesson, completeLesson, updateStreak, getWeakVocabItems
  components/
    games/
      FlashCard.tsx     — 3D CSS flip card with 4 SRS rating buttons + 🔊 audio
      MultipleChoice.tsx — 4-option grid with immediate color feedback
      FillInBlank.tsx   — Text input with hint, case-insensitive checking
      MatchingGame.tsx  — Two-column tap-to-match with shake on error
      ProductionCard.tsx — Type-the-translation challenge (adaptive, repetitions ≥ 3)
      WordOrder.tsx     — Tap-to-assemble scrambled sentence chips
    screens/
      Dashboard.tsx     — Streak/XP badges, review card, lesson list
      LessonView.tsx    — Tabs: Concepten / Woordenschat / Oefenen
      GameSession.tsx   — Game runner with progress bar + results screen
      ReviewSession.tsx — SRS review runner
  App.tsx               — Top-level view router
  index.css             — Complete design system
```

## How to add a new lesson

1. Create `src/data/lesN.json` — a plain JSON object (NOT an array) with the lesson data:
   - Top-level fields: `id`, `number`, `date` (ISO), `dateDisplay`, `theme`, `topics[]`
   - Optional: `subtheme`
   - `vocabulary: VocabularyItem[]`
   - `grammar: GrammarRule[]`
   - `exercises: Exercise[]`

2. In `src/data/index.ts`, add:
   ```ts
   import lesN from './lesN.json';
   ```
   and add `lesN as unknown as Lesson` to the `ALL_LESSONS` array.

That's it — Dashboard, LessonView, GameSession, ReviewSession all pick it up automatically.

## Lesson data format (ACTUAL field names — do not use the old CLAUDE.md version)

```json
// VocabularyItem
{
  "id": "v-uitstap", "dutch": "de uitstap", "translation": "la excursión / a day trip",
  "example": "We maken een uitstap naar Brugge.",
  "exampleTranslation": "Hacemos una excursión a Brujas.",
  "category": "uitstap", "lessonId": "les1"
}

// GrammarRule — category must be: "grammar" | "spelling" | "conjunctie" | "tense" | "preposition"
{
  "id": "g-er-subject", "title": "'Er' als subject",
  "explanation": "...", "rule": "'Er' + werkwoord + niet-specifiek subject",
  "examples": [{ "dutch": "Er zijn veel mensen.", "translation": "Hay mucha gente.", "highlight": "Er" }],
  "lessonId": "les1", "category": "grammar"
}

// MultipleChoiceExercise — answer is a STRING matching one of options (NOT an index)
{
  "id": "e1-mc1", "type": "multiple-choice",
  "question": "Wat betekent 'slenteren'?",
  "options": ["verdwalen", "slenteren", "ontdekken", "bewonderen"],
  "answer": "slenteren",
  "explanation": "Slenteren = traag wandelen.",
  "lessonId": "les1"
}

// FillInBlankExercise — field is "blank" not "answer"
{
  "id": "e1-fib1", "type": "fill-in-blank",
  "sentence": "___ ligt een boek op de tafel.",
  "blank": "Er",
  "hint": "Gebruik 'er' voor een niet-specifiek subject.",
  "explanation": "Met 'een boek' begin je de zin met 'Er'.",
  "lessonId": "les1"
}

// MatchingExercise — only id, type, pairs, lessonId (no question/answer fields)
{
  "id": "e1-matching", "type": "matching",
  "pairs": [{ "left": "slenteren", "right": "traag wandelen" }],
  "lessonId": "les1"
}
```

## JSON import in index.ts

```ts
import type { Lesson } from '../types';
import les1 from './les1.json';
// ... all other imports
export const ALL_LESSONS: Lesson[] = [
  les1 as unknown as Lesson,
  // ...
];
```

`tsconfig.app.json` has `"resolveJsonModule": true` — JSON imports work out of the box.

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

## Lessons — all files (JSON)

| File | Les | Datum | Thema | Status |
|------|-----|-------|-------|--------|
| les1.json | 1 | 05/02 | Activiteiten & uitstappen / 'er' als subject | done |
| les2.json | 2 | 12/02 | Tijden: perfectum/imperfectum, adjectief flexie | done |
| les3.json | 3 | 26/02 | Reizen: hou van vs ervan om te, het/er als plaatsverwijzer | done |
| les4.json | 4 | 05/03 | Plusquamperfectum, aan het (tegelijkertijd) | done |
| les5.json | 5 | 12/03 | Klachten & communicatie, plusquamperfectum | done |
| conjuncties.json | Extra | — | Ondergeschikte conjuncties (omdat/doordat/terwijl/nadat/zodra/zolang) | done |
| les6.json | 6 | 09/10 | Kinderen opvoeden: laten/mogen/moeten, als/tenzij, te laat advies | done |
| les7.json | 7 | 16/10 | Opvoedingstips & contrast (hoewel/ondanks/ook al/maar toch) | done |
| les8.json | 8 | 02/04 | Samengestelde zinnen (zodat/zolang/voordat/zodra), er als verwijswoord | done |
| les9.json | 9 | 23/04 | 'er' verwijswoord + reflexief (ermee/erover/erop), oud worden | done |
| les10.json | 10 | 30/04 | Relatieve pronomina (die/aan wie/naar wie), dankzij | done |
| les11.json | 11 | 07/05 | Natuur & milieu: relatieve bijzinnen met preposities (waar+prep / prep+wie), 'er' als verwijswoord | done |

## PDF content summaries (for context recovery)

PDFs are in `docs/les/`. All have been read and converted to JSON lesson files.

### Les 3 — 26 februari (Reizen & Toerisme)
Grammar: (1) "ik hou van" + substantief/werkwoord vs "ik hou ervan om te + infinitief"; (2) verwijzen naar een plaats: het = de stad als object/subject, er = in/naar die stad. NOOIT 'er' op positie 1 → gebruik 'daar'.
Vocab: verkiezen, avontuurlijk, sportief, pittoresk, cultuurliefhebber, trektocht, strandvakantie, avontuur, citytrip, ontspanning, frisse lucht, plezier beleven aan.

### Les 4 — 5 maart (Verhalen Vertellen)
Grammar: (1) Plusquamperfectum = had/hadden + VD (niet-beweging) of was/waren + VD (beweging/verandering), gebruikt voor iets vóór een andere verleden handeling; (2) imperfectum + "aan het" + infinitief = tegelijkertijd; imperfectum + plusquamperfectum = 2 stappen terug.
Vocab: overslapen, wekker, identiteitskaart, rijbewijs, inchecken, uitleggen, vergeten, controleren, aankomen, vertrekken.
Story: Karim miste de trein (had wekker niet gezet, had zich overslapen); Sara kon niet inchecken (had identiteitskaart thuis laten liggen).

### Les 6 — 9 oktober (Kinderen Opvoeden: Vrijheid & Regels)
Grammar: (1) laten + infinitief (Ik laat hem gaan / niet gaan); mag/mag niet/moet + infinitief; (2) als vs tenzij: als = in die situatie + bijzin; tenzij = als...NIET + bijzin; (3) te laat advies/kritiek: had (niet) + moeten/mogen + infinitief2 (Je had niet zo veel snoep mogen eten / Ze had meer moeten studeren).
Vocab: opvoeden, opgroeien, vrijheid, verantwoordelijk, toelaten, verbieden, straffen, straf, berispen, voorzichtig, tenzij.

### Les 7 — 16 oktober (Opvoedingstips & Contrast)
Grammar: (1) Contrast signaalwoorden: HOEWEL + bijzin; OOK AL + bijzin/inversie; ONDANKS + substantief; (MAAR) TOCH + inversie; MAAR + hoofdzin; NOCHTANS (formeel); (2) Opvoedingstips-formuleringen: "Let erop dat...", "Het is belangrijk dat...", "Kinderen zouden moeten leren om...te", "Laat je kinderen...nadat...".
Vocab: opvoedingstip, zelfstandig, conflictsituatie, verantwoordelijkheden, quality time, slaan (sloeg/geslagen), vechten (vocht/gevochten), berispen, respecteren, vroeger, dienstgericht.

### Les 8 — 2 april (Samengestelde Zinnen & Zorgen voor Elkaar)
Grammar: (1) Conjuncties voor doel/tijd: omdat=reden, zodat=doel (so that), zolang=tijdens die periode, voordat=voor iets, zodra=direct daarna; (2) 'er' als verwijswoord: Subject + Verbum + er + rest + prepositie (om iets te zeggen OVER een eerder genoemde zaak: "Ik wil er iets over zeggen." / er+met=ermee).
Contrast (herhaling): HOEWEL, OOK AL, ONDANKS, (MAAR) TOCH, NOCHTANS — review from les7.
Vocab: aandacht geven aan, knuffel geven, versterken, de band, iemand prijzen, zich gedragen, de regels volgen, nochtans, woonzorgcentrum.

### Les 9 — 23 april ('er' als Verwijswoord + Oud Worden)
Grammar: (1) 'er' + reflexief werkwoord + prepositie: "zich voorbereiden op" → "ik bereid me er al op voor" (S + V + reflexief + er + rest + prepositie + prefix); "zich zorgen maken over" → "ik maak me er zorgen over"; (2) er + prepositie combos: er+voor=ervoor, er+mee=ermee, er+over=erover, er+op=erop, er+aan=eraan, er+in=erin, er+van=ervan.
Thema: oud worden, woonzorgcentrum, mantelzorg, samenvatting schrijven.
Vocab: stiekem, berispen, verwennen, verbieden, overdrijven, vermijden, eenzaam, sociaal isolement, woonzorgcentrum, pensioen, mantelzorg.

### Les 10 — 30 april (Relatieve Pronomina & Dankbaarheid)
Grammar: (1) Relatieve pronomina: "die" zonder prepositie (de persoon die / het boek dat); "wie" MET prepositie (aan wie / naar wie / op wie / voor wie) — enkel voor personen; (2) dankzij + object + inversie: dankzij = door maar ALTIJD positief; "Dankzij hem heb ik autorijden geleerd."
Thema: dankbaarheid, opvoedingslijn (advies over opvoeding via telefoon/chat).
Vocab: dankbaar, dankzij, opkijken naar (= bewonderen), onafhankelijk, vaardigheden, contacteren, bespreken, zindelijk zijn, luier, opvoedingslijn.

### Les 11 — 7 mei (Natuur, Milieu & Relatieve Bijzinnen met Preposities)
Grammar: (1) Relatieve bijzinnen met prepositie: DINGEN → waar + prepositie (waarvan, waarmee, waarop, waarover, waaraan, waarnaar); PERSONEN → prepositie + wie (van wie, aan wie, naar wie). NOOIT 'die/dat' + prepositie; (2) 'Er' als verwijswoord: er + hoeveelheid (er enkele / er geen / er veel); er + prepositie van scheidbaar werkwoord op positie 3 (uitkijken naar → Ik kijk ernaar uit; genieten van → Ik geniet er van).
Thema: natuur, huisdieren, kamerplanten, natuurrampen, milieu, duurzaamheid, 'Buur en natuur' initiatief.
Vocab: relaxen/ontspannen, huisdier, kamerplant, terechtkomen/belanden, aanbeveling, aanbevelen/aanraden, deelnemen aan, initiatief, natuurramp, overstroming, slachtoffer, verwoesten/vernielen, omvangrijk, duurzaam, uitkijken naar.

## Pedagogy notes

- Always include an English translation for every vocabulary item (no Spanish)
- Include at least one example sentence per word
- Grammar rules need: explanation (why) + rule (formula) + 2-3 examples with highlights
- Exercises should progress: recognition (MC) → production (fill-in) → connections (matching)
- Aim for 10-15 vocab items and 4-6 exercises per lesson
- Chunk vocabulary by semantic category (e.g., klachten / communicatie / emoties)
- For memory retention: vary game types, repeat core items across lessons when relevant

## Improvement TODO

Priority-ordered list of learning science + UX gaps to implement.

### P1 — Done

- [x] **Post-session error review** — results screen shows wrong items (label + correct answer +
  explanation) and a "Herhaal fouten" button that re-runs only the missed items. Done in
  GameSession.tsx and ReviewSession.tsx.
- [x] **Per-lesson mastery visualization on Dashboard** — each lesson card shows a stacked
  progress bar (green=mastered, orange=learning, grey=unseen) and "X geleerd · Y bezig · Z nieuw"
  text. Mastered = repetitions ≥ 3 AND easeFactor ≥ 2.3. Done in Dashboard.tsx.

### P2 — Done

- [x] **Vocabulary mastery dots** — coloured dot per vocab card in LessonView Woordenschat tab.
  grey=unseen, orange=learning, green=mastered. Driven by SRS card state.
- [x] **Fix streak bug** — `updateStreak` now checks `toDateString()` equality; skips increment
  if already updated today. Studying multiple times in one day no longer inflates the streak.
- [x] **Adaptive difficulty** — in GameSession flashcard mode, items with `repetitions >= 3` are
  routed to `ProductionCard` (type-the-translation challenge) instead of the standard flip card.
- [x] **Flashcard scheduling labels** — each SRS rating button now shows the computed next-review
  interval below the label (e.g. "Morgen", "6 dagen", "3 wk"). Uses actual `updateCard` preview.

### P3 — Done

- [x] **Interleaved Mix mode** — "Mix alle lessen" quick-action on Dashboard creates a synthetic
  lesson with all vocabulary shuffled across all lessons and launches a flashcard session.
- [x] **Weak words focus mode** — "Zwakke woorden (N)" quick-action filters vocab where
  `lapses >= 2 || easeFactor < 2.0` and drills those items. Button disabled when count is 0.
- [x] **Word-order exercise** — new `GameType 'word-order'`. `WordOrder.tsx` scrambles the
  vocab item's `example` sentence into tappable chips; student reassembles it. Available in
  LessonView Oefenen tab for all lessons. Minimum 3 words required.
- [x] **Grammar/vocabulary global search** — 🔍 toggle in Dashboard header. Searches all vocab
  (dutch + translation) and grammar titles live; results link directly to the lesson.

### P4 — Done

- [x] **Daily session recommendation** — when no reviews are due, Dashboard shows the next
  lesson to study (prioritises lessons with words in "learning" state, then unseen).
- [x] **XP progress chart** — 7-day CSS bar chart on Dashboard. `xpLog` (YYYY-MM-DD keyed)
  added to `AppProgress`; `rateCard` logs XP by day. Backward-compatible via storage spread.
- [x] **Matching game in ReviewSession** — `MatchingGame` now runs inline in ReviewSession;
  removed the "ga naar de les" placeholder entirely.
- [x] **Audio pronunciation** — 🔊 button on every flashcard front calls Web Speech API
  (`nl-NL`, rate 0.85). Gracefully no-ops if browser doesn't support `speechSynthesis`.
