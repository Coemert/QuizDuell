import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Palette } from 'lucide-react';

const THEMES = [
  { id: 'deep-space', label: 'Deep Space', bg: '#0f1829', accent: '#f0b429' },
  { id: 'midnight',   label: 'Midnight',   bg: '#100c24', accent: '#a78bfa' },
  { id: 'forest',     label: 'Forest',     bg: '#08180f', accent: '#4ade80' },
  { id: 'ember',      label: 'Ember',      bg: '#220a0a', accent: '#fb923c' },
  { id: 'parchment',  label: 'Parchment',  bg: '#fffbf0', accent: '#92400e' },
  { id: 'arctic',     label: 'Arctic',     bg: '#f8fcff', accent: '#1d4ed8' },
] as const;

type ThemeId = typeof THEMES[number]['id'];

export default function ThemeSwitcher() {
  const [open, setOpen] = useState(false);
  const [current, setCurrent] = useState<ThemeId>('deep-space');

  useEffect(() => {
    const saved = localStorage.getItem('sq-theme') as ThemeId | null;
    if (saved && THEMES.some((t) => t.id === saved)) {
      setCurrent(saved);
    }
  }, []);

  function applyTheme(id: ThemeId) {
    document.documentElement.setAttribute('data-theme', id);
    localStorage.setItem('sq-theme', id);
    setCurrent(id);
    setOpen(false);
  }

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {open && (
          <>
            <div
              className="fixed inset-0"
              style={{ zIndex: -1 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              className="absolute bottom-14 right-0 bg-card border border-border rounded-2xl p-2 shadow-2xl min-w-[168px]"
              initial={{ opacity: 0, y: 6, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 6, scale: 0.95 }}
              transition={{ duration: 0.14 }}
            >
              {THEMES.map((t) => {
                const active = current === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => applyTheme(t.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left text-sm font-ui transition-colors
                      ${active ? 'bg-gold/10 text-gold' : 'text-text-primary hover:bg-elevated'}`}
                  >
                    {/* Half-half preview: bg left, accent right */}
                    <span
                      className="w-5 h-5 rounded-full border-2 shrink-0 overflow-hidden flex"
                      style={{ borderColor: t.accent + '55' }}
                    >
                      <span className="flex-1" style={{ background: t.bg }} />
                      <span className="flex-1" style={{ background: t.accent }} />
                    </span>
                    <span className="flex-1">{t.label}</span>
                    {active && <span className="text-xs opacity-70">✓</span>}
                  </button>
                );
              })}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <button
        onClick={() => setOpen((v) => !v)}
        className={`w-11 h-11 rounded-full bg-card border shadow-lg flex items-center justify-center
          transition-colors ${open ? 'border-gold/50 text-gold' : 'border-border text-text-secondary hover:text-gold hover:border-gold/40'}`}
        title="Change theme"
      >
        <Palette className="w-4 h-4" />
      </button>
    </div>
  );
}
