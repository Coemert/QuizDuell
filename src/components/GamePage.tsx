import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RotateCcw, ChevronRight, PanelRight, PanelRightClose } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import QuestionModal from './QuestionModal';
import ScoreBoard from './ScoreBoard';

export default function GamePage() {
  const quizSet = useGameStore((s) => s.quizSet);
  const players = useGameStore((s) => s.players);
  const teams = useGameStore((s) => s.teams);
  const teamMode = useGameStore((s) => s.teamMode);
  const getCurrentPlayer = useGameStore((s) => s.getCurrentPlayer);
  const selectQuestion = useGameStore((s) => s.selectQuestion);
  const resetGame = useGameStore((s) => s.resetGame);
  const nextPlayer = useGameStore((s) => s.nextPlayer);
  const activeQuestion = useGameStore((s) => s.activeQuestion);
  const scoreHistory = useGameStore((s) => s.scoreHistory);

  const [showScoreBoard, setShowScoreBoard] = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const currentPlayer = getCurrentPlayer();
  const currentTeam = currentPlayer ? teams.find((t) => t.id === currentPlayer.teamId) : undefined;

  // Each category's questions sorted by points; rows are by index, not point value
  const sortedCategories = quizSet.categories.map((cat) => ({
    ...cat,
    questions: [...cat.questions].sort((a, b) => a.points - b.points),
  }));
  const maxQuestions = Math.max(0, ...sortedCategories.map((c) => c.questions.length));

  const totalQuestions = quizSet.categories.reduce((s, c) => s + c.questions.length, 0);
  const answeredCount = quizSet.categories.reduce(
    (s, c) => s + c.questions.filter((q) => q.answered).length,
    0
  );

  function handleCellClick(categoryId: string, questionId: string) {
    if (activeQuestion) return; // prevent double-click
    selectQuestion(categoryId, questionId);
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card/60 backdrop-blur-sm shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-display text-3xl text-gold tracking-wider">
            {quizSet.name || 'Quizduell'}
          </h1>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-elevated border border-border text-xs font-mono text-text-muted">
            {answeredCount}/{totalQuestions} answered
          </div>
        </div>

        {/* Current turn indicator */}
        {currentPlayer && (
          <div
            className="hidden md:flex items-center gap-3 px-4 py-2 rounded-xl border"
            style={{ borderColor: currentTeam?.color ?? currentPlayer.color }}
          >
            <div className="text-xs font-mono text-text-muted uppercase tracking-wider">Turn:</div>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-display text-base shrink-0"
              style={{
                background: currentTeam?.color ?? currentPlayer.color,
                color: 'black',
              }}
            >
              {currentPlayer.name.charAt(0).toUpperCase()}
            </div>
            <span className="font-ui font-semibold text-text-primary">{currentPlayer.name}</span>
            {currentTeam && <span className="text-text-muted text-xs">({currentTeam.name})</span>}
            {players.length > 1 && (
              <button
                onClick={nextPlayer}
                className="p-1 rounded text-text-muted hover:text-gold transition-colors"
                title="Skip to next player"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-elevated text-text-secondary hover:text-text-primary hover:border-gold/30 transition-colors text-sm font-ui"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Setup</span>
          </button>
          <button
            onClick={() => setShowScoreBoard((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-elevated text-text-secondary hover:text-text-primary hover:border-gold/30 transition-colors text-sm font-ui"
          >
            {showScoreBoard ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
            <span className="hidden sm:inline">Scores</span>
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Board */}
        <div className="flex-1 overflow-auto p-4">
          <div
            className="h-full"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${quizSet.categories.length}, minmax(0, 1fr))`,
              gridTemplateRows: `auto repeat(${maxQuestions}, 1fr)`,
              gap: '8px',
              minWidth: `${quizSet.categories.length * 140}px`,
            }}
          >
            {/* Category headers */}
            {quizSet.categories.map((cat, colIdx) => (
              <motion.div
                key={cat.id}
                className="flex items-center justify-center p-3 rounded-xl border border-border bg-elevated text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIdx * 0.05 }}
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
              >
                <span className="font-display text-lg leading-tight text-gold tracking-wide">
                  {cat.name}
                </span>
              </motion.div>
            ))}

            {/* Question cells */}
            {Array.from({ length: maxQuestions }, (_, rowIdx) =>
              sortedCategories.map((cat, colIdx) => {
                const question = cat.questions[rowIdx];
                const isAnswered = question?.answered ?? false;
                const answeredCorrectly = question?.answeredCorrectly;
                const answeredPlayer = question?.answeredBy
                  ? players.find((p) => p.id === question.answeredBy)
                  : null;

                if (!question) {
                  return (
                    <div
                      key={`${cat.id}-${rowIdx}`}
                      className="rounded-xl border border-dashed border-border/40 opacity-30"
                    />
                  );
                }

                return (
                  <motion.button
                    key={question.id}
                    onClick={() => !isAnswered && handleCellClick(cat.id, question.id)}
                    className={`relative flex flex-col items-center justify-center rounded-xl border transition-all duration-200 
                      ${isAnswered
                        ? 'border-border/30 bg-elevated/20 cursor-default opacity-40'
                        : 'board-cell border-border bg-card cursor-pointer hover:border-gold/50 active:scale-95'
                      }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (rowIdx * quizSet.categories.length + colIdx) * 0.02 }}
                    style={{
                      boxShadow: isAnswered
                        ? undefined
                        : 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.2)',
                    }}
                  >
                    {isAnswered ? (
                      <div className="flex flex-col items-center gap-1">
                        <div
                          className={`font-display text-2xl ${answeredCorrectly ? 'text-green' : 'text-red'}`}
                        >
                          {answeredCorrectly ? '✓' : '✗'}
                        </div>
                        {answeredPlayer && (
                          <div className="font-ui text-[10px] text-text-muted text-center leading-tight max-w-full px-1 truncate">
                            {answeredPlayer.name}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span
                        className="font-display text-3xl md:text-4xl select-none"
                        style={{
                          color: '#f0b429',
                          textShadow: '0 0 12px rgba(240,180,41,0.35)',
                        }}
                      >
                        {question.points}
                      </span>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* Scoreboard panel */}
        <AnimatePresence>
          {showScoreBoard && (
            <motion.div
              className="w-64 xl:w-72 border-l border-border bg-card/60 overflow-hidden shrink-0"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.25, ease: 'easeOut' }}
            >
              <ScoreBoard />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Question Modal */}
      <QuestionModal />

      {/* Reset confirm dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl">
            <h2 className="font-display text-2xl text-text-primary mb-2">Back to Setup?</h2>
            <p className="font-ui text-text-secondary text-sm mb-6">
              This will end the current game and clear all scores. Your quiz questions will be kept.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-2.5 rounded-xl border border-border bg-elevated text-text-primary font-ui font-medium text-sm hover:border-gold/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  setShowResetConfirm(false);
                  resetGame();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red/20 border border-red/30 text-red font-ui font-semibold text-sm hover:bg-red/30 transition-colors flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
