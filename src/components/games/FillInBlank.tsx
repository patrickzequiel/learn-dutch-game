import { useState } from 'react';
import { FillInBlankExercise } from '../../types';

interface Props {
  exercise: FillInBlankExercise;
  onComplete: (correct: boolean) => void;
}

export function FillInBlank({ exercise, onComplete }: Props) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const isCorrect = value.trim().toLowerCase() === exercise.blank.toLowerCase();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitted(true);
  };

  const displaySentence = () => {
    if (!submitted) return exercise.sentence;
    return exercise.sentence.replace('___', `[${exercise.blank}]`);
  };

  return (
    <div className="game-card">
      <p className="question">{displaySentence()}</p>

      {!submitted ? (
        <form onSubmit={handleSubmit}>
          <input
            className="fill-input"
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Vul in..."
            autoFocus
          />
          <div className="fill-actions">
            {exercise.hint && (
              <button type="button" className="btn btn-secondary" onClick={() => setShowHint(s => !s)}>
                {showHint ? 'Verberg hint' : 'Hint'}
              </button>
            )}
            <button type="submit" className="btn btn-primary">Controleer</button>
          </div>
          {showHint && exercise.hint && <p className="hint-text">💡 {exercise.hint}</p>}
        </form>
      ) : (
        <div className={`explanation ${isCorrect ? 'explanation-correct' : 'explanation-wrong'}`}>
          <strong>{isCorrect ? '✓ Correct!' : `✗ Het antwoord is: "${exercise.blank}"`}</strong>
          {!isCorrect && <p>Jouw antwoord: "{value}"</p>}
          <p>{exercise.explanation}</p>
          <button className="btn btn-primary" onClick={() => onComplete(isCorrect)}>Volgende →</button>
        </div>
      )}
    </div>
  );
}
