import { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import type { Lesson, GameType, SRSRating, Exercise, VocabularyItem, SRSCard } from '../../types';
import { FlashCard } from '../games/FlashCard';
import { MultipleChoice } from '../games/MultipleChoice';
import { FillInBlank } from '../games/FillInBlank';
import { MatchingGame } from '../games/MatchingGame';
import { ProductionCard } from '../games/ProductionCard';
import { WordOrder } from '../games/WordOrder';

interface SessionError {
  label: string;
  correct: string;
  explanation?: string;
}

interface Props {
  lesson: Lesson;
  gameType: GameType;
  onComplete: () => void;
  onBack: () => void;
  onRate: (id: string, rating: SRSRating, type: 'vocabulary' | 'exercise') => void;
  cards?: Record<string, SRSCard>;
}

export function GameSession({ lesson, gameType, onComplete, onBack, onRate, cards }: Props) {
  const isVocabGame = gameType === 'flashcard' || gameType === 'word-order';
  const baseItems: (VocabularyItem | Exercise)[] = isVocabGame
    ? lesson.vocabulary.filter(v => v.example && v.example.split(/\s+/).length >= 3)
    : lesson.exercises.filter(e => e.type === gameType);

  const [retryItems, setRetryItems] = useState<(VocabularyItem | Exercise)[] | null>(null);
  const items = retryItems ?? baseItems;
  const total = items.length;

  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState<SessionError[]>([]);
  const [wrongItems, setWrongItems] = useState<(VocabularyItem | Exercise)[]>([]);

  useEffect(() => {
    if (!done) return;
    const pct = Math.round((score / total) * 100);
    if (pct >= 60) {
      confetti({
        particleCount: pct >= 80 ? 160 : 80,
        spread: 75,
        origin: { y: 0.55 },
        colors: ['#5B5BD6', '#00C896', '#FF9F43', '#FF6B6B', '#FFD700', '#818CF8'],
      });
    }
  }, [done, score, total]);

  const buildError = (item: VocabularyItem | Exercise): SessionError => {
    if (isVocabGame) {
      const v = item as VocabularyItem;
      return { label: v.dutch, correct: v.translation, explanation: v.example };
    }
    const ex = item as Exercise;
    if (ex.type === 'multiple-choice') return { label: ex.question, correct: ex.answer, explanation: ex.explanation };
    if (ex.type === 'fill-in-blank') return { label: ex.sentence, correct: ex.blank, explanation: ex.explanation };
    return { label: 'Koppelen', correct: (ex as Extract<Exercise, { type: 'matching' }>).pairs.map(p => `${p.left} → ${p.right}`).join(', ') };
  };

  const current = items[index];

  const next = (correct: boolean, item: VocabularyItem | Exercise) => {
    if (correct) {
      setScore(s => s + 1);
    } else {
      setErrors(prev => [...prev, buildError(item)]);
      setWrongItems(prev => [...prev, item]);
    }
    if (index + 1 >= total) setDone(true);
    else setIndex(i => i + 1);
  };

  const startRetry = () => {
    setRetryItems(wrongItems);
    setIndex(0); setScore(0); setDone(false); setErrors([]); setWrongItems([]);
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
              <button className="btn btn-warning" style={{ width: '100%', marginTop: '0.75rem' }} onClick={startRetry}>
                Herhaal fouten ({errors.length})
              </button>
            </div>
          )}
          <div className="results-actions">
            <button className="btn btn-secondary" onClick={onBack}>Terug naar les</button>
            <button className="btn btn-primary" onClick={onComplete}>Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  const progressPct = Math.round((index / total) * 100);
  const vocabItem = current as VocabularyItem;
  const exerciseItem = current as Exercise;
  const srsCard = cards?.[vocabItem.id];
  const useProduction = gameType === 'flashcard' && srsCard && srsCard.repetitions >= 3;

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
        useProduction
          ? <ProductionCard item={vocabItem} onRate={rating => { onRate(vocabItem.id, rating, 'vocabulary'); next(rating >= 3, current); }} />
          : <FlashCard item={vocabItem} srsCard={srsCard} onRate={rating => { onRate(vocabItem.id, rating, 'vocabulary'); next(rating >= 3, current); }} />
      )}
      {gameType === 'word-order' && (
        <WordOrder item={vocabItem} onComplete={correct => { onRate(vocabItem.id, correct ? 3 : 1, 'vocabulary'); next(correct, current); }} />
      )}
      {gameType === 'multiple-choice' && (
        <MultipleChoice exercise={exerciseItem as Extract<Exercise, { type: 'multiple-choice' }>} onComplete={correct => { onRate(exerciseItem.id, correct ? 4 : 1, 'exercise'); next(correct, current); }} />
      )}
      {gameType === 'fill-in-blank' && (
        <FillInBlank exercise={exerciseItem as Extract<Exercise, { type: 'fill-in-blank' }>} onComplete={correct => { onRate(exerciseItem.id, correct ? 4 : 1, 'exercise'); next(correct, current); }} />
      )}
      {gameType === 'matching' && (
        <MatchingGame exercise={exerciseItem as Extract<Exercise, { type: 'matching' }>} onComplete={allCorrect => { onRate(exerciseItem.id, allCorrect ? 4 : 2, 'exercise'); next(allCorrect, current); }} />
      )}
    </div>
  );
}
