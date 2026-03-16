import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Eye, Check, XCircle, Clock } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function QuestionModal() {
  const activeQuestion = useGameStore((s) => s.activeQuestion);
  const questionPhase = useGameStore((s) => s.questionPhase);
  const quizSet = useGameStore((s) => s.quizSet);
  const revealAnswer = useGameStore((s) => s.revealAnswer);
  const submitAnswer = useGameStore((s) => s.submitAnswer);
  const dismissQuestion = useGameStore((s) => s.dismissQuestion);
  const getCurrentPlayer = useGameStore((s) => s.getCurrentPlayer);
  const getPlayerTeam = useGameStore((s) => s.getPlayerTeam);

  const timerDuration = activeQuestion?.question.timerSeconds ?? quizSet.defaultTimerSeconds;
  const [timeLeft, setTimeLeft] = useState(timerDuration);
  const [timerRunning, setTimerRunning] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    setTimerRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start timer when question opens
  useEffect(() => {
    if (activeQuestion && questionPhase === 'question') {
      setTimeLeft(timerDuration);
      setTimerRunning(true);
    } else {
      stopTimer();
    }
  }, [activeQuestion?.question.id, questionPhase, timerDuration, stopTimer]);

  // Countdown tick
  useEffect(() => {
    if (!timerRunning) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          stopTimer();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [timerRunning, stopTimer]);

  if (!activeQuestion) return null;

  const currentPlayer = getCurrentPlayer();
  const team = currentPlayer ? getPlayerTeam(currentPlayer.id) : undefined;
  const timerPct = (timeLeft / timerDuration) * 100;
  const isCritical = timeLeft <= 5 && timeLeft > 0 && questionPhase === 'question';
  const isExpired = timeLeft === 0 && questionPhase === 'question';

  function handleReveal() {
    stopTimer();
    revealAnswer();
  }

  const timerColor =
    timerPct > 50 ? '#34d399' : timerPct > 25 ? '#f0b429' : '#f87171';

  return (
    <AnimatePresence>
      {activeQuestion && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Backdrop */}
          <motion.div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          />

          {/* Modal */}
          <motion.div
            className="relative w-full max-w-2xl bg-card border border-border rounded-3xl overflow-hidden"
            initial={{ scale: 0.9, y: 30, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.9, y: 30, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            style={{ boxShadow: '0 0 60px rgba(0,0,0,0.8), 0 0 30px rgba(240,180,41,0.1)' }}
          >
            {/* Timer bar at top */}
            {questionPhase === 'question' && (
              <div className="h-1.5 bg-elevated w-full">
                <motion.div
                  className="h-full rounded-full transition-colors duration-1000"
                  style={{ width: `${timerPct}%`, background: timerColor }}
                  animate={{ width: `${timerPct}%` }}
                  transition={{ duration: 1, ease: 'linear' }}
                />
              </div>
            )}

            <div className="p-8">
              {/* Header */}
              <div className="flex items-start justify-between mb-6">
                <div>
                  <div className="font-mono text-sm text-text-muted uppercase tracking-widest mb-1">
                    {activeQuestion.categoryName}
                  </div>
                  <div
                    className="font-display text-5xl"
                    style={{ color: '#f0b429', textShadow: '0 0 20px rgba(240,180,41,0.4)' }}
                  >
                    {activeQuestion.question.points}
                  </div>
                </div>

                {/* Timer */}
                {questionPhase === 'question' && (
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex items-center gap-2 px-4 py-2 rounded-xl border font-display text-3xl transition-colors ${
                        isCritical
                          ? 'timer-critical border-red/40 bg-red/10'
                          : isExpired
                          ? 'text-red border-red/40 bg-red/10'
                          : 'text-text-primary border-border bg-elevated'
                      }`}
                    >
                      <Clock className="w-5 h-5 mt-0.5" />
                      {timeLeft}
                    </div>
                    <button
                      onClick={dismissQuestion}
                      className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
                    >
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                )}
                {questionPhase === 'answer' && (
                  <button
                    onClick={dismissQuestion}
                    className="p-2 rounded-xl text-text-muted hover:text-text-primary hover:bg-elevated transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>

              {/* Current player */}
              {currentPlayer && (
                <div
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-border mb-6 text-sm font-ui"
                  style={{ borderColor: team?.color ?? currentPlayer.color }}
                >
                  {team && (
                    <div
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: team.color }}
                    />
                  )}
                  <span className="text-text-muted">Answering:</span>
                  <span className="text-text-primary font-semibold">{currentPlayer.name}</span>
                  {team && <span className="text-text-muted">({team.name})</span>}
                </div>
              )}

              {/* Question */}
              <div className="mb-6 p-6 rounded-2xl bg-elevated border border-border min-h-[100px] flex items-center justify-center">
                <p className="font-ui text-xl text-text-primary text-center leading-relaxed">
                  {activeQuestion.question.question || (
                    <span className="text-text-muted italic">No question text provided.</span>
                  )}
                </p>
              </div>

              {/* Answer reveal */}
              <AnimatePresence>
                {questionPhase === 'answer' && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="mb-6 overflow-hidden"
                  >
                    <div className="p-6 rounded-2xl border border-green/30 bg-green/5 min-h-[80px] flex items-center justify-center">
                      <p className="font-ui text-xl text-green text-center leading-relaxed font-semibold">
                        {activeQuestion.question.answer || (
                          <span className="text-text-muted italic">No answer text provided.</span>
                        )}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Action buttons */}
              <div className="flex gap-3">
                {questionPhase === 'question' && (
                  <motion.button
                    onClick={handleReveal}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-ui font-semibold text-base
                      bg-blue text-white hover:bg-blue/80 transition-colors"
                    style={{ boxShadow: '0 0 16px rgba(79,156,249,0.3)' }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Eye className="w-5 h-5" />
                    Reveal Answer
                  </motion.button>
                )}

                {questionPhase === 'answer' && (
                  <>
                    <motion.button
                      onClick={() => submitAnswer(false)}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-ui font-semibold text-base
                        bg-red/20 text-red border border-red/30 hover:bg-red/30 transition-colors"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <XCircle className="w-5 h-5" />
                      Wrong
                    </motion.button>
                    <motion.button
                      onClick={() => submitAnswer(true)}
                      className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-ui font-semibold text-base
                        bg-green text-black hover:bg-green/80 transition-colors"
                      style={{ boxShadow: '0 0 16px rgba(52,211,153,0.3)' }}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      <Check className="w-5 h-5" />
                      Correct
                    </motion.button>
                  </>
                )}
              </div>

              {isExpired && questionPhase === 'question' && (
                <motion.p
                  className="text-center text-red font-ui text-sm mt-4"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  ⏱ Time's up! You can still reveal the answer.
                </motion.p>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
