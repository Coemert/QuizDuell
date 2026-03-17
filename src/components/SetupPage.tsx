import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ChevronLeft, Download, Plus, Trash2, Users, ClipboardList,
  Play, ChevronDown, ChevronUp, Clock, RotateCcw, ImageIcon,
  ListChecks, X, Shuffle,
} from 'lucide-react';
import { useGameStore } from '../store/gameStore';
import type { Category, Question, QuizExport } from '../types';
import { TEAM_COLORS, PLAYER_COLORS } from '../types';

// ─── Shared styles ─────────────────────────────────────────────
const inputCls =
  'w-full bg-base border border-border rounded-lg px-3 py-2.5 text-text-primary font-ui text-sm ' +
  'focus:outline-none focus:border-gold/60 placeholder-text-muted transition-colors';

const btnPrimary =
  'flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gold text-black font-ui font-semibold text-sm ' +
  'hover:bg-gold-light transition-colors shadow-[0_0_12px_rgba(240,180,41,0.3)]';

const btnSecondary =
  'flex items-center gap-2 px-4 py-2.5 rounded-lg border border-border bg-elevated text-text-primary font-ui text-sm ' +
  'hover:border-gold/40 hover:bg-card transition-colors';

// ─── Question Row ───────────────────────────────────────────────
function QuestionRow({
  question, categoryId, onUpdate, onRemove,
}: {
  question:    Question;
  categoryId?: string;
  onUpdate:    (patch: Partial<Question>) => void;
  onRemove:    () => void;
}) {
  const [open, setOpen] = useState(false);
  const defaultTimer = useGameStore((s) => s.quizSet.defaultTimerSeconds);
  const hasCustomTimer = question.timerSeconds !== undefined;
  const imageInputRef  = useRef<HTMLInputElement>(null);

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => onUpdate({ imageDataUrl: reader.result as string });
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="border border-border rounded-xl bg-base overflow-hidden">
      {/* Collapsed header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-elevated/40 transition-colors"
        onClick={() => setOpen((v) => !v)}
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
          <span className="flex items-center gap-1 text-xs font-mono text-blue bg-blue/10 px-2 py-0.5 rounded-full shrink-0">
            <Clock className="w-3 h-3" />{question.timerSeconds}s
          </span>
        )}
        {question.options && (
          <span className="text-xs font-mono text-gold bg-gold/10 px-2 py-0.5 rounded-full shrink-0">SELECT</span>
        )}
        {open ? <ChevronUp className="w-4 h-4 text-text-muted shrink-0" /> : <ChevronDown className="w-4 h-4 text-text-muted shrink-0" />}
        <button
          onClick={(e) => { e.stopPropagation(); onRemove(); }}
          className="p-1.5 rounded-lg text-text-muted hover:text-red hover:bg-red/10 transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="px-4 pb-4 pt-2 space-y-3 border-t border-border">

              {/* 1. Points */}
              <div className="flex items-center gap-3">
                <label className="font-ui text-xs text-text-muted w-20 shrink-0">Points</label>
                <input
                  type="number"
                  value={question.points}
                  onChange={(e) => onUpdate({ points: Number(e.target.value) })}
                  className={inputCls + ' w-28'}
                  min={10}
                  step={50}
                />
              </div>

              {/* 2. Timer */}
              <div className="flex items-center gap-3">
                <label className="font-ui text-xs text-text-muted w-20 shrink-0 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> Timer
                </label>
                <div className="flex items-center gap-2 flex-1 flex-wrap">
                  <button
                    onClick={() => onUpdate({ timerSeconds: hasCustomTimer ? undefined : defaultTimer })}
                    className={`text-sm px-3 py-1.5 rounded-lg font-ui font-medium transition-colors ${
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
                        className={inputCls + ' w-24'}
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

              {/* 3. Multiple choice toggle — MOVED UP so you decide question type first */}
              <div className="flex items-center gap-3">
                <label className="font-ui text-xs text-text-muted w-20 shrink-0 flex items-center gap-1">
                  <ListChecks className="w-3 h-3" /> Type
                </label>
                <button
                  onClick={() => {
                    if (question.options) {
                      onUpdate({ options: undefined, correctOptionIndex: undefined });
                    } else {
                      onUpdate({ options: ['', ''], correctOptionIndex: 0 });
                    }
                  }}
                  className={`text-sm px-3 py-1.5 rounded-lg font-ui font-medium transition-colors ${
                    question.options
                      ? 'bg-gold/20 text-gold border border-gold/30'
                      : 'bg-elevated text-text-muted border border-border hover:border-gold/30'
                  }`}
                >
                  {question.options ? 'Selection ON ✓' : 'Add Selection'}
                </button>
              </div>

              {/* 3b. Options editor */}
              {question.options && (
                <div className="space-y-2 pl-0">
                  {question.options.map((opt, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <button
                        onClick={() => onUpdate({ correctOptionIndex: idx })}
                        title="Mark as correct answer"
                        className={`w-8 h-8 rounded-lg border-2 shrink-0 flex items-center justify-center font-display text-sm font-bold transition-colors ${
                          question.correctOptionIndex === idx
                            ? 'border-green bg-green/20 text-green'
                            : 'border-border text-text-muted hover:border-gold/40 hover:text-gold'
                        }`}
                      >
                        {['A','B','C','D'][idx]}
                      </button>
                      <input
                        value={opt}
                        onChange={(e) => {
                          const next = [...question.options!];
                          next[idx] = e.target.value;
                          onUpdate({ options: next });
                        }}
                        placeholder={`Option ${['A','B','C','D'][idx]}…`}
                        className={inputCls}
                      />
                      {question.options!.length > 2 && (
                        <button
                          onClick={() => {
                            const next       = question.options!.filter((_, i) => i !== idx);
                            const prevCorrect = question.correctOptionIndex ?? 0;
                            const newCorrect  = prevCorrect === idx ? 0 : prevCorrect > idx ? prevCorrect - 1 : prevCorrect;
                            onUpdate({ options: next, correctOptionIndex: newCorrect });
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-red hover:bg-red/10 transition-colors shrink-0"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                  {question.options.length < 4 && (
                    <button
                      onClick={() => onUpdate({ options: [...question.options!, ''] })}
                      className="w-full flex items-center justify-center gap-2 py-2 rounded-xl border border-dashed border-border text-text-muted font-ui text-sm hover:border-gold/40 hover:text-gold/70 transition-colors"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Option
                    </button>
                  )}
                </div>
              )}

              {/* 4. Question text */}
              <div>
                <label className="font-ui text-xs text-text-muted block mb-1.5">Question</label>
                <textarea
                  value={question.question}
                  onChange={(e) => onUpdate({ question: e.target.value })}
                  placeholder="Enter the question…"
                  rows={2}
                  className={inputCls + ' resize-none'}
                />
              </div>

              {/* 5. Answer (free-response only) */}
              {!question.options && (
                <div>
                  <label className="font-ui text-xs text-text-muted block mb-1.5">Answer</label>
                  <textarea
                    value={question.answer}
                    onChange={(e) => onUpdate({ answer: e.target.value })}
                    placeholder="Enter the answer…"
                    rows={2}
                    className={inputCls + ' resize-none'}
                  />
                </div>
              )}

              {/* 6. Image */}
              <div>
                <label className="font-ui text-xs text-text-muted block mb-1.5">Image (optional)</label>
                <input
                  ref={imageInputRef}
                  type="file"
                  accept=".gif,.png,.jpeg,.jpg"
                  className="hidden"
                  onChange={handleImageUpload}
                />
                {question.imageDataUrl ? (
                  <div className="relative inline-block">
                    <img
                      src={question.imageDataUrl}
                      alt="Question"
                      className="max-h-40 rounded-lg border border-border object-contain"
                    />
                    <button
                      onClick={() => onUpdate({ imageDataUrl: undefined })}
                      className="absolute top-1 right-1 p-1 rounded-lg bg-base/90 text-text-muted hover:text-red hover:bg-red/10 transition-colors"
                      title="Remove image"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => imageInputRef.current?.click()}
                    className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-dashed border-border text-text-muted font-ui text-sm hover:border-gold/40 hover:text-gold/70 transition-colors"
                  >
                    <ImageIcon className="w-4 h-4" /> Upload Image
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Category Card ──────────────────────────────────────────────
function CategoryCard({ category }: { category: Category }) {
  const [expanded, setExpanded]   = useState(true);
  const updateCategoryName        = useGameStore((s) => s.updateCategoryName);
  const removeCategory            = useGameStore((s) => s.removeCategory);
  const updateQuestion            = useGameStore((s) => s.updateQuestion);
  const addQuestion               = useGameStore((s) => s.addQuestionToCategory);
  const removeQuestion            = useGameStore((s) => s.removeQuestionFromCategory);

  return (
    <div className="border border-border rounded-2xl bg-card overflow-hidden">
      <div className="flex items-center gap-3 px-5 py-4 border-b border-border bg-elevated/40">
        <input
          value={category.name}
          onChange={(e) => updateCategoryName(category.id, e.target.value)}
          className="flex-1 bg-transparent border-b border-transparent focus:border-gold/60 font-display text-xl text-gold outline-none pb-0.5 transition-colors"
          placeholder="Category Name"
        />
        <button
          onClick={() => setExpanded((v) => !v)}
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
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border border-dashed border-border text-text-muted font-ui text-sm hover:border-gold/40 hover:text-gold/70 transition-colors mt-2"
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

// ─── Quiz Editor Tab ────────────────────────────────────────────
function QuizEditorTab() {
  const quizSet        = useGameStore((s) => s.quizSet);
  const players        = useGameStore((s) => s.players);
  const teams          = useGameStore((s) => s.teams);
  const teamMode       = useGameStore((s) => s.teamMode);
  const setQuizName    = useGameStore((s) => s.setQuizName);
  const setTimerSeconds = useGameStore((s) => s.setTimerSeconds);
  const addCategory    = useGameStore((s) => s.addCategory);

  function handleExport() {
    const exportData: QuizExport = { quizSet, players, teams, teamMode };
    const json = JSON.stringify(exportData, null, 2);
    const blob = new Blob([json], { type: 'application/json' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `${quizSet.name.replace(/\s+/g, '_') || 'quiz'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-5 rounded-2xl border border-border bg-card">
        <div>
          <label className="font-ui text-sm text-text-muted block mb-1.5">Quiz Name</label>
          <input
            value={quizSet.name}
            onChange={(e) => setQuizName(e.target.value)}
            className={inputCls}
            placeholder="My Awesome Quiz"
          />
        </div>
        <div>
          <label className="font-ui text-sm text-text-muted flex items-center justify-between mb-1.5">
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

// ─── Player Bubble ──────────────────────────────────────────────
function PlayerBubble({
  player, isSelected, isDragging,
  onDragStart, onDragEnd, onClick, onRemove, onNameChange, onColorDotClick,
}: {
  player:           { id: string; name: string; color: string; teamId?: string };
  isSelected:       boolean;
  isDragging:       boolean;
  onDragStart:      (e: React.DragEvent, id: string) => void;
  onDragEnd:        () => void;
  onClick:          (id: string) => void;
  onRemove:         (id: string) => void;
  onNameChange:     (id: string, name: string) => void;
  onColorDotClick?: (id: string) => void;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, player.id)}
      onDragEnd={onDragEnd}
      onClick={() => onClick(player.id)}
      className={`relative flex items-center gap-2 pl-2 pr-1.5 py-1.5 rounded-full border-2
        cursor-grab active:cursor-grabbing transition-all select-none
        ${isSelected ? 'scale-105' : ''}
        ${isDragging ? 'opacity-40 scale-95' : ''}`}
      style={{
        borderColor: isSelected ? '#f0b429' : player.color,
        background:  player.color + '22',
        boxShadow:   isSelected ? `0 0 14px rgba(240,180,41,0.5)` : undefined,
      }}
    >
      {/* Color dot — acts as color-picker trigger */}
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onColorDotClick?.(player.id); }}
        title="Change color"
        className="w-5 h-5 rounded-full shrink-0 ring-2 ring-transparent hover:ring-white/40 transition-all"
        style={{ background: player.color }}
      />
      <input
        value={player.name}
        onChange={(e) => onNameChange(player.id, e.target.value)}
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => e.stopPropagation()}
        className="bg-transparent outline-none text-text-primary font-ui text-sm min-w-[40px]"
        style={{ width: `${Math.max(40, player.name.length * 9)}px` }}
      />
      <button
        onMouseDown={(e) => e.stopPropagation()}
        onClick={(e) => { e.stopPropagation(); onRemove(player.id); }}
        className="p-0.5 text-text-muted hover:text-red transition-colors shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

