import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Download, Plus, Trash2, Users, ClipboardList,
  Play, ChevronDown, ChevronUp, Clock, RotateCcw
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { Category, Question } from '../types';
import { TEAM_COLORS, PLAYER_COLORS } from '../types';

// ─── Shared input styles ──────────────────────────────────────────
const inputCls =
  'w-full bg-base border border-border rounded-lg px-3 py-2 text-text-primary font-ui text-sm ' +
  'focus:outline-none focus:border-gold/60 placeholder-text-muted transition-colors';

const btnPrimary =
  'flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-black font-ui font-semibold text-sm ' +
  'hover:bg-gold-light transition-colors shadow-[0_0_12px_rgba(240,180,41,0.3)]';

const btnSecondary =
  'flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-elevated text-text-primary font-ui text-sm ' +
  'hover:border-gold/40 hover:bg-card transition-colors';

// ─── Question Row ─────────────────────────────────────────────────
function QuestionRow({
  question,
  categoryId,
  onUpdate,
  onRemove,
}: {
  question: Question;
  categoryId: string;
  onUpdate: (patch: Partial<Question>) => void;
  onRemove: () => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const defaultTimer = useGameStore((s) => s.quizSet.defaultTimerSeconds);
  const hasCustomTimer = question.timerSeconds !== undefined;

  return (
    <div className="border border-border rounded-xl bg-base overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-elevated/40 transition-colors"
        onClick={() => setExpanded((e) => !e)}
      >
        <span
          className="font-display text-lg min-w-[52px] text-center rounded-lg px-2 py-0.5"
          style={{ background: 'rgba(240,180,41,0.12)', color: '#f0b429' }}
        >
          {question.points}
        </span>
        <span className="flex-1 font-ui text-sm text-text-secondary truncate">
          {question.question || <span className="italic text-text-muted">No question text</span>}
        </span>
        {hasCustomTimer && (
          <span className="flex items-center gap-1 text-xs font-mono text-blue bg-blue/10 px-2 py-0.5 rounded-full">
            <Clock className="w-3 h-3" />{question.timerSeconds}s
          </span>
        )}
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-text-muted" />
        ) : (
          <ChevronDown className="w-4 h-4 text-text-muted" />
        )}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="p-1.5 rounded-lg text-text-muted hover:text-red hover:bg-red/10 transition-colors"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border">
              <div className="flex items-center gap-3">
                <label className="font-ui text-xs text-text-muted w-20 shrink-0">Points</label>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => onUpdate({ points: Number(e.target.value) })}
                  className={inputCls + ' w-24'}
                  min={10}
                  step={50}
                />
              </div>
              {/* Per-question timer override */}
              <div className="flex items-center gap-3">
                <label className="font-ui text-xs text-text-muted w-20 shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Timer
                </label>
                <div className="flex items-center gap-2 flex-1">
                  <button
                    onClick={() =>
                      onUpdate({ timerSeconds: hasCustomTimer ? undefined : defaultTimer })
                    }
                    className={`text-xs px-2.5 py-1 rounded-lg font-ui font-medium transition-colors ${
                      hasCustomTimer
                        ? 'bg-blue/20 text-blue border border-blue/30'
                        : 'bg-elevated text-text-muted border border-border hover:border-gold/30'
                    }`}
                  >
                    {hasCustomTimer ? 'Custom' : `Default (${defaultTimer}s)`}
                  </button>
                  {hasCustomTimer && (
                    <>
                      <input
                        type="number"
                        value={question.timerSeconds}
                        onChange={(e) => onUpdate({ timerSeconds: Number(e.target.value) })}
                        className={inputCls + ' w-20'}
                        min={5}
                        step={5}
                      />
                      <span className="text-text-muted text-xs font-ui">sec</span>
                      <button
                        onClick={() => onUpdate({ timerSeconds: undefined })}
                        className="p-1 text-text-muted hover:text-gold transition-colors"
                        title="Reset to default"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </>
                  )}
                </div>
              </div>
              <div>
                <label className="font-ui text-xs text-text-muted block mb-1.5">Question</label>
                <textarea
                  value={question.question}
                  onChange={(e) => onUpdate({ question: e.target.value })}
                  placeholder="Enter the question..."
                  rows={2}
                  className={inputCls + ' resize-none'}
                />
              </div>
              <div>
                <label className="font-ui text-xs text-text-muted block mb-1.5">Answer</label>
                <textarea
                  value={question.answer}
                  onChange={(e) => onUpdate({ answer: e.target.value })}
                  placeholder="Enter the answer..."
                  rows={2}
                  className={inputCls + ' resize-none'}
                />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Category Card ─────────────────────────────────────────────────
