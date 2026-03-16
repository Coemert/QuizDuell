export type AppPhase = 'home' | 'setup' | 'game';
export type SetupTab = 'quiz' | 'players';
export type TeamMode = 'individual' | 'teams';
export type QuestionPhase = 'question' | 'answer';

export interface Question {
  id: string;
  points: number;
  question: string;
  answer: string;
  imageDataUrl?: string; // base64-encoded image (gif/png/jpeg)
  options?: string[];          // up to 4 multiple-choice options
  correctOptionIndex?: number; // index of the correct option (0–3)
  timerSeconds?: number; // overrides default if set
  answered: boolean;
  answeredBy?: string; // player id
  answeredCorrectly?: boolean;
}

export interface Category {
  id: string;
  name: string;
  questions: Question[];
}

export interface QuizSet {
  name: string;
  defaultTimerSeconds: number;
  categories: Category[];
}

export interface Player {
  id: string;
  name: string;
  color: string;
  teamId?: string;
}

export interface Team {
  id: string;
  name: string;
  color: string;
}

export interface ScoreEntry {
  id: string;
  timestamp: number;
  playerId: string;
  playerName: string;
  playerColor: string;
  teamId?: string;
  teamName?: string;
  categoryName: string;
  points: number;
  correct: boolean;
  questionText: string;
}

export interface ActiveQuestion {
  categoryId: string;
  categoryName: string;
  question: Question;
}

export const TEAM_COLORS = [
  '#4f9cf9', // blue
  '#f0b429', // gold
  '#34d399', // green
  '#f87171', // red
  '#a78bfa', // purple
  '#fb923c', // orange
  '#22d3ee', // cyan
  '#f472b6', // pink
];

// A wider palette for individual players
export const PLAYER_COLORS = [
  '#f87171', // red
  '#fb923c', // orange
  '#fbbf24', // amber
  '#a3e635', // lime
  '#34d399', // emerald
  '#22d3ee', // cyan
  '#60a5fa', // blue
  '#a78bfa', // violet
  '#f472b6', // pink
  '#e879f9', // fuchsia
  '#4ade80', // green
  '#f0b429', // gold
];

export const DEFAULT_POINT_VALUES = [100, 200, 300, 400, 500, 600];

export interface QuizExport {
  quizSet: QuizSet;
  players: Player[];
  teams: Team[];
  teamMode: TeamMode;
}
