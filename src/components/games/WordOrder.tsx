import { useState, useEffect } from 'react';
import type { VocabularyItem } from '../../types';

interface Token { id: string; text: string; }

function shuffle<T>(arr: T[]): T[] {
  return [...arr].sort(() => Math.random() - 0.5);
}

interface Props {
  item: VocabularyItem;
  onComplete: (correct: boolean) => void;
}

export function WordOrder({ item, onComplete }: Props) {
  const target = item.example;
  const words = target.split(/\s+/);
  const [bank, setBank] = useState<Token[]>([]);
  const [built, setBuilt] = useState<Token[]>([]);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    const tokens: Token[] = words.map((text, i) => ({ id: `w${i}`, text }));
    setBank(shuffle(tokens));
    setBuilt([]);
    setChecked(false);
  }, [item.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const addWord = (token: Token) => {
    setBank(prev => prev.filter(t => t.id !== token.id));
    setBuilt(prev => [...prev, token]);
  };

  const removeWord = (token: Token) => {
    if (checked) return;
    setBuilt(prev => prev.filter(t => t.id !== token.id));
    setBank(prev => [...prev, token]);
  };

  const builtSentence = built.map(t => t.text).join(' ');
  const isCorrect = builtSentence === target;

  return (
    <div className="game-card">
      <div className="wordorder-context">
        <span className="wordorder-label">Vertaling:</span> {item.translation}
      </div>
      <p className="question">Bouw de Nederlandse zin:</p>

      <div className={`wordorder-built ${built.length === 0 ? 'wordorder-built-empty' : ''}`}>
        {built.length === 0
          ? <span className="wordorder-placeholder">Tik woorden om de zin te bouwen…</span>
          : built.map(token => (
            <button
              key={token.id}
              className="word-chip word-chip-built"
              onClick={() => removeWord(token)}
              disabled={checked}
            >
              {token.text}
            </button>
          ))
        }
      </div>

      <div className="wordorder-bank">
        {bank.map(token => (
          <button
            key={token.id}
            className="word-chip word-chip-bank"
            onClick={() => addWord(token)}
            disabled={checked}
          >
            {token.text}
          </button>
        ))}
      </div>

      {!checked ? (
        <button
          className="btn btn-primary"
          style={{ width: '100%', marginTop: '0.75rem' }}
          disabled={built.length === 0}
          onClick={() => setChecked(true)}
        >
          Controleer
        </button>
      ) : (
        <div className={`explanation ${isCorrect ? 'explanation-correct' : 'explanation-wrong'}`}>
          <strong>{isCorrect ? '✓ Correct!' : '✗ Niet helemaal'}</strong>
          {!isCorrect && <p>Juist: <em>{target}</em></p>}
          <button className="btn btn-primary" onClick={() => onComplete(isCorrect)}>
            Volgende →
          </button>
        </div>
      )}
    </div>
  );
}
