import { useState } from 'react';
import { GameType } from './types';
import { ALL_LESSONS, getLessonById } from './data';
import { useProgress } from './hooks/useProgress';
import { Dashboard } from './components/screens/Dashboard';
import { LessonView } from './components/screens/LessonView';
import { GameSession } from './components/screens/GameSession';
import { ReviewSession } from './components/screens/ReviewSession';

type View =
  | { screen: 'dashboard' }
  | { screen: 'lesson'; lessonId: string }
  | { screen: 'game'; lessonId: string; gameType: GameType }
  | { screen: 'review' };

export default function App() {
  const [view, setView] = useState<View>({ screen: 'dashboard' });
  const { progress, rateCard, getDueReviewCards, initCardsForLesson, completeLesson, updateStreak } = useProgress();

  if (view.screen === 'dashboard') {
    return (
      <div className="app">
        <Dashboard
          lessons={ALL_LESSONS}
          progress={progress}
          onSelectLesson={(id) => {
            initCardsForLesson(id);
            setView({ screen: 'lesson', lessonId: id });
          }}
          onStartReview={() => setView({ screen: 'review' })}
        />
      </div>
    );
  }

  if (view.screen === 'lesson') {
    const lesson = getLessonById(view.lessonId);
    if (!lesson) return <div className="app"><button onClick={() => setView({ screen: 'dashboard' })}>← Terug</button></div>;
    return (
      <div className="app">
        <LessonView
          lesson={lesson}
          onBack={() => setView({ screen: 'dashboard' })}
          onStartGame={(type, lessonId) => setView({ screen: 'game', lessonId, gameType: type })}
        />
      </div>
    );
  }

  if (view.screen === 'game') {
    const lesson = getLessonById(view.lessonId);
    if (!lesson) return <div className="app"><button onClick={() => setView({ screen: 'dashboard' })}>← Terug</button></div>;
    return (
      <div className="app">
        <GameSession
          lesson={lesson}
          gameType={view.gameType}
          onBack={() => setView({ screen: 'lesson', lessonId: view.lessonId })}
          onComplete={() => {
            completeLesson(view.lessonId);
            updateStreak();
            setView({ screen: 'dashboard' });
          }}
          onRate={(id, rating, type) => rateCard(id, rating, type)}
        />
      </div>
    );
  }

  if (view.screen === 'review') {
    const dueCards = getDueReviewCards();
    return (
      <div className="app">
        <ReviewSession
          dueCards={dueCards}
          onBack={() => setView({ screen: 'dashboard' })}
          onComplete={() => {
            updateStreak();
            setView({ screen: 'dashboard' });
          }}
          onRate={(id, rating, type) => rateCard(id, rating, type)}
        />
      </div>
    );
  }

  return null;
}
