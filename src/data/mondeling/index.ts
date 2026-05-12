import type { Lesson, VocabularyItem } from '../../types';
import natuur from './natuur.json';
import zorgen from './zorgen.json';
import uitstap from './uitstap.json';
import phrases from './phrases.json';

export const MONDELING_LESSONS: Lesson[] = [
  natuur as unknown as Lesson,
  zorgen as unknown as Lesson,
  uitstap as unknown as Lesson,
  phrases as unknown as Lesson,
];

export function getMondelingLessonById(id: string): Lesson | undefined {
  return MONDELING_LESSONS.find(l => l.id === id);
}

export function getAllMondelingVocabulary(): VocabularyItem[] {
  return MONDELING_LESSONS.flatMap(l => l.vocabulary);
}
