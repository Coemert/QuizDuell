import { motion } from 'framer-motion';
import { RotateCcw, X } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

interface Props {
  onClose: () => void;
  onPlayAgain: () => void;
}

// Deterministic confetti so it doesn't re-randomise on re-render
const CONFETTI_COLORS = ['#f0b429','#4f9cf9','#34d399','#f87171','#a78bfa','#fb923c','#22d3ee','#f472b6'];
const confetti = Array.from({ length: 44 }, (_, i) => ({
  color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  left:  ((i * 41 + 7)  % 100),
  delay: ((i * 13)      % 31) / 10,
  dur:   3 + ((i * 7)   % 28) / 10,
  size:  6 + (i % 9),
  round: i % 3 !== 0,
}));

export default function VictoryScreen({ onClose, onPlayAgain }: Props) {
  const players        = useGameStore((s) => s.players);
  const teams          = useGameStore((s) => s.teams);
  const teamMode       = useGameStore((s) => s.teamMode);
  const getPlayerScore = useGameStore((s) => s.getPlayerScore);
  const getTeamScore   = useGameStore((s) => s.getTeamScore);

  const rows =
    teamMode === 'teams'
      ? teams.map((t) => ({
          id:      t.id,
          name:    t.name,
          score:   getTeamScore(t.id),
          color:   t.color,
          members: players.filter((p) => p.teamId === t.id),
        }))
      : players.map((p) => ({
          id:      p.id,
          name:    p.name,
          score:   getPlayerScore(p.id),
          color:   p.color,
          members: [] as typeof players,
        }));

  const sorted          = [...rows].sort((a, b) => b.score - a.score);
  const [gold, silver, bronze] = sorted;

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-center px-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/92 backdrop-blur-md" />

      {/* Confetti */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {confetti.map((c, i) => (
          <div
            key={i}
            className="absolute top-0"
            style={{
              left:      `${c.left}%`,
              animation: `confettiDrop ${c.dur}s ${c.delay}s ease-in infinite`,
            }}
          >
            <div style={{
              width:        c.size,
              height:       c.size,
              background:   c.color,
              borderRadius: c.round ? '50%' : '2px',
              opacity:      0.85,
            }} />
          </div>
        ))}
      </div>

      {/* Close */}
      <button
        onClick={onClose}
        className="absolute top-5 right-5 z-10 p-3 rounded-xl bg-elevated border border-border
          text-text-muted hover:text-text-primary hover:border-gold/30 transition-colors"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Content */}
      <div className="relative z-10 w-full max-w-xl text-center">

        {/* Headline */}
        <motion.div
          initial={{ y: -30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
          className="mb-8"
        >
          <div
            className="font-display text-6xl md:text-8xl text-gold victory-glow select-none"
          >
            GAME OVER
          </div>
          {gold && (
            <p className="font-ui text-lg text-text-secondary mt-3">
              <span className="font-semibold" style={{ color: gold.color }}>{gold.name}</span>
              {' '}wins with{' '}
              <span className="text-gold font-semibold">{gold.score.toLocaleString()} pts</span>!
            </p>
          )}
        </motion.div>

        {/* Podium — order: 2nd | 1st | 3rd */}
        <div className="flex items-end justify-center gap-3 md:gap-6 mb-8">

          {/* 2nd */}
          <div className="flex flex-col items-center" style={{ minWidth: 76 }}>
            {silver ? (
              <motion.div
                className="flex flex-col items-center"
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.55, type: 'spring', stiffness: 130 }}
              >
                <div
                  className="w-16 h-16 md:w-20 md:h-20 rounded-full flex items-center justify-center
                    font-display text-2xl md:text-3xl border-4 mb-2 shadow-lg"
                  style={{ background: silver.color + '28', borderColor: silver.color, color: silver.color }}
                >
                  {silver.name.charAt(0).toUpperCase()}
                </div>
                <div className="font-ui font-semibold text-text-primary text-sm text-center max-w-[76px] truncate">
                  {silver.name}
                </div>
                <div className="font-display text-base" style={{ color: silver.color }}>
                  {silver.score.toLocaleString()}
                </div>
                <div
                  className="w-20 md:w-24 mt-2 rounded-t-xl flex items-center justify-center"
                  style={{ height: 72, background: 'linear-gradient(180deg,#94a3b8,#64748b)' }}
                >
                  <span className="font-display text-3xl text-white">2</span>
                </div>
              </motion.div>
            ) : <div style={{ height: 72 + 80 + 28 }} />}
          </div>

          {/* 1st */}
          <div className="flex flex-col items-center" style={{ minWidth: 88 }}>
            {gold && (
              <motion.div
                className="flex flex-col items-center"
                initial={{ y: 90, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3, type: 'spring', stiffness: 130 }}
              >
                <span className="text-3xl md:text-4xl mb-1 crown-float select-none">👑</span>
                <div
                  className="w-20 h-20 md:w-24 md:h-24 rounded-full flex items-center justify-center
                    font-display text-3xl md:text-4xl border-4 mb-2 shadow-2xl"
                  style={{
                    background:  gold.color + '28',
                    borderColor: gold.color,
                    color:       gold.color,
                    boxShadow:   `0 0 32px ${gold.color}55`,
                  }}
                >
                  {gold.name.charAt(0).toUpperCase()}
                </div>
                <div className="font-ui font-semibold text-text-primary text-center max-w-[88px] truncate">
                  {gold.name}
                </div>
                <div className="font-display text-xl" style={{ color: gold.color }}>
                  {gold.score.toLocaleString()}
                </div>
                <div
                  className="w-24 md:w-28 mt-2 rounded-t-xl flex items-center justify-center"
                  style={{
                    height:     112,
                    background: 'linear-gradient(180deg,#f0b429,#d97706)',
                    boxShadow:  '0 0 24px rgba(240,180,41,0.45)',
                  }}
                >
                  <span className="font-display text-4xl text-black">1</span>
                </div>
              </motion.div>
            )}
          </div>

          {/* 3rd */}
          <div className="flex flex-col items-center" style={{ minWidth: 72 }}>
            {bronze ? (
              <motion.div
                className="flex flex-col items-center"
                initial={{ y: 45, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.75, type: 'spring', stiffness: 130 }}
              >
                <div
                  className="w-14 h-14 md:w-16 md:h-16 rounded-full flex items-center justify-center
                    font-display text-xl md:text-2xl border-4 mb-2"
                  style={{ background: bronze.color + '28', borderColor: bronze.color, color: bronze.color }}
                >
                  {bronze.name.charAt(0).toUpperCase()}
                </div>
                <div className="font-ui font-semibold text-text-primary text-xs text-center max-w-[72px] truncate">
                  {bronze.name}
                </div>
                <div className="font-display text-sm" style={{ color: bronze.color }}>
                  {bronze.score.toLocaleString()}
                </div>
                <div
                  className="mt-2 rounded-t-xl flex items-center justify-center"
                  style={{ width: 64, height: 52, background: 'linear-gradient(180deg,#cd7f32,#9a5e24)' }}
                >
                  <span className="font-display text-2xl text-white">3</span>
                </div>
              </motion.div>
            ) : <div style={{ height: 52 + 72 + 28 }} />}
          </div>
        </div>

        {/* 4th+ */}
        {sorted.length > 3 && (
          <motion.div
            className="flex flex-wrap justify-center gap-2 mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
          >
            {sorted.slice(3).map((row, i) => (
              <div
                key={row.id}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-elevated border border-border"
              >
                <span className="font-display text-sm text-text-muted">{i + 4}.</span>
                <div className="w-3 h-3 rounded-full shrink-0" style={{ background: row.color }} />
                <span className="font-ui text-sm text-text-secondary">{row.name}</span>
                <span className="font-display text-sm" style={{ color: row.color }}>
                  {row.score.toLocaleString()}
                </span>
              </div>
            ))}
          </motion.div>
        )}

        {/* Buttons */}
        <motion.div
          className="flex gap-4 justify-center"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.95 }}
        >
          <button
            onClick={onClose}
            className="flex items-center gap-2 px-6 py-3.5 rounded-xl border border-border bg-elevated
              text-text-primary font-ui font-semibold text-base hover:border-gold/30 transition-colors"
          >
            View Board
          </button>
          <button
            onClick={onPlayAgain}
            className="flex items-center gap-2 px-8 py-3.5 rounded-xl font-ui font-semibold text-base transition-all
              hover:brightness-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg, rgb(var(--color-gold)), rgb(var(--color-gold-light)))',
              color:      'black',
              boxShadow:  '0 0 20px rgb(var(--color-gold) / 0.45)',
            }}
          >
            <RotateCcw className="w-5 h-5" />
            Play Again
          </button>
        </motion.div>
      </div>
    </motion.div>
  );
}
