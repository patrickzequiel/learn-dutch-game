import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { SRSCard, SRSRating } from '../../types';
import { getAllVocabulary, getAllExercises } from '../../data';
import { FlashCard } from '../games/FlashCard';
import { MultipleChoice } from '../games/MultipleChoice';
import { FillInBlank } from '../games/FillInBlank';
import { MatchingGame } from '../games/MatchingGame';

interface SessionError {
  label: string;
  correct: string;
  explanation?: string;
}

interface Props {
  dueCards: SRSCard[];
  onComplete: () => void;
  onBack: () => void;
  onRate: (id: string, rating: SRSRating, type: 'vocabulary' | 'exercise') => void;
}

export function ReviewSession({ dueCards, onComplete, onBack, onRate }: Props) {
  const allVocab = getAllVocabulary();
  const allExercises = getAllExercises();

  const [retryCards, setRetryCards] = useState<SRSCard[] | null>(null);
  const cards = retryCards ?? dueCards;
  const total = cards.length;

  const [index, setIndex] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [errors, setErrors] = useState<SessionError[]>([]);
  const [wrongCards, setWrongCards] = useState<SRSCard[]>([]);

  useEffect(() => {
    if (index < total || total === 0) return;
    const pct = Math.round((correct / total) * 100);
    if (pct >= 60) {
      confetti({
        particleCount: pct >= 80 ? 160 : 80,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#5B5BD6', '#00C896', '#FF9F43', '#FF6B6B', '#FFD700', '#818CF8'],
      });
    }
  }, [index, total, correct]);

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
          {errors.length > 0 && (
            <div className="errors-section">
              <p className="errors-title">Nog te leren ({errors.length})</p>
              <div className="errors-list">
                {errors.map((err, i) => (
                  <div key={i} className="error-item">
                    <div className="error-label">{err.label}</div>
                    <div className="error-correct">✓ {err.correct}</div>
                    {err.explanation && <div className="error-explanation">{err.explanation}</div>}
                  </div>
                ))}
              </div>
              <button
                className="btn btn-warning"
                style={{ width: '100%', marginTop: '0.75rem' }}
                onClick={() => {
                  setRetryCards(wrongCards);
                  setIndex(0); setCorrect(0); setErrors([]); setWrongCards([]);
                }}
              >
                Herhaal fouten ({errors.length})
              </button>
            </div>
          )}
          <button className="btn btn-primary" style={{ marginTop: '1rem' }} onClick={onComplete}>
            Terug naar dashboard
          </button>
        </div>
      </div>
    );
  }

  const card = cards[index];
  const progress = Math.round((index / total) * 100);

  const advance = (rating: SRSRating, isCorrect: boolean, error?: SessionError) => {
    onRate(card.id, rating, card.type);
    if (isCorrect) setCorrect(c => c + 1);
    else if (error) { setErrors(prev => [...prev, error]); setWrongCards(prev => [...prev, card]); }
    setIndex(i => i + 1);
  };

  const header = (
    <div className="screen">
      <div className="session-header">
        <button className="btn-back" onClick={onBack}>← Terug</button>
        <span className="session-count">{index + 1} / {total}</span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <p className="review-label">Herhaling</p>
    </div>
  );

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
        <FlashCard
          item={vocab}
          srsCard={card}
          onRate={rating => advance(
            rating,
            rating >= 3,
            rating < 3 ? { label: vocab.dutch, correct: vocab.translation, explanation: vocab.example } : undefined,
          )}
        />
      </div>
    );
  }

  const exercise = allExercises.find(e => e.id === card.id);
  if (!exercise) { setIndex(i => i + 1); return null; }

  const buildExerciseError = (): SessionError | undefined => {
    if (exercise.type === 'multiple-choice') return { label: exercise.question, correct: exercise.answer, explanation: exercise.explanation };
    if (exercise.type === 'fill-in-blank') return { label: exercise.sentence, correct: exercise.blank, explanation: exercise.explanation };
    return undefined;
  };

  // suppress unused variable warning — header is used inline below
  void header;

  return (
    <div className="screen">
      <div className="session-header">
        <button className="btn-back" onClick={onBack}>← Terug</button>
        <span className="session-count">{index + 1} / {total}</span>
      </div>
      <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
      <p className="review-label">Herhaling</p>
      {exercise.type === 'multiple-choice' && (
        <MultipleChoice exercise={exercise} onComplete={c => advance(c ? 4 : 1, c, c ? undefined : buildExerciseError())} />
      )}
      {exercise.type === 'fill-in-blank' && (
        <FillInBlank exercise={exercise} onComplete={c => advance(c ? 4 : 1, c, c ? undefined : buildExerciseError())} />
      )}
      {exercise.type === 'matching' && (
        <MatchingGame
          exercise={exercise}
          onComplete={allCorrect => advance(
            allCorrect ? 4 : 2,
            allCorrect,
            allCorrect ? undefined : { label: 'Koppelen', correct: exercise.pairs.map(p => `${p.left} → ${p.right}`).join(', ') },
          )}
        />
      )}
    </div>
  );
}
