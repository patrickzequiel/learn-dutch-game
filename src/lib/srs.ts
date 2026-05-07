import type { SRSCard, SRSRating } from '../types';

export function createCard(id: string, type: 'vocabulary' | 'exercise'): SRSCard {
  return { id, type, interval: 0, easeFactor: 2.5, nextReview: Date.now(), repetitions: 0, lapses: 0 };
}

export function updateCard(card: SRSCard, rating: SRSRating): SRSCard {
  const quality = [0, 2, 4, 5][rating - 1];
  let { interval, easeFactor, repetitions, lapses } = card;

  if (quality >= 3) {
    if (repetitions === 0) interval = 1;
    else if (repetitions === 1) interval = 6;
    else interval = Math.round(interval * easeFactor);
    repetitions += 1;
  } else {
    repetitions = 0;
    interval = 1;
    lapses += 1;
  }

  easeFactor = Math.max(1.3, easeFactor + 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));

  return { ...card, interval, easeFactor, repetitions, lapses, nextReview: Date.now() + interval * 86400000 };
}

export function isDue(card: SRSCard): boolean {
  return Date.now() >= card.nextReview;
}

export function getDueCards(cards: Record<string, SRSCard>): SRSCard[] {
  return Object.values(cards).filter(isDue);
}
