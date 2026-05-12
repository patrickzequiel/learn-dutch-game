import { useState } from 'react';
import type { GameType, Lesson } from './types';
import { ALL_LESSONS, getLessonById, getAllVocabulary } from './data';
import { MONDELING_LESSONS, getMondelingLessonById, getAllMondelingVocabulary } from './data/mondeling';
import { useProgress } from './hooks/useProgress';
import { ModeSelect } from './components/screens/ModeSelect';
import { Dashboard } from './components/screens/Dashboard';
import { MondelingDashboard } from './components/screens/MondelingDashboard';
import { LessonView } from './components/screens/LessonView';
import { GameSession } from './components/screens/GameSession';
import { ReviewSession } from './components/screens/ReviewSession';

type Mode = null | 'schriftelijk' | 'mondeling';

type View =
  | { screen: 'dashboard' }
  | { screen: 'lesson'; lessonId: string }
  | { screen: 'game'; lessonId: string; gameType: GameType }
  | { screen: 'game-custom'; lesson: Lesson; gameType: GameType }
  | { screen: 'review' };

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function App() {
  const [mode, setMode] = useState<Mode>(null);
  const [view, setView] = useState<View>({ screen: 'dashboard' });
  const {
    progress, rateCard, getDueReviewCards,
    initCardsForLesson, completeLesson, updateStreak, getWeakVocabItems,
  } = useProgress();

  const goToDashboard = () => setView({ screen: 'dashboard' });

  const selectMode = (m: 'schriftelijk' | 'mondeling') => {
    setMode(m);
    setView({ screen: 'dashboard' });
  };

  if (mode === null) {
    return (
      <div className="app">
        <ModeSelect onSelect={selectMode} />
      </div>
    );
  }

  // ── MONDELING MODE ──────────────────────────────────────────────
  if (mode === 'mondeling') {
    const getMondLesson = (id: string) => getMondelingLessonById(id);

    if (view.screen === 'dashboard') {
      return (
        <div className="app">
          <MondelingDashboard
            lessons={MONDELING_LESSONS}
            progress={progress}
            onBack={() => setMode(null)}
            onSelectLesson={id => { initCardsForLesson(id); setView({ screen: 'lesson', lessonId: id }); }}
            onStartGame={(lessonId, type) => setView({ screen: 'game', lessonId, gameType: type })}
            onStartMix={type => {
              const vocab = shuffle(getAllMondelingVocabulary());
              const syntheticLesson: Lesson = {
                id: '__mond-mix__', number: -1, date: '', dateDisplay: '',
                theme: 'Mix Mondeling', topics: [],
                vocabulary: vocab, grammar: [], exercises: [],
              };
              setView({ screen: 'game-custom', lesson: syntheticLesson, gameType: type });
            }}
          />
        </div>
      );
    }

    if (view.screen === 'lesson') {
      const lesson = getMondLesson(view.lessonId);
      if (!lesson) return <div className="app"><button onClick={goToDashboard}>← Terug</button></div>;
      return (
        <div className="app">
          <LessonView
            lesson={lesson}
            progress={progress}
            onBack={goToDashboard}
            onStartGame={(type, lessonId) => setView({ screen: 'game', lessonId, gameType: type })}
          />
        </div>
      );
    }

    if (view.screen === 'game') {
      const lesson = getMondLesson(view.lessonId);
      if (!lesson) return <div className="app"><button onClick={goToDashboard}>← Terug</button></div>;
      return (
        <div className="app">
          <GameSession
            lesson={lesson}
            gameType={view.gameType}
            cards={progress.cards}
            onBack={() => setView({ screen: 'lesson', lessonId: view.lessonId })}
            onComplete={() => { completeLesson(view.lessonId); updateStreak(); goToDashboard(); }}
            onRate={(id, rating, type) => rateCard(id, rating, type)}
          />
        </div>
      );
    }

    if (view.screen === 'game-custom') {
      return (
        <div className="app">
          <GameSession
            lesson={view.lesson}
            gameType={view.gameType}
            cards={progress.cards}
            onBack={goToDashboard}
            onComplete={() => { updateStreak(); goToDashboard(); }}
            onRate={(id, rating, type) => rateCard(id, rating, type)}
          />
        </div>
      );
    }

    return null;
  }

  // ── SCHRIFTELIJK MODE ───────────────────────────────────────────
  if (view.screen === 'dashboard') {
    return (
      <div className="app">
        <Dashboard
          lessons={ALL_LESSONS}
          progress={progress}
          onSelectLesson={id => { initCardsForLesson(id); setView({ screen: 'lesson', lessonId: id }); }}
          onStartReview={() => setView({ screen: 'review' })}
          onStartMix={(lessonIds) => {
            const allVocab = getAllVocabulary();
            const vocab = shuffle(lessonIds ? allVocab.filter(v => lessonIds.includes(v.lessonId)) : allVocab);
            const syntheticLesson: Lesson = {
              id: '__mix__', number: -1, date: '', dateDisplay: '',
              theme: 'Mix', topics: [],
              vocabulary: vocab, grammar: [], exercises: [],
            };
            setView({ screen: 'game-custom', lesson: syntheticLesson, gameType: 'flashcard' });
          }}
          onStartWeakWords={() => {
            const weak = getWeakVocabItems();
            if (weak.length === 0) return;
            const syntheticLesson: Lesson = {
              id: '__weak__', number: -1, date: '', dateDisplay: '',
              theme: 'Zwakke woorden', topics: [],
              vocabulary: weak, grammar: [], exercises: [],
            };
            setView({ screen: 'game-custom', lesson: syntheticLesson, gameType: 'flashcard' });
          }}
          onChangeMode={() => setMode(null)}
        />
      </div>
    );
  }

  if (view.screen === 'lesson') {
    const lesson = getLessonById(view.lessonId);
    if (!lesson) return <div className="app"><button onClick={goToDashboard}>← Terug</button></div>;
    return (
      <div className="app">
        <LessonView
          lesson={lesson}
          progress={progress}
          onBack={goToDashboard}
          onStartGame={(type, lessonId) => setView({ screen: 'game', lessonId, gameType: type })}
        />
      </div>
    );
  }

  if (view.screen === 'game') {
    const lesson = getLessonById(view.lessonId);
    if (!lesson) return <div className="app"><button onClick={goToDashboard}>← Terug</button></div>;
    return (
      <div className="app">
        <GameSession
          lesson={lesson}
          gameType={view.gameType}
          cards={progress.cards}
          onBack={() => setView({ screen: 'lesson', lessonId: view.lessonId })}
          onComplete={() => { completeLesson(view.lessonId); updateStreak(); goToDashboard(); }}
          onRate={(id, rating, type) => rateCard(id, rating, type)}
        />
      </div>
    );
  }

  if (view.screen === 'game-custom') {
    return (
      <div className="app">
        <GameSession
          lesson={view.lesson}
          gameType={view.gameType}
          cards={progress.cards}
          onBack={goToDashboard}
          onComplete={() => { updateStreak(); goToDashboard(); }}
          onRate={(id, rating, type) => rateCard(id, rating, type)}
        />
      </div>
    );
  }

  if (view.screen === 'review') {
    return (
      <div className="app">
        <ReviewSession
          dueCards={getDueReviewCards()}
          onBack={goToDashboard}
          onComplete={() => { updateStreak(); goToDashboard(); }}
          onRate={(id, rating, type) => rateCard(id, rating, type)}
        />
      </div>
    );
  }

  return null;
}
