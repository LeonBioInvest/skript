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
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-8 h-14 gap-4">
        {/* Brand */}
        <div className="flex items-center gap-4 min-w-0">
          <button
            onClick={onBack}
            className="font-mono text-[11px] tracking-wider text-text2 hover:text-text transition-colors uppercase flex items-center gap-1.5 border border-border/60 hover:border-border rounded-lg px-2.5 py-1 whitespace-nowrap"
          >
            ← Skripte
          </button>
          <div className="h-4 w-px bg-border" />
          <span className="font-display text-lg font-bold text-accent leading-none">BioInvest</span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-text3 hidden sm:block truncate">
            {scriptName}
          </span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-4 flex-shrink-0">
          {/* Progress */}
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs text-text2">
              {done} / {total}
            </span>
            <div className="w-28 h-1.5 bg-border/50 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-dim to-accent rounded-full transition-[width] duration-500 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>

          <div className="h-4 w-px bg-border" />

          {/* Theme toggle */}
          <button
            onClick={toggle}
            title={theme === 'dark' ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren'}
            className="w-8 h-8 rounded-lg border border-border hover:border-accent/50 bg-surface2 hover:bg-surface3 flex items-center justify-center transition-all duration-150 text-text2 hover:text-accent text-base"
          >
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
        </div>
      </div>
    </header>
  );
}