// ─── Team Zone ──────────────────────────────────────────────────
function TeamZone({
  team, teamPlayers, selectedPlayerId, dragPlayerId, usedTeamColors,
  onDragStart, onDragEnd, onDrop, onZoneClick, onBubbleClick,
  onRemovePlayer, onNameChange, onUpdateTeamName, onRemoveTeam, onColorDotClick,
}: {
  team:              { id: string; name: string; color: string };
  teamPlayers:       { id: string; name: string; color: string; teamId?: string }[];
  selectedPlayerId:  string | null;
  dragPlayerId:      string | null;
  usedTeamColors:    string[];
  onDragStart:       (e: React.DragEvent, id: string) => void;
  onDragEnd:         () => void;
  onDrop:            (e: React.DragEvent, teamId: string) => void;
  onZoneClick:       (teamId: string) => void;
  onBubbleClick:     (playerId: string) => void;
  onRemovePlayer:    (id: string) => void;
  onNameChange:      (id: string, name: string) => void;
  onUpdateTeamName:  (id: string, name: string) => void;
  onRemoveTeam:      (id: string) => void;
  onColorDotClick:   (id: string) => void;
}) {
  const [isDragOver, setIsDragOver] = useState(false);
  const isAssignTarget = !!selectedPlayerId;

  return (
    <div
      data-team-id={team.id}
      className={`p-4 rounded-2xl border-2 transition-all duration-200 ${
        isDragOver ? 'scale-[1.01]' : ''
      }`}
      style={{
        borderColor: isDragOver || isAssignTarget ? team.color : '#1e3058',
        background:  isDragOver ? team.color + '12' : undefined,
        boxShadow:   isDragOver ? `0 0 16px ${team.color}40` : undefined,
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
      onDragLeave={(e) => {
        if (!e.currentTarget.contains(e.relatedTarget as Node)) setIsDragOver(false);
      }}
      onDrop={(e) => { onDrop(e, team.id); setIsDragOver(false); }}
      onClick={() => isAssignTarget && onZoneClick(team.id)}
    >
      {/* Team header */}
      <div className="flex items-center gap-2 mb-3" onClick={(e) => e.stopPropagation()}>
        <div
          className="w-4 h-4 rounded-full shrink-0"
          style={{ background: team.color, boxShadow: `0 0 6px ${team.color}80` }}
        />
        <input
          value={team.name}
          onChange={(e) => onUpdateTeamName(team.id, e.target.value)}
          className="flex-1 bg-transparent font-display text-xl outline-none border-b border-transparent focus:border-gold/60 transition-colors pb-0.5 min-w-0"
          style={{ color: team.color }}
          placeholder="Team name"
        />
        <div className="flex gap-1 shrink-0">
          {TEAM_COLORS.map((c) => {
            const takenByOther = usedTeamColors.includes(c) && c !== team.color;
            return (
              <button
                key={c}
                disabled={takenByOther}
                onClick={() =>
                  !takenByOther &&
                  useGameStore.setState((s) => ({
                    teams: s.teams.map((t) => (t.id === team.id ? { ...t, color: c } : t)),
                  }))
                }
                title={takenByOther ? 'Already used by another team' : undefined}
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  takenByOther
                    ? 'opacity-20 cursor-not-allowed'
                    : 'hover:scale-110 cursor-pointer'
                }`}
                style={{ background: c, borderColor: team.color === c ? 'white' : 'transparent' }}
              />
            );
          })}
        </div>
        <button
          onClick={() => onRemoveTeam(team.id)}
          className="p-1.5 rounded-lg text-text-muted hover:text-red hover:bg-red/10 transition-colors shrink-0"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Players */}
      <div
        className="flex flex-wrap gap-2 min-h-[52px] rounded-xl p-2 transition-all"
        style={{ background: isDragOver ? team.color + '08' : 'rgba(0,0,0,0.15)' }}
        onClick={(e) => e.stopPropagation()}
      >
        {teamPlayers.map((p) => (
          <PlayerBubble
            key={p.id}
            player={p}
            isSelected={selectedPlayerId === p.id}
            isDragging={dragPlayerId === p.id}
            onDragStart={onDragStart}
            onDragEnd={onDragEnd}
            onClick={onBubbleClick}
            onRemove={onRemovePlayer}
            onNameChange={onNameChange}
            onColorDotClick={onColorDotClick}
          />
        ))}
        {teamPlayers.length === 0 && (
          <p className="text-text-muted text-sm font-ui py-1 px-1 w-full text-center">
            {isDragOver
              ? '✓ Drop here'
              : isAssignTarget
              ? 'Tap here to assign selected player'
              : 'Drag players here or select & tap'}
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Players Tab ────────────────────────────────────────────────
function PlayersTab() {
  const teamMode           = useGameStore((s) => s.teamMode);
  const setTeamMode        = useGameStore((s) => s.setTeamMode);
  const players            = useGameStore((s) => s.players);
  const teams              = useGameStore((s) => s.teams);
  const addPlayer          = useGameStore((s) => s.addPlayer);
  const removePlayer       = useGameStore((s) => s.removePlayer);
  const updatePlayerName   = useGameStore((s) => s.updatePlayerName);
  const updatePlayerColor  = useGameStore((s) => s.updatePlayerColor);
  const assignPlayerTeam   = useGameStore((s) => s.assignPlayerTeam);
  const addTeam            = useGameStore((s) => s.addTeam);
  const removeTeam         = useGameStore((s) => s.removeTeam);
  const updateTeamName     = useGameStore((s) => s.updateTeamName);
  const shufflePlayerTeams = useGameStore((s) => s.shufflePlayerTeams);

  const [newPlayerName,    setNewPlayerName]    = useState('');
  const [selectedPlayerId, setSelectedPlayerId] = useState<string | null>(null);
  const [dragPlayerId,     setDragPlayerId]     = useState<string | null>(null);
  // Shared color-picker state — null means closed
  const [colorPickerId,    setColorPickerId]    = useState<string | null>(null);

  function handleAddPlayer() {
    if (!newPlayerName.trim()) return;
    addPlayer(newPlayerName.trim());
    setNewPlayerName('');
  }

  // ── Color picker helpers ──────────────────────────────────────
  function openColorPicker(id: string) {
    setColorPickerId((prev) => (prev === id ? null : id));
    setSelectedPlayerId(null); // don't mix states
  }
  function closeColorPicker() { setColorPickerId(null); }

  // ── Drag helpers ──────────────────────────────────────────────
  function handleDragStart(e: React.DragEvent, id: string) {
    e.dataTransfer.setData('playerId', id);
    e.dataTransfer.effectAllowed = 'move';
    setDragPlayerId(id);
  }
  function handleDragEnd() { setDragPlayerId(null); }

  function handleDropOnTeam(e: React.DragEvent, teamId: string | null) {
    e.preventDefault();
    const id = e.dataTransfer.getData('playerId');
    if (id) assignPlayerTeam(id, teamId ?? undefined);
    setDragPlayerId(null);
  }
  function handleDropOnPool(e: React.DragEvent) {
    e.preventDefault();
    const id = e.dataTransfer.getData('playerId');
    if (id) assignPlayerTeam(id, undefined);
    setDragPlayerId(null);
  }

  // ── Team-assignment tap helpers ───────────────────────────────
  function handleBubbleClick(id: string) {
    setColorPickerId(null);
    setSelectedPlayerId((prev) => (prev === id ? null : id));
  }
  function handleZoneClick(teamId: string) {
    if (!selectedPlayerId) return;
    assignPlayerTeam(selectedPlayerId, teamId);
    setSelectedPlayerId(null);
  }
  function handlePoolClick() {
    if (!selectedPlayerId) return;
    assignPlayerTeam(selectedPlayerId, undefined);
    setSelectedPlayerId(null);
  }

  const unassigned = teamMode === 'teams' ? players.filter((p) => !p.teamId) : players;
  const colorPickerPlayer = players.find((p) => p.id === colorPickerId);

  // No-op drag handlers for individual mode (bubbles aren't dragged to teams)
  const noopDragStart = (e: React.DragEvent, _id: string) => { e.preventDefault(); };
  const noopDragEnd   = () => {};

  return (
    <div className="space-y-5">

      {/* Mode toggle */}
      <div className="p-5 rounded-2xl border border-border bg-card">
        <label className="font-ui text-sm text-text-muted block mb-3">Game Mode</label>
        <div className="flex gap-3">
          {(['individual', 'teams'] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => { setTeamMode(mode); setColorPickerId(null); setSelectedPlayerId(null); }}
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

      {/* ── Shared color picker panel ── */}
      <AnimatePresence>
        {colorPickerPlayer && (
          <motion.div
            key="color-picker"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.18 }}
            className="overflow-hidden"
          >
            <div className="p-4 rounded-2xl border border-gold/30 bg-gold/5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full shrink-0" style={{ background: colorPickerPlayer.color }} />
                  <span className="font-ui text-sm text-gold">
                    Color for <strong>{colorPickerPlayer.name}</strong>
                  </span>
                </div>
                <button
                  onClick={closeColorPicker}
                  className="p-1 text-gold/60 hover:text-gold transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {PLAYER_COLORS.map((c) => (
                  <button
                    key={c}
                    onClick={() => { updatePlayerColor(colorPickerPlayer.id, c); closeColorPicker(); }}
                    className="w-9 h-9 rounded-full transition-all hover:scale-110 active:scale-95"
                    style={{
                      background:  c,
                      outline:     colorPickerPlayer.color === c ? `3px solid white` : '3px solid transparent',
                      outlineOffset: '2px',
                      boxShadow:   colorPickerPlayer.color === c ? `0 0 10px ${c}` : undefined,
                    }}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Add player */}
      <div className="p-5 rounded-2xl border border-border bg-card">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-display text-xl text-text-primary">
            Players
            {players.length > 0 && (
              <span className="ml-2 font-ui text-sm text-text-muted font-normal">{players.length} added</span>
            )}
          </h3>
        </div>
        <div className="flex gap-2">
          <input
            value={newPlayerName}
            onChange={(e) => setNewPlayerName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAddPlayer()}
            className={inputCls}
            placeholder="Player name…"
          />
          <button onClick={handleAddPlayer} className={btnPrimary + ' shrink-0'}>
            <Plus className="w-4 h-4" /> Add
          </button>
        </div>
      </div>

      {/* ── Individual mode: bubbles ── */}
      {teamMode === 'individual' && players.length > 0 && (
        <div className="p-4 rounded-2xl border border-border bg-card">
          <p className="font-ui text-xs text-text-muted mb-3">
            Tap the colored dot on any player to change their color.
          </p>
          <div className="flex flex-wrap gap-2">
            {players.map((p) => (
              <PlayerBubble
                key={p.id}
                player={p}
                isSelected={colorPickerId === p.id}
                isDragging={false}
                onDragStart={noopDragStart}
                onDragEnd={noopDragEnd}
                // Clicking the bubble body also opens the color picker in individual mode
                onClick={openColorPicker}
                onRemove={removePlayer}
                onNameChange={updatePlayerName}
                onColorDotClick={openColorPicker}
              />
            ))}
          </div>
        </div>
      )}

      {/* ── Team mode: drag-drop bubble board ── */}
      {teamMode === 'teams' && (
        <>
          {/* Selected-player hint */}
          <AnimatePresence>
            {selectedPlayerId && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="flex items-center gap-3 px-4 py-3 rounded-xl bg-gold/10 border border-gold/30"
              >
                <div
                  className="w-3 h-3 rounded-full shrink-0"
                  style={{ background: players.find((p) => p.id === selectedPlayerId)?.color }}
                />
                <span className="font-ui text-sm text-gold flex-1">
                  <strong>{players.find((p) => p.id === selectedPlayerId)?.name}</strong>
                  {' '}selected — tap a team to assign, or tap the pool to unassign
                </span>
                <button
                  onClick={() => setSelectedPlayerId(null)}
                  className="p-1 text-gold/60 hover:text-gold shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Unassigned pool */}
          <div
            className={`p-4 rounded-2xl border-2 border-dashed transition-all duration-200 ${
              selectedPlayerId ? 'border-gold/50 cursor-pointer' : 'border-border'
            }`}
            style={{ background: selectedPlayerId ? 'rgba(240,180,41,0.04)' : undefined }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDropOnPool}
            onClick={handlePoolClick}
          >
            <div className="font-ui text-sm text-text-muted mb-3 flex items-center gap-2">
              <span>Unassigned</span>
              <span className="px-1.5 py-0.5 rounded-full bg-elevated text-xs font-mono">{unassigned.length}</span>
              {selectedPlayerId && (
                <span className="text-gold text-xs ml-1">← tap here to unassign</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 min-h-[48px]">
              {unassigned.map((p) => (
                <PlayerBubble
                  key={p.id}
                  player={p}
                  isSelected={selectedPlayerId === p.id}
                  isDragging={dragPlayerId === p.id}
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                  onClick={handleBubbleClick}
                  onRemove={removePlayer}
                  onNameChange={updatePlayerName}
                  onColorDotClick={openColorPicker}
                />
              ))}
              {unassigned.length === 0 && (
                <p className="text-text-muted text-sm font-ui py-1 w-full text-center">
                  All players are in teams 🎉
                </p>
              )}
            </div>
          </div>

          {/* Teams header + controls */}
          <div className="flex items-center justify-between">
            <h3 className="font-display text-xl text-text-primary">Teams</h3>
            <div className="flex gap-2">
              {teams.length > 0 && players.length > 0 && (
                <button
                  onClick={shufflePlayerTeams}
                  className={btnSecondary}
                  title="Randomly distribute all players across teams"
                >
                  <Shuffle className="w-4 h-4" /> Shuffle
                </button>
              )}
              <button onClick={addTeam} className={btnSecondary}>
                <Plus className="w-4 h-4" /> Add Team
              </button>
            </div>
          </div>

          {/* Team zones */}
          <div className="space-y-3">
            {teams.map((team) => (
              <TeamZone
                key={team.id}
                team={team}
                teamPlayers={players.filter((p) => p.teamId === team.id)}
                selectedPlayerId={selectedPlayerId}
                dragPlayerId={dragPlayerId}
                usedTeamColors={teams.map((t) => t.color)}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDropOnTeam}
                onZoneClick={handleZoneClick}
                onBubbleClick={handleBubbleClick}
                onRemovePlayer={removePlayer}
                onNameChange={updatePlayerName}
                onUpdateTeamName={updateTeamName}
                onRemoveTeam={removeTeam}
                onColorDotClick={openColorPicker}
              />
            ))}
            {teams.length === 0 && (
              <p className="text-text-muted text-sm font-ui text-center py-4">
                No teams yet. Add a team above, then drag or tap players into it.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}

// ─── SetupPage ──────────────────────────────────────────────────
export default function SetupPage() {
  const setPhase   = useGameStore((s) => s.setPhase);
  const startGame  = useGameStore((s) => s.startGame);
  const quizSet    = useGameStore((s) => s.quizSet);
  const players    = useGameStore((s) => s.players);
  const setupTab   = useGameStore((s) => s.setupTab);
  const setSetupTab = useGameStore((s) => s.setSetupTab);

  const canStart =
    quizSet.categories.length > 0 &&
    quizSet.categories.every((c) => c.questions.length > 0);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-card/60 backdrop-blur-sm sticky top-0 z-10">
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
          className={`flex items-center gap-2 px-6 py-3 rounded-xl font-ui font-semibold text-sm transition-all ${
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
