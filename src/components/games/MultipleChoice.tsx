import { useState } from 'react';
import { MultipleChoiceExercise } from '../../types';

interface Props {
  exercise: MultipleChoiceExercise;
  onComplete: (correct: boolean) => void;
}

export function MultipleChoice({ exercise, onComplete }: Props) {
  const [selected, setSelected] = useState<string | null>(null);

  const handleSelect = (option: string) => {
    if (selected) return;
    setSelected(option);
  };

  const getClass = (option: string) => {
    if (!selected) return 'btn btn-option';
    if (option === exercise.answer) return 'btn btn-option correct';
    if (option === selected) return 'btn btn-option wrong';
    return 'btn btn-option dimmed';
  };

  return (
    <div className="game-card">
      <p className="question">{exercise.question}</p>
      <div className="options-grid">
        {exercise.options.map(opt => (
          <button key={opt} className={getClass(opt)} onClick={() => handleSelect(opt)}>
            {opt}
          </button>
        ))}
      </div>
      {selected && (
        <div className={`explanation ${selected === exercise.answer ? 'explanation-correct' : 'explanation-wrong'}`}>
          <strong>{selected === exercise.answer ? '✓ Correct!' : '✗ Niet correct'}</strong>
          <p>{exercise.explanation}</p>
          <button className="btn btn-primary" onClick={() => onComplete(selected === exercise.answer)}>
            Volgende →
          </button>
        </div>
      )}
    </div>
  );
}
