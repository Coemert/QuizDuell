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
  QuizExport,
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
  currentTeamIndex: number;
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
  importSession: (data: QuizExport) => void;

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
  shufflePlayerTeams: () => void;

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
  currentTeamIndex: 0,
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
  importSession: ({ quizSet, players, teams, teamMode }) =>
    set({ quizSet, players, teams, teamMode }),

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
    const usedColors = new Set(s.teams.map((t) => t.color));
    const autoColor =
      TEAM_COLORS.find((c) => !usedColors.has(c)) ??
      TEAM_COLORS[s.teams.length % TEAM_COLORS.length];
    set({
      teams: [
        ...s.teams,
        { id: uuidv4(), name: `Team ${s.teams.length + 1}`, color: autoColor },
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
  startGame: () => {
    const s = get();
    // Randomise both team turn order and within-team player order each game
    const shuffledTeams   = [...s.teams  ].sort(() => Math.random() - 0.5);
    const shuffledPlayers = [...s.players].sort(() => Math.random() - 0.5);
    set({
      teams:   shuffledTeams,
      players: shuffledPlayers,
      phase: 'game',
      currentPlayerIndex: 0,
      currentTeamIndex: 0,
      scoreHistory: [],
      activeQuestion: null,
      questionPhase: null,
    });
  },

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

    const team = currentPlayer ? s.getPlayerTeam(currentPlayer.id) : undefined;
    const newEntry: ScoreEntry | null = currentPlayer
      ? {
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
        }
      : null;

    // Mark question as answered
    const updatedCategories = s.quizSet.categories.map((c) =>
      c.id === categoryId
        ? {
            ...c,
            questions: c.questions.map((q) =>
              q.id === question.id
                ? {
                    ...q,
                    answered: true,
                    answeredBy: currentPlayer?.id,
                    answeredCorrectly: correct,
                  }
                : q
            ),
          }
        : c
    );

    const isTeamMode = s.teamMode === 'teams' && s.teams.length > 0;
    const nextPlayerIndex = !isTeamMode && currentPlayer
      ? (s.currentPlayerIndex + 1) % Math.max(s.players.length, 1)
      : s.currentPlayerIndex;
    const nextTeamIndex = isTeamMode ? s.currentTeamIndex + 1 : s.currentTeamIndex;

    set({
      scoreHistory: newEntry ? [newEntry, ...s.scoreHistory] : s.scoreHistory,
      quizSet: { ...s.quizSet, categories: updatedCategories },
      activeQuestion: null,
      questionPhase: null,
      currentPlayerIndex: nextPlayerIndex,
      currentTeamIndex: nextTeamIndex,
    });
  },

  dismissQuestion: () =>
    set({ activeQuestion: null, questionPhase: null }),

  nextPlayer: () =>
    set((s) => {
      const isTeamMode = s.teamMode === 'teams' && s.teams.length > 0;
      return {
        currentPlayerIndex: !isTeamMode
          ? (s.currentPlayerIndex + 1) % Math.max(s.players.length, 1)
          : s.currentPlayerIndex,
        currentTeamIndex: isTeamMode ? s.currentTeamIndex + 1 : s.currentTeamIndex,
      };
    }),

  resetGame: () =>
    set((s) => ({
      phase: 'setup',
      scoreHistory: [],
      currentPlayerIndex: 0,
      currentTeamIndex: 0,
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
    if (s.teamMode === 'teams' && s.teams.length > 0) {
      const team = s.teams[s.currentTeamIndex % s.teams.length];
      if (!team) return null;
      const teamPlayers = s.players.filter((p) => p.teamId === team.id);
      if (teamPlayers.length === 0) return null;
      // Rotate through team members using how many times this team has answered
      const teamAnswerCount = s.scoreHistory.filter((e) => e.teamId === team.id).length;
      return teamPlayers[teamAnswerCount % teamPlayers.length] ?? null;
    }
    return s.players[s.currentPlayerIndex % s.players.length] ?? null;
  },

  getPlayerTeam: (playerId) => {
    const s = get();
    const player = s.players.find((p) => p.id === playerId);
    if (!player?.teamId) return undefined;
    return s.teams.find((t) => t.id === player.teamId);
  },

  shufflePlayerTeams: () => {
    const s = get();
    if (s.teams.length === 0) return;
    const n = s.players.length;
    const t = s.teams.length;
    const base   = Math.floor(n / t);
    const extras = n % t;

    // Randomise WHICH teams get the extra player(s) — fair distribution
    const teamOrder = [...s.teams].sort(() => Math.random() - 0.5);
    const slots: string[] = [];
    teamOrder.forEach((team, i) => {
      const count = base + (i < extras ? 1 : 0);
      for (let j = 0; j < count; j++) slots.push(team.id);
    });
    // Shuffle the slot array so players aren't clustered by team
    slots.sort(() => Math.random() - 0.5);

    const shuffled = [...s.players].sort(() => Math.random() - 0.5);
    set({ players: shuffled.map((p, i) => ({ ...p, teamId: slots[i] })) });
  },
}));
