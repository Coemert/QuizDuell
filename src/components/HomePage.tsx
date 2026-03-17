import { useRef, useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Plus, Upload, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { QuizSet, QuizExport } from '../types';

const KONAMI = [
  'ArrowUp','ArrowUp','ArrowDown','ArrowDown',
  'ArrowLeft','ArrowRight','ArrowLeft','ArrowRight',
  'b','a',
];

const EASTER_MESSAGES = [
  '(╯°□°）╯︵ ┻━┻  Secret unlocked! 7 clicks of glory!',
  '🎮 KONAMI CODE ACTIVATED — you win the internet!',
];

export default function HomePage() {
  const setPhase      = useGameStore((s) => s.setPhase);
  const importQuizSet = useGameStore((s) => s.importQuizSet);
  const importSession = useGameStore((s) => s.importSession);
  const fileRef       = useRef<HTMLInputElement>(null);

  // ── Easter egg: logo click × 7 ─────────────────────────────
  const [logoClicks,    setLogoClicks]    = useState(0);
  const [easterMsg,     setEasterMsg]     = useState('');
  const [showEaster,    setShowEaster]    = useState(false);
  const logoResetTimer  = useRef<ReturnType<typeof setTimeout>>();

  function handleLogoClick() {
    clearTimeout(logoResetTimer.current);
    setLogoClicks((prev) => {
      const next = prev + 1;
      if (next >= 7) {
        fireEaster(EASTER_MESSAGES[0]);
        return 0;
      }
      logoResetTimer.current = setTimeout(() => setLogoClicks(0), 1800);
      return next;
    });
  }

  // ── Easter egg: Konami code ─────────────────────────────────
  const konamiIdx = useRef(0);
  const handleKey = useCallback((e: KeyboardEvent) => {
    if (e.key === KONAMI[konamiIdx.current]) {
      konamiIdx.current += 1;
      if (konamiIdx.current === KONAMI.length) {
        fireEaster(EASTER_MESSAGES[1]);
        konamiIdx.current = 0;
      }
    } else {
      konamiIdx.current = 0;
    }
  }, []);

  useEffect(() => {
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [handleKey]);

  function fireEaster(msg: string) {
    setEasterMsg(msg);
    setShowEaster(true);
    setTimeout(() => setShowEaster(false), 3200);
  }

  // ── File import ─────────────────────────────────────────────
  function handleCreateNew() { setPhase('setup'); }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        if (data.quizSet) {
          importSession(data as QuizExport);
        } else {
          importQuizSet(data as QuizSet);
        }
        setPhase('setup');
      } catch {
        alert('Invalid quiz file. Please use a valid Saltquiz JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const letters = 'Saltquiz'.split('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">

      {/* ── Easter egg toast ─────────────────────────────────── */}
      <AnimatePresence>
        {showEaster && (
          <motion.div
            className="fixed top-6 left-1/2 -translate-x-1/2 z-50 px-6 py-3 rounded-2xl border border-gold/40
              bg-card shadow-[0_0_24px_rgba(240,180,41,0.35)] font-ui text-gold text-center text-sm font-semibold max-w-xs w-max"
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0,   scale: 1   }}
            exit={{    opacity: 0, y: -12, scale: 0.95 }}
          >
            {easterMsg}
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Logo ─────────────────────────────────────────────── */}
      <motion.div
        className="mb-2 flex items-center gap-1 cursor-default select-none"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        onClick={handleLogoClick}
        title={logoClicks >= 4 ? `${7 - logoClicks} more…` : undefined}
      >
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            className="font-display text-7xl md:text-9xl leading-none"
            style={{ color: i % 2 === 0 ? '#f0b429' : '#f1f5f9' }}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
          >
            {letter}
          </motion.span>
        ))}
      </motion.div>

      <motion.p
        className="font-mono text-text-secondary text-sm md:text-base tracking-[0.25em] uppercase mb-14 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        800m Eiffel Tower Edition (╯°□°）╯︵ ┻━┻
      </motion.p>

      {/* ── Cards ────────────────────────────────────────────── */}
      <motion.div
        className="flex flex-col sm:flex-row gap-5 w-full max-w-xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        {/* Create New */}
        <button
          onClick={handleCreateNew}
          className="group flex-1 flex flex-row items-center gap-5 p-6 rounded-2xl border border-border bg-card
            hover:border-gold hover:bg-elevated transition-all duration-300 cursor-pointer text-left"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
              group-hover:shadow-[0_0_20px_rgba(240,180,41,0.5)]"
            style={{ background: 'linear-gradient(135deg,#f0b429 0%,#d97706 100%)' }}
          >
            <Plus className="w-7 h-7 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-2xl text-text-primary mb-1">Create New Quiz</div>
            <div className="text-text-secondary text-sm font-ui leading-snug">
              Build a quiz from scratch with custom categories and questions
            </div>
          </div>
        </button>

        {/* Load from File */}
        <button
          onClick={() => fileRef.current?.click()}
          className="group flex-1 flex flex-row items-center gap-5 p-6 rounded-2xl border border-border bg-card
            hover:border-blue hover:bg-elevated transition-all duration-300 cursor-pointer text-left"
          style={{ boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)' }}
        >
          <div
            className="w-14 h-14 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300
              group-hover:shadow-[0_0_20px_rgba(79,156,249,0.5)]"
            style={{ background: 'linear-gradient(135deg,#4f9cf9 0%,#2563eb 100%)' }}
          >
            <Upload className="w-7 h-7 text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="font-display text-2xl text-text-primary mb-1">Load Quiz File</div>
            <div className="text-text-secondary text-sm font-ui leading-snug">
              Import a previously saved quiz or full session from a JSON file
            </div>
          </div>
        </button>

        <input ref={fileRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
      </motion.div>

      {/* ── Feature tags ─────────────────────────────────────── */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 mt-12"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {[
          { icon: Trophy, label: 'Team & Player Scoring' },
          { icon: Zap,    label: 'Live Countdown Timer' },
          { icon: Upload, label: 'Import & Export'       },
        ].map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-border bg-card text-text-muted text-sm font-ui"
          >
            <Icon className="w-4 h-4 text-gold" />
            {label}
          </div>
        ))}
      </motion.div>
    </div>
  );
}
