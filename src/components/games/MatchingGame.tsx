import { useState, useEffect } from 'react';
import { MatchingExercise } from '../../types';

interface Props {
  exercise: MatchingExercise;
  onComplete: (allCorrect: boolean) => void;
}

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

export function MatchingGame({ exercise, onComplete }: Props) {
  const [lefts, setLefts] = useState<string[]>([]);
  const [rights, setRights] = useState<string[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [wrong, setWrong] = useState<string | null>(null);
  const [errors, setErrors] = useState(0);

  useEffect(() => {
    setLefts(shuffle(exercise.pairs.map(p => p.left)));
    setRights(shuffle(exercise.pairs.map(p => p.right)));
  }, [exercise]);

  const handleLeft = (left: string) => {
    if (matched.has(left)) return;
    setSelectedLeft(left);
  };

  const handleRight = (right: string) => {
    if (!selectedLeft) return;
    const pair = exercise.pairs.find(p => p.left === selectedLeft);
    if (pair && pair.right === right) {
      const newMatched = new Set(matched).add(selectedLeft);
      setMatched(newMatched);
      setSelectedLeft(null);
      setWrong(null);
      if (newMatched.size === exercise.pairs.length) {
        setTimeout(() => onComplete(errors === 0), 600);
      }
    } else {
      setWrong(right);
      setErrors(e => e + 1);
      setTimeout(() => { setWrong(null); setSelectedLeft(null); }, 800);
    }
  };

  const getLeftClass = (left: string) => {
    if (matched.has(left)) return 'match-item matched';
    if (selectedLeft === left) return 'match-item selected';
    return 'match-item';
  };

  const getRightClass = (right: string) => {
    const matchedPair = exercise.pairs.find(p => matched.has(p.left) && p.right === right);
    if (matchedPair) return 'match-item matched';
    if (wrong === right) return 'match-item wrong-flash';
    return 'match-item';
  };

  return (
    <div className="game-card">
      <p className="question">Koppel de woorden aan de juiste vertaling.</p>
      <div className="matching-grid">
        <div className="match-col">
          {lefts.map(left => (
            <button key={left} className={getLeftClass(left)} onClick={() => handleLeft(left)} disabled={matched.has(left)}>
              {left}
            </button>
          ))}
        </div>
        <div className="match-col">
          {rights.map(right => (
            <button key={right} className={getRightClass(right)} onClick={() => handleRight(right)} disabled={!!exercise.pairs.find(p => matched.has(p.left) && p.right === right)}>
              {right}
            </button>
          ))}
        </div>
      </div>
      <p className="match-progress">{matched.size} / {exercise.pairs.length} gekoppeld</p>
    </div>
  );
}
