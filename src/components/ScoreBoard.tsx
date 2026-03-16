import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, CheckCircle2, XCircle, ChevronRight } from 'lucide-react';
import { useGameStore } from '../store/gameStore';

export default function ScoreBoard() {
  const players = useGameStore((s) => s.players);
  const teams = useGameStore((s) => s.teams);
  const teamMode = useGameStore((s) => s.teamMode);
  const scoreHistory = useGameStore((s) => s.scoreHistory);
  const currentPlayerIndex = useGameStore((s) => s.currentPlayerIndex);
  const getPlayerScore = useGameStore((s) => s.getPlayerScore);
  const getTeamScore = useGameStore((s) => s.getTeamScore);

  const currentPlayer = players[currentPlayerIndex % Math.max(players.length, 1)];

  // Build score rows: either teams (with member breakdown) or individual players
  const scoreRows =
    teamMode === 'teams'
      ? teams.map((team) => {
          const members = players.filter((p) => p.teamId === team.id);
          const score = getTeamScore(team.id);
          return { id: team.id, name: team.name, score, color: team.color, members };
        })
      : players.map((p) => ({
          id: p.id,
          name: p.name,
          score: getPlayerScore(p.id),
          color: p.color,
          members: [] as typeof players,
        }));

  const sorted = [...scoreRows].sort((a, b) => b.score - a.score);

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* Current Turn */}
      {currentPlayer && (
        <div className="p-4 border-b border-border">
          <div className="text-xs font-mono text-text-muted uppercase tracking-widest mb-2">Current Turn</div>
          <div
            className="flex items-center gap-3 px-4 py-3 rounded-xl border"
            style={{
              borderColor: teams.find((t) => t.id === currentPlayer.teamId)?.color ?? currentPlayer.color,
              background: 'rgba(255,255,255,0.03)',
            }}
          >
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center font-display text-lg shrink-0"
              style={{
                background: teams.find((t) => t.id === currentPlayer.teamId)?.color ?? currentPlayer.color,
                color: 'black',
              }}
            >
              {currentPlayer.name.charAt(0).toUpperCase()}
            </div>
            <div>
              <div className="font-ui font-semibold text-text-primary text-sm">{currentPlayer.name}</div>
              {teams.find((t) => t.id === currentPlayer.teamId) && (
                <div className="text-xs text-text-muted">
                  {teams.find((t) => t.id === currentPlayer.teamId)?.name}
                </div>
              )}
            </div>
            <ChevronRight className="w-4 h-4 text-gold ml-auto" />
          </div>
        </div>
      )}

      {/* Scores */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-2 mb-3">
          <Trophy className="w-4 h-4 text-gold" />
          <span className="text-xs font-mono text-text-muted uppercase tracking-widest">Scores</span>
        </div>
        <div className="space-y-2">
          {sorted.map((row, rank) => {
            const isCurrentPlayer = teamMode === 'individual' && row.id === currentPlayer?.id;
            return (
              <div
                key={row.id}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all ${
                  isCurrentPlayer ? 'border' : 'bg-elevated/40'
                }`}
                style={{
                  borderColor: isCurrentPlayer ? row.color : undefined,
                  background: isCurrentPlayer ? `${row.color}15` : undefined,
                }}
              >
                <span className="font-display text-lg text-text-muted w-5 text-center">{rank + 1}</span>
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{
                    background: row.color,
                    boxShadow: `0 0 5px ${row.color}80`,
                  }}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-ui text-sm font-semibold text-text-primary truncate">{row.name}</div>
                  {row.members.length > 0 && (
                    <div className="text-xs text-text-muted truncate">
                      {row.members.map((m) => m.name).join(', ')}
                    </div>
                  )}
                </div>
                <div
                  className="font-display text-xl shrink-0"
                  style={{ color: row.color }}
                >
                  {row.score.toLocaleString()}
                </div>
              </div>
            );
          })}
          {sorted.length === 0 && (
            <p className="text-text-muted text-xs font-ui text-center py-3">
              No players added yet.
            </p>
          )}
        </div>
      </div>

      {/* History */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="text-xs font-mono text-text-muted uppercase tracking-widest mb-3">History</div>
        <div className="space-y-2">
          <AnimatePresence initial={false}>
            {scoreHistory.map((entry) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className={`p-3 rounded-xl border text-xs font-ui ${
                  entry.correct
                    ? 'border-green/20 bg-green/5'
                    : 'border-red/20 bg-red/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-1.5">
                    {entry.correct ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-green shrink-0" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-red shrink-0" />
                    )}
                    <span className="font-semibold text-text-primary truncate max-w-[100px]">
                      {entry.playerName}
                    </span>
                    {entry.teamName && (
                      <span className="text-text-muted">({entry.teamName})</span>
                    )}
                  </div>
                  <span
                    className={`font-display text-base ${entry.correct ? 'text-green' : 'text-red'}`}
                  >
                    {entry.correct ? '+' : ''}{entry.points}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-text-muted">
                  <span
                    className="px-1.5 py-0.5 rounded text-xs"
                    style={{ background: 'rgba(240,180,41,0.1)', color: '#f0b429' }}
                  >
                    {entry.categoryName}
                  </span>
                  <span className="truncate">{entry.questionText || '—'}</span>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
          {scoreHistory.length === 0 && (
            <p className="text-text-muted text-xs font-ui text-center py-4">
              No questions answered yet.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
