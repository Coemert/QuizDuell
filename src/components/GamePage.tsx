import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Settings, RotateCcw, ChevronRight, PanelRight, PanelRightClose, Undo2 } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import QuestionModal from './QuestionModal';
import ScoreBoard from './ScoreBoard';
import VictoryScreen from './VictoryScreen';

interface PendingCell {
  categoryId: string;
  questionId: string;
  categoryName: string;
  points: number;
  hasOptions: boolean;
}

export default function GamePage() {
  const quizSet          = useGameStore((s) => s.quizSet);
  const players          = useGameStore((s) => s.players);
  const teams            = useGameStore((s) => s.teams);
  const teamMode         = useGameStore((s) => s.teamMode);
  const getCurrentPlayer = useGameStore((s) => s.getCurrentPlayer);
  const selectQuestion   = useGameStore((s) => s.selectQuestion);
  const resetGame        = useGameStore((s) => s.resetGame);
  const nextPlayer       = useGameStore((s) => s.nextPlayer);
  const activeQuestion   = useGameStore((s) => s.activeQuestion);
  const scoreHistory     = useGameStore((s) => s.scoreHistory);
  const undoLastAnswer   = useGameStore((s) => s.undoLastAnswer);

  const [showScoreBoard,   setShowScoreBoard]   = useState(true);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showVictory,      setShowVictory]      = useState(false);
  const [pendingCell,      setPendingCell]      = useState<PendingCell | null>(null);

  const currentPlayer = getCurrentPlayer();
  const currentTeam   = currentPlayer ? teams.find((t) => t.id === currentPlayer.teamId) : undefined;

  const sortedCategories = quizSet.categories.map((cat) => ({
    ...cat,
    questions: [...cat.questions].sort((a, b) => a.points - b.points),
  }));
  const maxQuestions   = Math.max(0, ...sortedCategories.map((c) => c.questions.length));
  const totalQuestions = quizSet.categories.reduce((s, c) => s + c.questions.length, 0);
  const answeredCount  = quizSet.categories.reduce(
    (s, c) => s + c.questions.filter((q) => q.answered).length, 0,
  );

  // Trigger victory screen once ALL questions are answered (after modal closes)
  useEffect(() => {
    if (totalQuestions > 0 && answeredCount === totalQuestions && !activeQuestion) {
      const t = setTimeout(() => setShowVictory(true), 900);
      return () => clearTimeout(t);
    }
  }, [answeredCount, totalQuestions, activeQuestion]);

  function handleCellClick(categoryId: string, questionId: string) {
    if (activeQuestion) return;
    const cat = quizSet.categories.find((c) => c.id === categoryId);
    const q   = cat?.questions.find((q) => q.id === questionId);
    if (!cat || !q) return;
    setPendingCell({
      categoryId,
      questionId,
      categoryName: cat.name,
      points:       q.points,
      hasOptions:   (q.options?.length ?? 0) > 0,
    });
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      {/* ── Top bar ──────────────────────────────────────────── */}
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-border bg-card/60 backdrop-blur-sm shrink-0 gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <h1 className="font-display text-2xl md:text-3xl text-gold tracking-wider truncate">
            {quizSet.name || 'Quizduell'}
          </h1>
          <div className="hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-elevated border border-border text-xs font-mono text-text-muted shrink-0">
            {answeredCount}/{totalQuestions}
          </div>
        </div>

        {/* Current turn — hidden on small screens, shown in scoreboard instead */}
        {currentPlayer && (
          <div
            className="hidden lg:flex items-center gap-3 px-4 py-2 rounded-xl border shrink-0"
            style={{ borderColor: currentTeam?.color ?? currentPlayer.color }}
          >
            <div className="text-xs font-mono text-text-muted uppercase tracking-wider">Turn:</div>
            <div
              className="w-7 h-7 rounded-full flex items-center justify-center font-display text-base shrink-0"
              style={{ background: currentTeam?.color ?? currentPlayer.color, color: 'black' }}
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

        <div className="flex items-center gap-2 shrink-0">
          {scoreHistory.length > 0 && (
            <button
              onClick={undoLastAnswer}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-elevated
                text-text-secondary hover:text-gold hover:border-gold/30 transition-colors text-sm font-ui"
              title={`Undo: ${scoreHistory[0].playerName} — ${scoreHistory[0].categoryName} ${scoreHistory[0].points}pts`}
            >
              <Undo2 className="w-4 h-4" />
              <span className="hidden sm:inline">Undo</span>
            </button>
          )}
          <button
            onClick={() => setShowResetConfirm(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-elevated
              text-text-secondary hover:text-text-primary hover:border-gold/30 transition-colors text-sm font-ui"
          >
            <Settings className="w-4 h-4" />
            <span className="hidden sm:inline">Setup</span>
          </button>
          <button
            onClick={() => setShowScoreBoard((v) => !v)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-border bg-elevated
              text-text-secondary hover:text-text-primary hover:border-gold/30 transition-colors text-sm font-ui"
          >
            {showScoreBoard ? <PanelRightClose className="w-4 h-4" /> : <PanelRight className="w-4 h-4" />}
            <span className="hidden sm:inline">Scores</span>
          </button>
        </div>
      </div>

      {/* ── Main layout ──────────────────────────────────────── */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Board */}
        <div className="flex-1 overflow-auto p-3 md:p-4">
          <div
            className="h-full"
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${quizSet.categories.length}, minmax(0, 1fr))`,
              gridTemplateRows:    `auto repeat(${maxQuestions}, 1fr)`,
              gap:                 '8px',
              minWidth:            `${quizSet.categories.length * 130}px`,
            }}
          >
            {/* Category headers */}
            {quizSet.categories.map((cat, colIdx) => (
              <motion.div
                key={cat.id}
                className="flex items-center justify-center p-2 md:p-3 rounded-xl border border-border bg-elevated text-center"
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: colIdx * 0.05 }}
                style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
              >
                <span className="font-display text-base md:text-lg leading-tight text-gold tracking-wide">
                  {cat.name}
                </span>
              </motion.div>
            ))}

            {/* Question cells */}
            {Array.from({ length: maxQuestions }, (_, rowIdx) =>
              sortedCategories.map((cat, colIdx) => {
                const question       = cat.questions[rowIdx];
                const isAnswered     = question?.answered ?? false;
                const answeredPlayer = question?.answeredBy
                  ? players.find((p) => p.id === question.answeredBy)
                  : null;

                // Border tint: team color in team mode, player color in individual mode
                const answerColor = answeredPlayer
                  ? teamMode === 'teams'
                    ? teams.find((t) => t.id === answeredPlayer.teamId)?.color ?? answeredPlayer.color
                    : answeredPlayer.color
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
                    className={`relative flex flex-col items-center justify-center rounded-xl border-2 transition-all duration-200
                      ${isAnswered
                        ? 'bg-elevated/10 cursor-default'
                        : 'board-cell border-border bg-card cursor-pointer hover:border-gold/50 active:scale-95'
                      }`}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: (rowIdx * quizSet.categories.length + colIdx) * 0.02 }}
                    style={{
                      opacity:     isAnswered ? 0.62 : 1,
                      borderColor: isAnswered
                        ? (answerColor ?? 'rgba(30,48,88,0.35)')
                        : undefined,
                      boxShadow: isAnswered && answerColor
                        ? `0 0 10px ${answerColor}35, inset 0 0 8px ${answerColor}14`
                        : !isAnswered
                        ? 'inset 0 1px 0 rgba(255,255,255,0.04), inset 0 -1px 0 rgba(0,0,0,0.2)'
                        : undefined,
                    }}
                  >
                    {isAnswered ? (
                      <div className="flex flex-col items-center gap-1 px-1">
                        <div className={`font-display text-4xl md:text-5xl ${question.answeredCorrectly ? 'text-green' : 'text-red'}`}>
                          {question.answeredCorrectly ? '✓' : '✗'}
                        </div>
                        {answeredPlayer && (
                          <div className="font-ui text-sm md:text-base text-text-muted text-center leading-tight max-w-full truncate">
                            {answeredPlayer.name}
                          </div>
                        )}
                      </div>
                    ) : (
                      <>
                        {question.options && question.options.length > 0 && (
                          <span className="absolute top-1.5 right-1.5 font-mono text-[9px] font-bold tracking-wider
                            text-gold/70 bg-gold/10 rounded px-1 py-0.5 leading-none pointer-events-none">
                            SELECT
                          </span>
                        )}
                        <span
                          className="font-display text-3xl md:text-4xl select-none"
                          style={{ color: '#f0b429', textShadow: '0 0 12px rgba(240,180,41,0.35)' }}
                        >
                          {question.points}
                        </span>
                      </>
                    )}
                  </motion.button>
                );
              })
            )}
          </div>
        </div>

        {/* ── Scoreboard ─────────────────────────────────────── */}
        {/* On lg+: in-flow side panel. Below lg: fixed overlay that doesn't affect board width. */}
        <AnimatePresence>
          {showScoreBoard && (
            <>
              {/* Mobile/tablet: tap-outside backdrop */}
              <motion.div
                className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setShowScoreBoard(false)}
              />

              <motion.div
                className={[
                  /* small screens: fixed overlay */
                  'fixed right-0 top-0 bottom-0 w-72 z-40',
                  /* lg+: in-flow side panel */
                  'lg:relative lg:z-auto lg:w-64 xl:w-72',
                  /* shared */
                  'bg-card/97 lg:bg-card/60 backdrop-blur-md lg:backdrop-blur-none',
                  'border-l border-border overflow-hidden shrink-0',
                ].join(' ')}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 40 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
              >
                <ScoreBoard />
              </motion.div>
            </>
          )}
        </AnimatePresence>
      </div>

      {/* ── Modals ───────────────────────────────────────────── */}
      <QuestionModal />

      {/* Victory screen */}
      <AnimatePresence>
        {showVictory && (
          <VictoryScreen
            onClose={() => setShowVictory(false)}
            onPlayAgain={() => { setShowVictory(false); resetGame(); }}
          />
        )}
      </AnimatePresence>

      {/* Question confirm */}
      <AnimatePresence>
        {pendingCell && (
          <motion.div
            className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl"
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1,    opacity: 1 }}
              exit={{    scale: 0.92, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            >
              <div className="font-mono text-2xl text-text-muted uppercase tracking-widest mb-1" style={{textAlign: 'center'}}>
                {pendingCell.categoryName}
                {pendingCell.hasOptions && (
                  <span className="ml-2 text-gold/70 bg-gold/10 px-1.5 py-0.5 rounded text-[9px] font-bold">MC</span>
                )}
              </div>
              <div
                className="font-display text-6xl mb-3"
                style={{ color: '#f0b429', textAlign: 'center' }}
              >
                {pendingCell.points}
              </div>
              {currentPlayer && (
                <p className="font-ui text-text-secondary text-sm mb-5" style={{textAlign: 'center'}}>
                  Opening for{' '}
                  <span
                    className="font-semibold"
                    style={{ color: currentTeam?.color ?? currentPlayer.color }}
                  >
                    {currentPlayer.name}
                  </span>
                  {currentTeam && <span className="text-text-muted"> ({currentTeam.name})</span>}
                </p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={() => setPendingCell(null)}
                  className="flex-1 py-3 rounded-xl border border-border bg-elevated text-text-primary font-ui font-medium text-sm
                    hover:border-gold/30 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    selectQuestion(pendingCell.categoryId, pendingCell.questionId);
                    setPendingCell(null);
                  }}
                  className="flex-1 py-3 rounded-xl bg-gold text-black font-ui font-semibold text-sm
                    hover:brightness-110 transition-all"
                >
                  Show Question
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset confirm */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-card border border-border rounded-2xl p-6 max-w-sm w-full shadow-2xl">
            <h2 className="font-display text-2xl text-text-primary mb-2">Back to Setup?</h2>
            <p className="font-ui text-text-secondary text-sm mb-6">
              This will end the current game and clear all scores. Your quiz questions will be kept.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-3 rounded-xl border border-border bg-elevated text-text-primary font-ui font-medium text-sm hover:border-gold/30 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => { setShowResetConfirm(false); resetGame(); }}
                className="flex-1 py-3 rounded-xl bg-red/20 border border-red/30 text-red font-ui font-semibold text-sm hover:bg-red/30 transition-colors flex items-center justify-center gap-2"
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
