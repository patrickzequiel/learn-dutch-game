import { useState, useCallback } from 'react';
import type { AppProgress, SRSRating, SRSCard, VocabularyItem } from '../types';
import { loadProgress, saveProgress } from '../lib/storage';
import { createCard, updateCard, getDueCards } from '../lib/srs';
import { getAllVocabulary, getAllExercises } from '../data';

export function useProgress() {
  const [progress, setProgress] = useState<AppProgress>(loadProgress);

  const updateAndSave = useCallback((updater: (p: AppProgress) => AppProgress) => {
    setProgress(prev => {
      const next = updater(prev);
      saveProgress(next);
      return next;
    });
  }, []);

  const rateCard = useCallback((cardId: string, rating: SRSRating, type: 'vocabulary' | 'exercise') => {
    updateAndSave(prev => {
      const existing = prev.cards[cardId] ?? createCard(cardId, type);
      const updated = updateCard(existing, rating);
      const xpGain = rating >= 3 ? 10 : 2;
      const today = new Date().toISOString().slice(0, 10);
      const xpLog = { ...(prev.xpLog ?? {}), [today]: ((prev.xpLog ?? {})[today] ?? 0) + xpGain };
      return { ...prev, cards: { ...prev.cards, [cardId]: updated }, totalXP: prev.totalXP + xpGain, xpLog };
    });
  }, [updateAndSave]);

  const getDueReviewCards = useCallback((): SRSCard[] => {
    return getDueCards(progress.cards);
  }, [progress.cards]);

  const getCardForItem = useCallback((id: string, type: 'vocabulary' | 'exercise'): SRSCard => {
    return progress.cards[id] ?? createCard(id, type);
  }, [progress.cards]);

  const initCardsForLesson = useCallback((lessonId: string) => {
    const vocab = getAllVocabulary().filter(v => v.lessonId === lessonId);
    const exercises = getAllExercises().filter(e => e.lessonId === lessonId);
    updateAndSave(prev => {
      const newCards = { ...prev.cards };
      for (const v of vocab) {
        if (!newCards[v.id]) newCards[v.id] = createCard(v.id, 'vocabulary');
      }
      for (const e of exercises) {
        if (!newCards[e.id]) newCards[e.id] = createCard(e.id, 'exercise');
      }
      return { ...prev, cards: newCards };
    });
  }, [updateAndSave]);

  const completeLesson = useCallback((lessonId: string) => {
    updateAndSave(prev => ({
      ...prev,
      completedLessons: prev.completedLessons.includes(lessonId)
        ? prev.completedLessons
        : [...prev.completedLessons, lessonId],
    }));
  }, [updateAndSave]);

  // Fixed: only increment streak once per calendar day
  const updateStreak = useCallback(() => {
    updateAndSave(prev => {
      const todayStr = new Date().toDateString();
      const lastStr = new Date(prev.lastSession).toDateString();
      if (todayStr === lastStr) {
        return { ...prev, lastSession: Date.now() };
      }
      const todayMs = new Date().setHours(0, 0, 0, 0);
      const lastMs = new Date(prev.lastSession).setHours(0, 0, 0, 0);
      const diffDays = (todayMs - lastMs) / 86400000;
      const newStreak = diffDays <= 1 ? prev.streak + 1 : 1;
      return { ...prev, streak: newStreak, lastSession: Date.now() };
    });
  }, [updateAndSave]);

  const getWeakVocabItems = useCallback((): VocabularyItem[] => {
    return getAllVocabulary().filter(v => {
      const card = progress.cards[v.id];
      return card && (card.lapses >= 2 || card.easeFactor < 2.0);
    });
  }, [progress.cards]);

  return {
    progress,
    rateCard,
    getDueReviewCards,
    getCardForItem,
    initCardsForLesson,
    completeLesson,
    updateStreak,
    getWeakVocabItems,
  };
}
