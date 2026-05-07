import { useState, useCallback } from 'react';
import { AppProgress, SRSRating, SRSCard } from '../types';
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
      return { ...prev, cards: { ...prev.cards, [cardId]: updated }, totalXP: prev.totalXP + xpGain };
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

  const updateStreak = useCallback(() => {
    updateAndSave(prev => {
      const today = new Date().setHours(0, 0, 0, 0);
      const lastDay = new Date(prev.lastSession).setHours(0, 0, 0, 0);
      const diff = today - lastDay;
      const newStreak = diff <= 86400000 ? prev.streak + 1 : 1;
      return { ...prev, streak: newStreak, lastSession: Date.now() };
    });
  }, [updateAndSave]);

  return { progress, rateCard, getDueReviewCards, getCardForItem, initCardsForLesson, completeLesson, updateStreak };
}