function CategoryCard({ category }: { category: Category }) {
  const [expanded, setExpanded] = useState(true);
  const updateCategoryName = useGameStore((s) => s.updateCategoryName);
  const removeCategory = useGameStore((s) => s.removeCategory);
  const updateQuestion = useGameStore((s) => s.updateQuestion);
  const addQuestion = useGameStore((s) => s.addQuestionToCategory);
  const removeQuestion = useGameStore((s) => s.removeQuestionFromCategory);

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-elevated/40">
        <input
          value={category.name}
          onChange={(e) => updateCategoryName(category.id, e.target.value)}
          className="flex-1 bg-transparent border-b border-transparent focus:border-gold/60 font-display text-xl text-gold outline-none pb-0.5 transition-colors"
          placeholder="Category Name"
        />
        <button
          onClick={() => setExpanded((e) => !e)}
          className="p-1.5 text-text-muted hover:text-text-primary transition-colors"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
        <button
          onClick={() => removeCategory(category.id)}
          className="p-1.5 rounded-lg text-text-muted hover:text-red hover:bg-red/10 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ height: 0 }}
            animate={{ height: 'auto' }}
            exit={{ height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="p-4 space-y-2">
              {category.questions
                .slice()
                .sort((a, b) => a.points - b.points)
                .map((q) => (
                  <QuestionRow
                    key={q.id}
                    question={q}
                    categoryId={category.id}
                    onUpdate={(patch) => updateQuestion(category.id, q.id, patch)}
                    onRemove={() => removeQuestion(category.id, q.id)}
                  />
                ))}
              <button
                onClick={() => addQuestion(category.id)}
                className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-border text-text-muted font-ui text-sm hover:border-gold/40 hover:text-gold/70 transition-colors mt-2"
              >
                <Plus className="w-3.5 h-3.5" /> Add Question
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Quiz Editor Tab ───────────────────────────────────────────────
function QuizEditorTab() {
  const quizSet = useGameStore((s) => s.quizSet);
  const setQuizName = useGameStore((s) => s.setQuizName);
  const setTimerSeconds = useGameStore((s) => s.setTimerSeconds);
  const addCategory = useGameStore((s) => s.addCategory);

  function handleExport() {
    const json = JSON.stringify(quizSet, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${quizSet.name.replace(/\s+/g, '_') || 'quiz'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      {/* Quiz Meta */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-border bg-card">
        <div>
          <label className="font-ui text-xs text-text-muted block mb-1.5">Quiz Name</label>
          <input
            value={quizSet.name}
            onChange={(e) => setQuizName(e.target.value)}
            className={inputCls}
            placeholder="My Awesome Quiz"
          />
        </div>
        <div>
          <label className="font-ui text-xs text-text-muted flex items-center justify-between mb-1.5">
            <span>Default Timer</span>
            <span className="text-gold font-semibold">{quizSet.defaultTimerSeconds}s</span>
          </label>
          <input
            type="range"
            min={5}
            max={120}
            step={5}
            value={quizSet.defaultTimerSeconds}
            onChange={(e) => setTimerSeconds(Number(e.target.value))}
            className="w-full mt-1"
          />
        </div>
      </div>

      {/* Export */}
      <div className="flex justify-between items-center">
        <h3 className="font-display text-2xl text-text-primary">
          Categories
          <span className="ml-3 font-ui text-sm text-text-muted font-normal">
            ({quizSet.categories.length})
          </span>
        </h3>
        <div className="flex gap-3">
          <button onClick={handleExport} className={btnSecondary}>
            <Download className="w-4 h-4" /> Export JSON
          </button>
          <button onClick={addCategory} className={btnPrimary}>
            <Plus className="w-4 h-4" /> Add Category
          </button>
        </div>
      </div>

      {/* Categories */}
      <div className="space-y-4">
        {quizSet.categories.map((cat) => (
          <CategoryCard key={cat.id} category={cat} />
        ))}
        {quizSet.categories.length === 0 && (
          <div className="text-center py-16 text-text-muted font-ui">
            No categories yet. Add one to get started!
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Players Tab ───────────────────────────────────────────────────
function PlayersTab() {
  const teamMode = useGameStore((s) => s.teamMode);
  const setTeamMode = useGameStore((s) => s.setTeamMode);
  const players = useGameStore((s) => s.players);
  const teams = useGameStore((s) => s.teams);
  const addPlayer = useGameStore((s) => s.addPlayer);
  const removePlayer = useGameStore((s) => s.removePlayer);
  const updatePlayerName = useGameStore((s) => s.updatePlayerName);
  const updatePlayerColor = useGameStore((s) => s.updatePlayerColor);
  const assignPlayerTeam = useGameStore((s) => s.assignPlayerTeam);
  const addTeam = useGameStore((s) => s.addTeam);
  const removeTeam = useGameStore((s) => s.removeTeam);
  const updateTeamName = useGameStore((s) => s.updateTeamName);

  const [newPlayerName, setNewPlayerName] = useState('');
  const [newPlayerTeam, setNewPlayerTeam] = useState<string>('');

  function handleAddPlayer() {
    if (!newPlayerName.trim()) return;
    addPlayer(newPlayerName.trim(), newPlayerTeam || undefined);
    setNewPlayerName('');
    setNewPlayerTeam('');
  }

  return (
    <div className="space-y-6">
      {/* Mode Toggle */}
      <div className="p-5 rounded-2xl border border-border bg-card">
        <label className="font-ui text-xs text-text-muted block mb-3">Game Mode</label>
        <div className="flex gap-3">
          {(['individual', 'teams'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setTeamMode(mode)}
              className={`flex-1 py-3 rounded-xl font-ui font-semibold text-sm transition-all ${
                teamMode === mode
                  ? 'bg-gold text-black shadow-[0_0_12px_rgba(240,180,41,0.3)]'
                  : 'bg-elevated border border-border text-text-secondary hover:border-gold/40'
              }`}
            >
              {mode === 'individual' ? '👤 Individual Players' : '👥 Team Mode'}
            </button>
          ))}
        </div>
      </div>

      {/* Teams section (only in team mode) */}
      {teamMode === 'teams' && (
        <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
          <div className="flex items-center justify-between mb-1">
            <h3 className="font-display text-xl text-text-primary">Teams</h3>
            <button onClick={addTeam} className={btnSecondary}>
              <Plus className="w-4 h-4" /> Add Team
            </button>
          </div>
          {teams.map((team) => (
            <div key={team.id} className="flex items-center gap-3 p-3 rounded-xl bg-base border border-border">
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ background: team.color, boxShadow: `0 0 6px ${team.color}80` }}
              />
              <input
                value={team.name}
                onChange={(e) => updateTeamName(team.id, e.target.value)}
                className={inputCls}
                placeholder="Team name"
              />
              <div className="flex gap-1 shrink-0">
                {TEAM_COLORS.map((c) => (
                  <button
                    key={c}
                    className="w-5 h-5 rounded-full border-2 transition-all hover:scale-110"
                    style={{
                      background: c,
                      borderColor: team.color === c ? 'white' : 'transparent',
                    }}
                    onClick={() =>
                      useGameStore.setState((s) => ({
                        teams: s.teams.map((t) => (t.id === team.id ? { ...t, color: c } : t)),
                      }))
                    }
                  />
                ))}
              </div>
              <button
                onClick={() => removeTeam(team.id)}
                className="p-1.5 rounded-lg text-text-muted hover:text-red hover:bg-red/10 transition-colors shrink-0"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          {teams.length === 0 && (
            <p className="text-text-muted text-sm font-ui">Add teams above, then assign players below.</p>
          )}
        </div>
      )}

      {/* Players */}
      <div className="p-5 rounded-2xl border border-border bg-card space-y-3">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-display text-xl text-text-primary">Players</h3>
          <span className="text-text-muted text-sm font-ui">{players.length} added</span>
        </div>

        {/* Add player row — stacked layout to avoid squishing */}
        <div className="flex flex-col gap-2">
          <div className="flex gap-2">
            <input
              value={newPlayerName}
              onChange={(e) => setNewPlayerName(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
              className={inputCls}
              placeholder="Player name..."
            />
            <button onClick={handleAddPlayer} className={btnPrimary + ' shrink-0'}>
              <Plus className="w-4 h-4" /> Add
            </button>
          </div>
          {teamMode === 'teams' && teams.length > 0 && (
            <select
              value={newPlayerTeam}
              onChange={(e) => setNewPlayerTeam(e.target.value)}
              className={inputCls}
            >
              <option value="">No team assigned</option>
              {teams.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Player list */}
        <div className="space-y-2">
          {players.map((player, idx) => {
            const team = teams.find((t) => t.id === player.teamId);
            return (
              <div
                key={player.id}
                className="p-3 rounded-xl bg-base border border-border space-y-2"
              >
                {/* Row 1: index + name + team select + delete */}
                <div className="flex items-center gap-3">
                  <span className="font-mono text-text-muted text-xs w-5 text-right shrink-0">{idx + 1}</span>
                  <input
                    value={player.name}
                    onChange={(e) => updatePlayerName(player.id, e.target.value)}
                    className="flex-1 bg-transparent text-text-primary font-ui text-sm outline-none border-b border-transparent focus:border-gold/40 transition-colors pb-0.5 min-w-0"
                  />
                  {teamMode === 'teams' && teams.length > 0 && (
                    <select
                      value={player.teamId ?? ''}
                      onChange={(e) => assignPlayerTeam(player.id, e.target.value || undefined)}
                      className="bg-elevated border border-border rounded-lg px-2 py-1 text-text-secondary text-xs font-ui focus:outline-none focus:border-gold/40 shrink-0"
                      style={{ maxWidth: '110px' }}
                    >
                      <option value="">No team</option>
                      {teams.map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.name}
                        </option>
                      ))}
                    </select>
                  )}
                  <button
                    onClick={() => removePlayer(player.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red hover:bg-red/10 transition-colors shrink-0"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
                {/* Row 2: color swatches */}
                <div className="flex items-center gap-2 pl-8">
                  <span className="text-text-muted text-xs font-ui shrink-0">Color:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {PLAYER_COLORS.map((c) => (
                      <button
                        key={c}
                        onClick={() => updatePlayerColor(player.id, c)}
                        className="w-5 h-5 rounded-full border-2 transition-all hover:scale-125"
                        style={{
                          background: c,
                          borderColor: player.color === c ? 'white' : 'transparent',
                          boxShadow: player.color === c ? `0 0 6px ${c}` : undefined,
                        }}
                        title={c}
                      />
                    ))}
                  </div>
                  <div
                    className="w-5 h-5 rounded-full shrink-0 ml-1"
                    style={{
                      background: player.color,
                      boxShadow: `0 0 6px ${player.color}80`,
                    }}
                  />
                  {team && (
                    <span className="text-text-muted text-xs font-ui ml-1">
                      · Team:
                      <span className="ml-1 font-semibold" style={{ color: team.color }}>
                        {team.name}
                      </span>
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {players.length === 0 && (
            <p className="text-text-muted text-sm font-ui py-2">
              No players yet. Add the first player above.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── SetupPage ─────────────────────────────────────────────────────
export default function SetupPage() {
  const setPhase = useGameStore((s) => s.setPhase);
  const startGame = useGameStore((s) => s.startGame);
  const quizSet = useGameStore((s) => s.quizSet);
  const players = useGameStore((s) => s.players);
  const setupTab = useGameStore((s) => s.setupTab);
  const setSetupTab = useGameStore((s) => s.setSetupTab);

  const canStart =
    quizSet.categories.length > 0 &&
    quizSet.categories.every((c) => c.questions.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
        <button
          onClick={() => setPhase('home')}
          className="flex items-center gap-2 text-text-secondary hover:text-text-primary font-ui text-sm transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back
        </button>
        <h1 className="font-display text-3xl text-text-primary tracking-wide">Setup</h1>
        <button
          onClick={startGame}
          disabled={!canStart}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-ui font-semibold text-sm transition-all ${
            canStart
              ? 'bg-gold text-black hover:bg-gold-light shadow-[0_0_16px_rgba(240,180,41,0.4)] cursor-pointer'
              : 'bg-elevated text-text-muted border border-border cursor-not-allowed'
          }`}
        >
          <Play className="w-4 h-4" fill={canStart ? 'black' : 'currentColor'} />
          Start Game
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-4 border-b border-border bg-card/30">
        <button
          onClick={() => setSetupTab('quiz')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui font-medium text-sm transition-all ${
            setupTab === 'quiz'
              ? 'bg-elevated border border-gold/30 text-gold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <ClipboardList className="w-4 h-4" /> Quiz Editor
        </button>
        <button
          onClick={() => setSetupTab('players')}
          className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-ui font-medium text-sm transition-all ${
            setupTab === 'players'
              ? 'bg-elevated border border-gold/30 text-gold'
              : 'text-text-muted hover:text-text-primary'
          }`}
        >
          <Users className="w-4 h-4" /> Players
          {players.length > 0 && (
            <span className="bg-gold/20 text-gold rounded-full px-1.5 py-0.5 text-xs leading-none">
              {players.length}
            </span>
          )}
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 max-w-4xl mx-auto w-full px-4 py-6">
        <AnimatePresence mode="wait">
          {setupTab === 'quiz' ? (
            <motion.div
              key="quiz"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.2 }}
            >
              <QuizEditorTab />
            </motion.div>
          ) : (
            <motion.div
              key="players"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            >
              <PlayersTab />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
