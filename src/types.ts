export type GameType = 'flashcard' | 'multiple-choice' | 'fill-in-blank' | 'matching' | 'word-order';

export interface VocabularyItem {
  id: string;
  dutch: string;
  translation: string;
  example: string;
  exampleTranslation: string;
  category: string;
  lessonId: string;
}

export interface GrammarExample {
  dutch: string;
  translation: string;
  highlight?: string;
}

export interface GrammarRule {
  id: string;
  title: string;
  explanation: string;
  rule: string;
  examples: GrammarExample[];
  lessonId: string;
  category: 'grammar' | 'spelling' | 'conjunctie' | 'tense' | 'preposition';
}

export interface MultipleChoiceExercise {
  id: string;
  type: 'multiple-choice';
  question: string;
  options: string[];
  answer: string;
  explanation: string;
  lessonId: string;
}

export interface FillInBlankExercise {
  id: string;
  type: 'fill-in-blank';
  sentence: string;
  blank: string;
  hint?: string;
  explanation: string;
  lessonId: string;
}

export interface MatchingExercise {
  id: string;
  type: 'matching';
  pairs: Array<{ left: string; right: string }>;
  lessonId: string;
}

export type Exercise = MultipleChoiceExercise | FillInBlankExercise | MatchingExercise;

export interface Lesson {
  id: string;
  number: number;
  date: string;
  dateDisplay: string;
  theme: string;
  subtheme?: string;
  topics: string[];
  vocabulary: VocabularyItem[];
  grammar: GrammarRule[];
  exercises: Exercise[];
}

export interface SRSCard {
  id: string;
  type: 'vocabulary' | 'exercise';
  interval: number;
  easeFactor: number;
  nextReview: number;
  repetitions: number;
  lapses: number;
}

export interface AppProgress {
  cards: Record<string, SRSCard>;
  completedLessons: string[];
  streak: number;
  lastSession: number;
  totalXP: number;
  xpLog: Record<string, number>; // YYYY-MM-DD → XP earned that day
}

export type LessonTab = 'concepten' | 'woordenschat' | 'oefenen';
export type SRSRating = 1 | 2 | 3 | 4;
