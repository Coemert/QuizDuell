import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';
import type {
  AppPhase,
  TeamMode,
  QuizSet,
  Category,
  Question,
  Player,
  Team,
  ScoreEntry,
  ActiveQuestion,
  QuestionPhase,
} from '../types';
import { DEFAULT_POINT_VALUES, TEAM_COLORS, PLAYER_COLORS } from '../types';

function createDefaultQuizSet(): QuizSet {
  return {
    name: 'My Quiz',
    defaultTimerSeconds: 30,
    categories: [
      createCategory('Category 1'),
      createCategory('Category 2'),
      createCategory('Category 3'),
    ],
  };
}

function createCategory(name: string): Category {
  return {
    id: uuidv4(),
    name,
    questions: DEFAULT_POINT_VALUES.map((points) => createQuestion(points)),
  };
}

function createQuestion(points: number): Question {
  return {
    id: uuidv4(),
    points,
    question: '',
    answer: '',
    answered: false,
  };
}

interface GameStore {
  // Navigation
  phase: AppPhase;
  setupTab: 'quiz' | 'players';

  // Quiz setup
  quizSet: QuizSet;

  // Player/Team setup
  teamMode: TeamMode;
  players: Player[];
  teams: Team[];

  // Game state
  currentPlayerIndex: number;
  scoreHistory: ScoreEntry[];
  activeQuestion: ActiveQuestion | null;
  questionPhase: QuestionPhase | null;

  // --- Navigation ---
  setPhase: (phase: AppPhase) => void;
  setSetupTab: (tab: 'quiz' | 'players') => void;

  // --- Quiz Editor ---
  setQuizSet: (quiz: QuizSet) => void;
  setQuizName: (name: string) => void;
  setTimerSeconds: (s: number) => void;
  addCategory: () => void;
  removeCategory: (id: string) => void;
  updateCategoryName: (id: string, name: string) => void;
  updateQuestion: (categoryId: string, questionId: string, patch: Partial<Question>) => void;
  addQuestionToCategory: (categoryId: string) => void;
  removeQuestionFromCategory: (categoryId: string, questionId: string) => void;
  importQuizSet: (quiz: QuizSet) => void;

  // --- Player/Team setup ---
  setTeamMode: (mode: TeamMode) => void;
  addPlayer: (name: string, teamId?: string, color?: string) => void;
  removePlayer: (id: string) => void;
  updatePlayerName: (id: string, name: string) => void;
  updatePlayerColor: (id: string, color: string) => void;
  assignPlayerTeam: (playerId: string, teamId: string | undefined) => void;
  addTeam: () => void;
  removeTeam: (id: string) => void;
  updateTeamName: (id: string, name: string) => void;

  // --- Game Actions ---
  startGame: () => void;
  selectQuestion: (categoryId: string, questionId: string) => void;
  revealAnswer: () => void;
  submitAnswer: (correct: boolean) => void;
  dismissQuestion: () => void;
  nextPlayer: () => void;
  resetGame: () => void;

  // --- Computed ---
  getPlayerScore: (playerId: string) => number;
  getTeamScore: (teamId: string) => number;
  getCurrentPlayer: () => Player | null;
  getPlayerTeam: (playerId: string) => Team | undefined;
}

