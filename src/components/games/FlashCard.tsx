import { useState } from 'react';
import { VocabularyItem, SRSRating } from '../../types';

interface Props {
  item: VocabularyItem;
  onRate: (rating: SRSRating) => void;
}

export function FlashCard({ item, onRate }: Props) {
  const [flipped, setFlipped] = useState(false);

  return (
    <div className="flashcard-container">
      <div className={`flashcard ${flipped ? 'flipped' : ''}`} onClick={() => setFlipped(f => !f)}>
        <div className="flashcard-face flashcard-front">
          <div className="flashcard-label">Nederlands</div>
          <div className="flashcard-word">{item.dutch}</div>
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
            <button className="btn btn-danger" onClick={() => onRate(1)}>😰 Weet ik niet</button>
            <button className="btn btn-warning" onClick={() => onRate(2)}>😕 Moeilijk</button>
            <button className="btn btn-success" onClick={() => onRate(3)}>😊 Goed</button>
            <button className="btn btn-primary" onClick={() => onRate(4)}>😄 Makkelijk</button>
          </div>
        </div>
      )}
    </div>
  );
}
