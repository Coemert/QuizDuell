import { useRef } from 'react';
import { motion } from 'framer-motion';
import { Trophy, Plus, Upload, Zap } from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { QuizSet, QuizExport } from '../types';

export default function HomePage() {
  const setPhase = useGameStore((s) => s.setPhase);
  const importQuizSet = useGameStore((s) => s.importQuizSet);
  const importSession = useGameStore((s) => s.importSession);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleCreateNew() {
    setPhase('setup');
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const data = JSON.parse(ev.target?.result as string);
        // New format has a nested `quizSet` key; legacy format is a bare QuizSet
        if (data.quizSet) {
          importSession(data as QuizExport);
        } else {
          importQuizSet(data as QuizSet);
        }
        setPhase('setup');
      } catch {
        alert('Invalid quiz file. Please use a valid Quizduell JSON export.');
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  }

  const letters = 'QUIZDUELL'.split('');

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-16">
      {/* Logo */}
      <motion.div
        className="mb-2 flex items-center gap-1"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
      >
        {letters.map((letter, i) => (
          <motion.span
            key={i}
            className="font-display text-7xl md:text-9xl leading-none select-none"
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
        className="font-mono text-text-secondary text-lg tracking-[0.3em] uppercase mb-16"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
      >
        The Ultimate Quiz Show Experience
      </motion.p>

      {/* Cards */}
      <motion.div
        className="flex flex-col sm:flex-row gap-6 w-full max-w-xl"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7, duration: 0.5 }}
      >
        {/* Create New */}
        <button
          onClick={handleCreateNew}
          className="group flex-1 flex flex-col items-center gap-4 p-8 rounded-2xl border border-border bg-card
            hover:border-gold hover:bg-elevated transition-all duration-300 cursor-pointer text-left"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300
              group-hover:shadow-[0_0_20px_rgba(240,180,41,0.5)]"
            style={{ background: 'linear-gradient(135deg, #f0b429 0%, #d97706 100%)' }}
          >
            <Plus className="w-8 h-8 text-black" strokeWidth={2.5} />
          </div>
          <div>
            <div className="font-display text-2xl text-text-primary mb-1">Create New Quiz</div>
            <div className="text-text-secondary text-sm font-ui">
              Build a quiz from scratch with custom categories and questions
            </div>
          </div>
        </button>

        {/* Load from File */}
        <button
          onClick={() => fileRef.current?.click()}
          className="group flex-1 flex flex-col items-center gap-4 p-8 rounded-2xl border border-border bg-card
            hover:border-blue hover:bg-elevated transition-all duration-300 cursor-pointer text-left"
          style={{
            boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.05)',
          }}
        >
          <div
            className="w-16 h-16 rounded-xl flex items-center justify-center transition-all duration-300
              group-hover:shadow-[0_0_20px_rgba(79,156,249,0.5)]"
            style={{ background: 'linear-gradient(135deg, #4f9cf9 0%, #2563eb 100%)' }}
          >
            <Upload className="w-8 h-8 text-white" strokeWidth={2} />
          </div>
          <div>
            <div className="font-display text-2xl text-text-primary mb-1">Load Quiz File</div>
            <div className="text-text-secondary text-sm font-ui">
              Import a previously saved quiz from a JSON file
            </div>
          </div>
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".json"
          onChange={handleImport}
          className="hidden"
        />
      </motion.div>

      {/* Feature tags */}
      <motion.div
        className="flex flex-wrap justify-center gap-3 mt-14"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.5 }}
      >
        {[
          { icon: Trophy, label: 'Team & Player Scoring' },
          { icon: Zap, label: 'Live Countdown Timer' },
          { icon: Upload, label: 'Import & Export' },
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
