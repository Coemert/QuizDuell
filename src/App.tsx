import { AnimatePresence, motion } from 'framer-motion';
import { useGameStore } from './store/gameStore';
import HomePage from './components/HomePage';
import SetupPage from './components/SetupPage';
import GamePage from './components/GamePage';

const pageVariants = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: 'easeOut' } },
  exit: { opacity: 0, y: -16, transition: { duration: 0.2 } },
};

export default function App() {
  const phase = useGameStore((s) => s.phase);

  return (
    <div className="min-h-screen bg-base bg-grid relative overflow-x-hidden">
      {/* Ambient top glow */}
      <div
        className="pointer-events-none fixed top-0 left-0 right-0 h-64 opacity-20"
        style={{
          background: 'radial-gradient(ellipse at 50% -20%, #f0b42955 0%, transparent 70%)',
        }}
      />

      <AnimatePresence mode="wait">
        {phase === 'home' && (
          <motion.div key="home" {...pageVariants}>
            <HomePage />
          </motion.div>
        )}
        {phase === 'setup' && (
          <motion.div key="setup" {...pageVariants}>
            <SetupPage />
          </motion.div>
        )}
        {phase === 'game' && (
          <motion.div key="game" {...pageVariants}>
            <GamePage />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
