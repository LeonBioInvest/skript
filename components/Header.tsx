'use client';

import { useTheme } from './ThemeProvider';

interface Props {
  scriptName: string;
  done: number;
  total: number;
  onBack: () => void;
}

export default function Header({ scriptName, done, total, onBack }: Props) {
  const pct = total > 0 ? (done / total) * 100 : 0;
  const { theme, toggle } = useTheme();

  return (
    <header className="sticky top-0 z-40 bg-surface/90 backdrop-blur-xl border-b border-border/60"
      style={{ boxShadow: '0 1px 0 rgb(var(--border) / 0.5), 0 2px 8px rgb(0 0 0 / 0.04)' }}
    >
      <div className="flex items-center justify-between px-6 h-14 gap-4 max-w-screen-2xl mx-auto">

        {/* Left: back + brand */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 font-mono text-[11px] tracking-wider uppercase text-text3 hover:text-text2 border border-border/60 hover:border-border rounded-lg px-2.5 py-1.5 transition-all duration-150 whitespace-nowrap"
          >
            ← Skripte
          </button>

          <div className="h-4 w-px bg-border/60" />

          <span className="font-display text-[1.1rem] font-bold text-accent leading-none">
            BioInvest
          </span>

          <span className="font-mono text-[10px] tracking-widest uppercase text-text3 hidden sm:block truncate max-w-[200px]">
            {scriptName}
          </span>
        </div>

        {/* Right: progress + theme */}
        <div className="flex items-center gap-4 flex-shrink-0">

          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-[11px] text-text2 tabular-nums">
              {done} / {total}
            </span>
            <div className="w-24 h-1.5 bg-border/40 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-dim to-accent rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-text3 hidden sm:block">
              {Math.round(pct)}%
            </span>
          </div>

          <div className="h-4 w-px bg-border/60" />

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Hellmodus' : 'Dunkelmodus'}
            className="w-8 h-8 rounded-lg border border-border/60 hover:border-accent/40 bg-surface2 hover:bg-surface3 flex items-center justify-center text-sm transition-all duration-150 text-text2 hover:text-accent"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
