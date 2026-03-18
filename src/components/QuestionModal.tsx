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
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [autoResult, setAutoResult] = useState<boolean | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopTimer = useCallback(() => {
    setTimerRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  // Start timer when question opens; reset selection
  useEffect(() => {
    if (activeQuestion && questionPhase === 'question') {
      setTimeLeft(timerDuration);
      setTimerRunning(true);
      setSelectedOptionIndex(null);
      setAutoResult(null);
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

  function handleOptionClick(idx: number) {
    if (questionPhase !== 'question') return;
    const correct = idx === activeQuestion?.question.correctOptionIndex;
    setSelectedOptionIndex(idx);
    setAutoResult(correct);
    stopTimer();
    revealAnswer();
  }

  const timerColor =
    timerPct > 50 ? '#34d399' : timerPct > 25 ? '#f0b429' : '#f87171';

  return (
    <AnimatePresence>
      {activeQuestion && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Modal */}
          <motion.div
            className="relative w-full max-w-3xl bg-card border border-border rounded-3xl overflow-hidden"
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
              <div className="mb-6 p-6 rounded-2xl bg-elevated border border-border min-h-[100px] flex flex-col items-center justify-center gap-4">
                {activeQuestion.question.imageDataUrl && (
                  <img
                    src={activeQuestion.question.imageDataUrl}
                    alt="Question"
                    className="max-h-64 max-w-full rounded-xl object-contain"
                  />
                )}
                <p className="font-ui text-xl text-text-primary text-center leading-relaxed">
                  {activeQuestion.question.question || (
                    <span className="text-text-muted italic">No question text provided.</span>
                  )}
                </p>
              </div>

              {/* Selection options */}
              {activeQuestion.question.options && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                  {activeQuestion.question.options.map((opt, idx) => {
                    const isCorrect = idx === activeQuestion.question.correctOptionIndex;
                    const isSelected = idx === selectedOptionIndex;
                    const revealed = questionPhase === 'answer';

                    let containerCls = 'flex items-center gap-3 p-4 rounded-xl border transition-all ';
                    let labelCls = 'w-7 h-7 rounded-lg flex items-center justify-center font-display text-sm shrink-0 border ';
                    let textCls = 'font-ui text-sm leading-snug ';

                    if (!revealed) {
                      containerCls += 'bg-elevated border-border hover:border-gold/50 hover:bg-elevated/80 cursor-pointer';
                      labelCls += 'bg-base border-border text-gold';
                      textCls += 'text-text-primary';
                    } else if (isCorrect) {
                      containerCls += 'bg-green/10 border-green/50';
                      labelCls += 'bg-green/20 border-green/50 text-green';
                      textCls += 'text-green font-semibold';
                    } else if (isSelected) {
                      containerCls += 'bg-red/10 border-red/40';
                      labelCls += 'bg-red/20 border-red/40 text-red';
                      textCls += 'text-red';
                    } else {
                      containerCls += 'bg-elevated/30 border-border opacity-30';
                      labelCls += 'bg-base border-border text-text-muted';
                      textCls += 'text-text-muted';
                    }

                    return (
                      <motion.div
                        key={idx}
                        onClick={() => handleOptionClick(idx)}
                        animate={revealed && isCorrect ? { scale: [1, 1.04, 1] } : {}}
                        transition={{ duration: 0.35 }}
                        className={containerCls}
                      >
                        <span className={labelCls}>{['A', 'B', 'C', 'D'][idx]}</span>
                        <span className={textCls}>
                          {opt || <span className="italic opacity-50">Empty</span>}
                        </span>
                        {revealed && isCorrect && <Check className="w-4 h-4 text-green ml-auto shrink-0" />}
                        {revealed && isSelected && !isCorrect && <XCircle className="w-4 h-4 text-red ml-auto shrink-0" />}
                      </motion.div>
                    );
                  })}
                </div>
              )}

              {/* Answer reveal — plain text only (no MC options) */}
              <AnimatePresence>
                {questionPhase === 'answer' && !activeQuestion.question.options && (
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
                {questionPhase === 'question' && !activeQuestion.question.options && (
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

                {questionPhase === 'answer' && activeQuestion.question.options && (
                  <motion.button
                    onClick={() => submitAnswer(autoResult ?? false)}
                    className="flex-1 flex items-center justify-center gap-2 py-3.5 rounded-xl font-ui font-semibold text-base
                      bg-elevated border border-border text-text-primary hover:bg-card transition-colors"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <X className="w-5 h-5" />
                    Close
                  </motion.button>
                )}

                {questionPhase === 'answer' && !activeQuestion.question.options && (
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