export const useGameStore = create<GameStore>((set, get) => ({
  phase: 'home',
  setupTab: 'quiz',
  quizSet: createDefaultQuizSet(),
  teamMode: 'individual',
  players: [],
  teams: [],
  currentPlayerIndex: 0,
  scoreHistory: [],
  activeQuestion: null,
  questionPhase: null,

  // Navigation
  setPhase: (phase) => set({ phase }),
  setSetupTab: (setupTab) => set({ setupTab }),

  // Quiz Editor
  setQuizSet: (quizSet) => set({ quizSet }),
  setQuizName: (name) =>
    set((s) => ({ quizSet: { ...s.quizSet, name } })),
  setTimerSeconds: (defaultTimerSeconds) =>
    set((s) => ({ quizSet: { ...s.quizSet, defaultTimerSeconds } })),

  addCategory: () =>
    set((s) => ({
      quizSet: {
        ...s.quizSet,
        categories: [...s.quizSet.categories, createCategory(`Category ${s.quizSet.categories.length + 1}`)],
      },
    })),

  removeCategory: (id) =>
    set((s) => ({
      quizSet: {
        ...s.quizSet,
        categories: s.quizSet.categories.filter((c) => c.id !== id),
      },
    })),

  updateCategoryName: (id, name) =>
    set((s) => ({
      quizSet: {
        ...s.quizSet,
        categories: s.quizSet.categories.map((c) =>
          c.id === id ? { ...c, name } : c
        ),
      },
    })),

  updateQuestion: (categoryId, questionId, patch) =>
    set((s) => ({
      quizSet: {
        ...s.quizSet,
        categories: s.quizSet.categories.map((c) =>
          c.id === categoryId
            ? {
                ...c,
                questions: c.questions.map((q) =>
                  q.id === questionId ? { ...q, ...patch } : q
                ),
              }
            : c
        ),
      },
    })),

  addQuestionToCategory: (categoryId) => {
    const cat = get().quizSet.categories.find((c) => c.id === categoryId);
    if (!cat) return;
    const usedPoints = cat.questions.map((q) => q.points);
    const nextPoints = Math.max(...usedPoints, 0) + 100;
    set((s) => ({
      quizSet: {
        ...s.quizSet,
        categories: s.quizSet.categories.map((c) =>
          c.id === categoryId
            ? { ...c, questions: [...c.questions, createQuestion(nextPoints)] }
            : c
        ),
      },
    }));
  },

  removeQuestionFromCategory: (categoryId, questionId) =>
    set((s) => ({
      quizSet: {
        ...s.quizSet,
        categories: s.quizSet.categories.map((c) =>
          c.id === categoryId
            ? { ...c, questions: c.questions.filter((q) => q.id !== questionId) }
            : c
        ),
      },
    })),

  importQuizSet: (quiz) => set({ quizSet: quiz }),

  // Player/Team
  setTeamMode: (teamMode) => set({ teamMode }),

  addPlayer: (name, teamId, color) => {
    const s = get();
    const usedColors = s.players.map((p) => p.color);
    const autoColor =
      color ?? PLAYER_COLORS.find((c) => !usedColors.includes(c)) ?? PLAYER_COLORS[s.players.length % PLAYER_COLORS.length];
    set({ players: [...s.players, { id: uuidv4(), name, color: autoColor, teamId }] });
  },

  removePlayer: (id) =>
    set((s) => ({ players: s.players.filter((p) => p.id !== id) })),

  updatePlayerName: (id, name) =>
    set((s) => ({
      players: s.players.map((p) => (p.id === id ? { ...p, name } : p)),
    })),

  updatePlayerColor: (id, color) =>
    set((s) => ({
      players: s.players.map((p) => (p.id === id ? { ...p, color } : p)),
    })),

  assignPlayerTeam: (playerId, teamId) =>
    set((s) => ({
      players: s.players.map((p) => (p.id === playerId ? { ...p, teamId } : p)),
    })),

  addTeam: () => {
    const s = get();
    const colorIndex = s.teams.length % TEAM_COLORS.length;
    set({
      teams: [
        ...s.teams,
        { id: uuidv4(), name: `Team ${s.teams.length + 1}`, color: TEAM_COLORS[colorIndex] },
      ],
    });
  },

  removeTeam: (id) =>
    set((s) => ({
      teams: s.teams.filter((t) => t.id !== id),
      players: s.players.map((p) => (p.teamId === id ? { ...p, teamId: undefined } : p)),
    })),

  updateTeamName: (id, name) =>
    set((s) => ({
      teams: s.teams.map((t) => (t.id === id ? { ...t, name } : t)),
    })),

  // Game
  startGame: () =>
    set({
      phase: 'game',
      currentPlayerIndex: 0,
      scoreHistory: [],
      activeQuestion: null,
      questionPhase: null,
    }),

  selectQuestion: (categoryId, questionId) => {
    const s = get();
    const cat = s.quizSet.categories.find((c) => c.id === categoryId);
    if (!cat) return;
    const question = cat.questions.find((q) => q.id === questionId);
    if (!question || question.answered) return;
    set({
      activeQuestion: { categoryId, categoryName: cat.name, question },
      questionPhase: 'question',
    });
  },

  revealAnswer: () => set({ questionPhase: 'answer' }),

  submitAnswer: (correct) => {
    const s = get();
    if (!s.activeQuestion) return;
    const { categoryId, categoryName, question } = s.activeQuestion;
    const currentPlayer = s.getCurrentPlayer();
    if (!currentPlayer) return;

    const team = s.getPlayerTeam(currentPlayer.id);
    const entry: ScoreEntry = {
      id: uuidv4(),
      timestamp: Date.now(),
      playerId: currentPlayer.id,
      playerName: currentPlayer.name,
      playerColor: currentPlayer.color,
      teamId: team?.id,
      teamName: team?.name,
      categoryName,
      points: question.points,
      correct,
      questionText: question.question,
    };

    // Mark question as answered
    const updatedCategories = s.quizSet.categories.map((c) =>
      c.id === categoryId
        ? {
            ...c,
            questions: c.questions.map((q) =>
              q.id === question.id
                ? { ...q, answered: true, answeredBy: currentPlayer.id, answeredCorrectly: correct }
                : q
            ),
          }
        : c
    );

    // Advance to next player
    const nextIndex = (s.currentPlayerIndex + 1) % Math.max(s.players.length, 1);

    set({
      scoreHistory: [entry, ...s.scoreHistory],
      quizSet: { ...s.quizSet, categories: updatedCategories },
      activeQuestion: null,
      questionPhase: null,
      currentPlayerIndex: nextIndex,
    });
  },

  dismissQuestion: () =>
    set({ activeQuestion: null, questionPhase: null }),

  nextPlayer: () =>
    set((s) => ({
      currentPlayerIndex: (s.currentPlayerIndex + 1) % Math.max(s.players.length, 1),
    })),

  resetGame: () =>
    set((s) => ({
      phase: 'setup',
      scoreHistory: [],
      currentPlayerIndex: 0,
      activeQuestion: null,
      questionPhase: null,
      // Reset answered flags
      quizSet: {
        ...s.quizSet,
        categories: s.quizSet.categories.map((c) => ({
          ...c,
          questions: c.questions.map((q) => ({
            ...q,
            answered: false,
            answeredBy: undefined,
            answeredCorrectly: undefined,
          })),
        })),
      },
    })),

  // Computed
  getPlayerScore: (playerId) =>
    get()
      .scoreHistory.filter((e) => e.playerId === playerId && e.correct)
      .reduce((sum, e) => sum + e.points, 0),

  getTeamScore: (teamId) =>
    get()
      .scoreHistory.filter((e) => e.teamId === teamId && e.correct)
      .reduce((sum, e) => sum + e.points, 0),

  getCurrentPlayer: () => {
    const s = get();
    if (s.players.length === 0) return null;
    return s.players[s.currentPlayerIndex % s.players.length] ?? null;
  },

  getPlayerTeam: (playerId) => {
    const s = get();
    const player = s.players.find((p) => p.id === playerId);
    if (!player?.teamId) return undefined;
    return s.teams.find((t) => t.id === player.teamId);
  },
}));
