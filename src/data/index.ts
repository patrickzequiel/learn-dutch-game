import { les1 } from './les1';
import { les2 } from './les2';
import { les5 } from './les5';
import { conjuncties } from './conjuncties';
import { Lesson } from '../types';

export const ALL_LESSONS: Lesson[] = [les1, les2, les5, conjuncties];

export function getLessonById(id: string): Lesson | undefined {
  return ALL_LESSONS.find(l => l.id === id);
}

export function getAllVocabulary() {
  return ALL_LESSONS.flatMap(l => l.vocabulary);
}

export function getAllGrammar() {
  return ALL_LESSONS.flatMap(l => l.grammar);
}

export function getAllExercises() {
  return ALL_LESSONS.flatMap(l => l.exercises);
}
