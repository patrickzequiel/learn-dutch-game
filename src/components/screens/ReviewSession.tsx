import { useState } from 'react';
import { SRSCard, SRSRating } from '../../types';
import { getAllVocabulary, getAllExercises } from '../../data';
import { FlashCard } from '../games/FlashCard';
import { MultipleChoice } from '../games/MultipleChoice';
import { FillInBlank } from '../games/FillInBlank';

interface Props {
  dueCards: SRSCard[];
  onComplete: () => void;
  onBack: () => void;
  onRate: (id: string, rating: SRSRating, type: 'vocabulary' | 'exercise') => void;
}

export function ReviewSession({ dueCards, onComplete, onBack, onRate }: Props) {
  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);

  const allVocab = getAllVocabulary();
  const allExercises = getAllExercises();

  const total = dueCards.length;

  if (total === 0) {
    return (
      <div className="screen">
        <button className="btn-back" onClick={onBack}>← Terug</button>
        <div className="card" style={{ textAlign: 'center', padding: '2rem' }}>
          <div style={{ fontSize: '3rem' }}>🎉</div>
          <h2>Alles up to date!</h2>
          <p>Je hebt geen kaarten die herhaald moeten worden.</p>
          <button className="btn btn-primary" onClick={onBack}>Terug naar dashboard</button>
        </div>
      </div>
    );
  }

  if (index >= total) {
    const pct = Math.round((correct / total) * 100);
    return (
      <div className="screen">
        <div className="results-card card">
          <div className="results-icon">{pct >= 80 ? '🎉' : '💪'}</div>
          <h2 className="results-title">Herhaling klaar!</h2>
          <p className="results-score">{correct} / {total} correct ({pct}%)</p>
          <p className="results-xp">+{correct * 10} XP verdiend</p>
          <button className="btn btn-primary" onClick={onComplete}>Terug naar dashboard</button>
        </div>
      </div>
    );
  }

  const card = dueCards[index];
  const progress = Math.round((index / total) * 100);

  const advance = (rating: SRSRating, isCorrect: boolean) => {
    onRate(card.id, rating, card.type);
    if (isCorrect) setCorrect(c => c + 1);
    setIndex(i => i + 1);
  };

  if (card.type === 'vocabulary') {
    const vocab = allVocab.find(v => v.id === card.id);
    if (!vocab) { setIndex(i => i + 1); return null; }
    return (
      <div className="screen">
        <div className="session-header">
          <button className="btn-back" onClick={onBack}>← Terug</button>
          <span className="session-count">{index + 1} / {total}</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
        <p className="review-label">Herhaling</p>
        <FlashCard item={vocab} onRate={(rating) => advance(rating, rating >= 3)} />
      </div>
    );
  }

  const exercise = allExercises.find(e => e.id === card.id);
  if (!exercise) { setIndex(i => i + 1); return null; }

  return (
    <div className="screen">
      <div className="session-header">
        <button className="btn-back" onClick={onBack}>← Terug</button>
        <span className="session-count">{index + 1} / {total}</span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <p className="review-label">Herhaling</p>
      {exercise.type === 'multiple-choice' && (
        <MultipleChoice exercise={exercise} onComplete={(c) => advance(c ? 4 : 1, c)} />
      )}
      {exercise.type === 'fill-in-blank' && (
        <FillInBlank exercise={exercise} onComplete={(c) => advance(c ? 4 : 1, c)} />
      )}
      {exercise.type === 'matching' && (
        <div className="card" style={{ padding: '1rem' }}>
          <p>Koppel-oefening — ga naar de les om te oefenen.</p>
          <button className="btn btn-primary" onClick={() => advance(3, true)}>Volgende</button>
        </div>
      )}
    </div>
  );
}
