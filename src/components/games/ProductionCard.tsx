import { useState } from 'react';
import type { VocabularyItem, SRSRating } from '../../types';

function isMatch(input: string, translation: string): boolean {
  const clean = (s: string) => s.toLowerCase().trim();
  const answer = clean(input);
  return translation.split('/').map(clean).some(p => p === answer);
}

interface Props {
  item: VocabularyItem;
  onRate: (rating: SRSRating) => void;
}

export function ProductionCard({ item, onRate }: Props) {
  const [value, setValue] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const correct = submitted && isMatch(value, item.translation);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!value.trim()) return;
    setSubmitted(true);
  };

  return (
    <div className="production-card card">
      <div className="production-challenge-badge">Productieoefening ✏️</div>
      <div className="production-word">{item.dutch}</div>
      <div className="production-example"><em>{item.example}</em></div>

      {!submitted ? (
        <form onSubmit={handleSubmit} className="production-form">
          <p className="production-prompt">Type de vertaling (Spaans of Engels):</p>
          <input
            className="fill-input"
            type="text"
            value={value}
            onChange={e => setValue(e.target.value)}
            placeholder="Vertaling..."
            autoFocus
          />
          <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>
            Controleer
          </button>
        </form>
      ) : (
        <div className={`explanation ${correct ? 'explanation-correct' : 'explanation-wrong'}`}>
          <strong>{correct ? '✓ Correct!' : `✗ Antwoord: "${item.translation}"`}</strong>
          {!correct && <p>Jouw antwoord: "{value}"</p>}
          <div className="rating-grid" style={{ marginTop: '0.75rem' }}>
            {correct ? (
              <>
                <button className="btn btn-success" onClick={() => onRate(3)}>😊 Goed</button>
                <button className="btn btn-primary" onClick={() => onRate(4)}>😄 Makkelijk</button>
              </>
            ) : (
              <>
                <button className="btn btn-danger" onClick={() => onRate(1)}>😰 Weet ik niet</button>
                <button className="btn btn-warning" onClick={() => onRate(2)}>😕 Moeilijk</button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
