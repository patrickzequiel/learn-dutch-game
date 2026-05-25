import type { Lesson } from '../types';
import les1 from './les1.json';
import les2 from './les2.json';
import les3 from './les3.json';
import les4 from './les4.json';
import les5 from './les5.json';
import conjuncties from './conjuncties.json';
import les6 from './les6.json';
import les7 from './les7.json';
import les8 from './les8.json';
import les9 from './les9.json';
import les10 from './les10.json';
import les11 from './les11.json';
import les12 from './les12.json';

export const ALL_LESSONS: Lesson[] = [
  les1 as unknown as Lesson,
  les2 as unknown as Lesson,
  les3 as unknown as Lesson,
  les4 as unknown as Lesson,
  les5 as unknown as Lesson,
  les6 as unknown as Lesson,
  les7 as unknown as Lesson,
  les8 as unknown as Lesson,
  les9 as unknown as Lesson,
  les10 as unknown as Lesson,
  les11 as unknown as Lesson,
  les12 as unknown as Lesson,
  conjuncties as unknown as Lesson,
];

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
