import { useState, useEffect } from 'react';
import type { VocabularyItem } from '../../types';

interface Props {
  item: VocabularyItem;
  allItems: VocabularyItem[];
  onComplete: (correct: boolean) => void;
}

function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'nl-NL';
  utt.rate = 0.8;
  window.speechSynthesis.speak(utt);
}

function buildOptions(item: VocabularyItem, allItems: VocabularyItem[]): VocabularyItem[] {
  const others = allItems.filter(v => v.id !== item.id);
  const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
  return [...shuffled, item].sort(() => Math.random() - 0.5);
}

export function ListeningCard({ item, allItems, onComplete }: Props) {
  const [options] = useState(() => buildOptions(item, allItems));
  const [answered, setAnswered] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => speak(item.dutch), 400);
    return () => clearTimeout(timer);
  }, [item.dutch]);

  const handleSelect = (opt: VocabularyItem) => {
    if (answered !== null) return;
    setAnswered(opt.id);
  };

  const isCorrect = answered === item.id;

  const getClass = (opt: VocabularyItem) => {
    if (!answered) return 'btn btn-option';
    if (opt.id === item.id) return 'btn btn-option correct';
    if (opt.id === answered) return 'btn btn-option wrong';
    return 'btn btn-option dimmed';
  };

  return (
    <div className="game-card listening-card">
      <div className="listening-prompt">
        <p className="listening-label">Wat hoor je?</p>
        <button
          className="listening-replay"
          onClick={() => speak(item.dutch)}
          title="Herhaal audio"
        >
          🔊
        </button>
        <p className="listening-category">{item.category}</p>
      </div>

      <div className="options-grid">
        {options.map((opt, i) => (
          <button key={opt.id} className={getClass(opt)} onClick={() => handleSelect(opt)}>
            <span className="option-letter">{String.fromCharCode(65 + i)}</span>
            {opt.translation}
          </button>
        ))}
      </div>

      {answered && (
        <div className={`explanation ${isCorrect ? 'explanation-correct' : 'explanation-wrong'}`}>
          <strong>{isCorrect ? '✓ Correct!' : '✗ Niet correct'}</strong>
          <p className="listening-reveal-dutch">{item.dutch}</p>
          <p>{item.example}</p>
          <button className="btn btn-primary" onClick={() => onComplete(isCorrect)}>
            Volgende →
          </button>
        </div>
      )}
    </div>
  );
}
