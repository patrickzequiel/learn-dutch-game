import { useState } from 'react';
import type { VocabularyItem, SRSRating, SRSCard } from '../../types';
import { updateCard } from '../../lib/srs';

interface Props {
  item: VocabularyItem;
  onRate: (rating: SRSRating) => void;
  srsCard?: SRSCard;
}

function scheduleLabel(card: SRSCard | undefined, rating: SRSRating): string {
  if (!card) {
    return rating <= 2 ? 'Morgen' : rating === 3 ? '6 dagen' : '6 dagen';
  }
  const days = updateCard(card, rating).interval;
  if (days <= 1) return 'Morgen';
  if (days < 7) return `${days} dagen`;
  if (days < 30) return `${Math.round(days / 7)} wk`;
  return `${Math.round(days / 30)} mnd`;
}

function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text);
  utt.lang = 'nl-NL';
  utt.rate = 0.85;
  window.speechSynthesis.speak(utt);
}

const RATING_CONFIG: Array<{ label: string; cls: string; rating: SRSRating }> = [
  { label: '😰 Weet ik niet', cls: 'btn btn-danger',  rating: 1 },
  { label: '😕 Moeilijk',     cls: 'btn btn-warning', rating: 2 },
  { label: '😊 Goed',         cls: 'btn btn-success', rating: 3 },
  { label: '😄 Makkelijk',    cls: 'btn btn-primary', rating: 4 },
];

export function FlashCard({ item, onRate, srsCard }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flashcard-container">
      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
        <div className="flashcard-face flashcard-front">
          <div className="flashcard-label">Nederlands</div>
          <div className="flashcard-word">{item.dutch}</div>
          <button
            className="audio-btn"
            onClick={e => { e.stopPropagation(); speak(item.dutch); }}
            aria-label="Uitspreken"
          >
            🔊
          </button>
          <div className="flashcard-tap">Tik om te omdraaien</div>
        </div>
        <div className="flashcard-face flashcard-back">
          <div className="flashcard-label">Vertaling</div>
          <div className="flashcard-translation">{item.translation}</div>
          <div className="flashcard-example">
            <em>{item.example}</em>
            <span className="flashcard-example-tr">{item.exampleTranslation}</span>
          </div>
        </div>
      </div>

      {flipped && (
        <div className="rating-buttons">
          <p className="rating-label">Hoe goed kende je dit?</p>
          <div className="rating-grid">
            {RATING_CONFIG.map(({ label, cls, rating }) => (
              <button key={rating} className={cls} onClick={() => onRate(rating)}>
                {label}
                <span className="schedule-hint">{scheduleLabel(srsCard, rating)}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
