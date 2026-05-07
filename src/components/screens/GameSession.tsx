import { useState } from 'react';
import { Lesson, GameType, SRSRating, Exercise, VocabularyItem } from '../../types';
import { FlashCard } from '../games/FlashCard';
import { MultipleChoice } from '../games/MultipleChoice';
import { FillInBlank } from '../games/FillInBlank';
import { MatchingGame } from '../games/MatchingGame';

interface Props {
  lesson: Lesson;
  gameType: GameType;
  onComplete: () => void;
  onBack: () => void;
  onRate: (id: string, rating: SRSRating, type: 'vocabulary' | 'exercise') => void;
}

export function GameSession({ lesson, gameType, onComplete, onBack, onRate }: Props) {
  const items: (VocabularyItem | Exercise)[] = gameType === 'flashcard'
    ? lesson.vocabulary
    : lesson.exercises.filter(e => e.type === gameType);

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  const total = items.length;
  const current = items[index];

  const next = (correct?: boolean) => {
    if (correct !== undefined && correct) setScore(s => s + 1);
    if (index + 1 >= total) {
      setDone(true);
    } else {
      setIndex(i => i + 1);
    }
  };

  if (total === 0) {
    return (
      <div className="screen">
        <button className="btn-back" onClick={onBack}>← Terug</button>
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <p>Geen oefeningen beschikbaar voor dit speltype.</p>
          <button className="btn btn-primary" onClick={onBack}>Terug naar les</button>
        </div>
      </div>
    );
  }

  if (done) {
    const pct = Math.round((score / total) * 100);
    return (
      <div className="screen">
        <div className="results-card card">
          <div className="results-icon">{pct >= 80 ? '🎉' : pct >= 50 ? '😊' : '💪'}</div>
          <h2 className="results-title">Klaar!</h2>
          <p className="results-score">{score} / {total} correct ({pct}%)</p>
          <p className="results-xp">+{score * 10} XP verdiend</p>
          <div className="results-actions">
            <button className="btn btn-secondary" onClick={onBack}>Terug naar les</button>
            <button className="btn btn-primary" onClick={onComplete}>Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = Math.round((index / total) * 100);

  return (
    <div className="screen">
      <div className="session-header">
        <button className="btn-back" onClick={onBack}>← Terug</button>
        <span className="session-count">{index + 1} / {total}</span>
      </div>
      <div className="progress-bar">
        <div className="progress-fill" style={{ width: `${progressPct}%` }} />
      </div>

      {gameType === 'flashcard' && (
        <FlashCard
          item={current as VocabularyItem}
          onRate={(rating) => {
            onRate((current as VocabularyItem).id, rating, 'vocabulary');
            next(rating >= 3);
          }}
        />
      )}
      {gameType === 'multiple-choice' && (
        <MultipleChoice
          exercise={current as Extract<Exercise, { type: 'multiple-choice' }>}
          onComplete={(correct) => {
            onRate((current as Exercise).id, correct ? 4 : 1, 'exercise');
            next(correct);
          }}
        />
      )}
      {gameType === 'fill-in-blank' && (
        <FillInBlank
          exercise={current as Extract<Exercise, { type: 'fill-in-blank' }>}
          onComplete={(correct) => {
            onRate((current as Exercise).id, correct ? 4 : 1, 'exercise');
            next(correct);
          }}
        />
      )}
      {gameType === 'matching' && (
        <MatchingGame
          exercise={current as Extract<Exercise, { type: 'matching' }>}
          onComplete={(allCorrect) => {
            onRate((current as Exercise).id, allCorrect ? 4 : 2, 'exercise');
            next(allCorrect);
          }}
        />
      )}
    </div>
  );
}
