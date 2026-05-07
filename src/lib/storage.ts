import { AppProgress } from '../types';

const KEY = 'dutch-game-progress';

const defaultProgress: AppProgress = {
  cards: {},
  completedLessons: [],
  streak: 0,
  lastSession: 0,
  totalXP: 0,
};

export function loadProgress(): AppProgress {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return defaultProgress;
    return { ...defaultProgress, ...JSON.parse(raw) };
  } catch {
    return defaultProgress;
  }
}

export function saveProgress(progress: AppProgress): void {
  localStorage.setItem(KEY, JSON.stringify(progress));
}

export function resetProgress(): void {
  localStorage.removeItem(KEY);
}
