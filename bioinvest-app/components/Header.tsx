'use client';

interface Props {
  scriptName: string;
  done: number;
  total: number;
  onBack: () => void;
}

export default function Header({ scriptName, done, total, onBack }: Props) {
  const pct = total > 0 ? (done / total) * 100 : 0;

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/80 backdrop-blur-xl">
      <div className="flex items-center justify-between px-8 h-14">
        {/* Brand */}
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="font-mono text-[11px] tracking-wider text-text3 hover:text-text2 transition-colors uppercase flex items-center gap-1.5"
          >
            ← Skripte
          </button>
          <div className="h-4 w-px bg-border" />
          <span className="font-display text-lg font-bold text-accent leading-none">BioInvest</span>
          <span className="font-mono text-[10px] tracking-widest uppercase text-text3 hidden sm:block">
            {scriptName}
          </span>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs text-text3">
            {done} <span className="text-text3">/</span> {total}
          </span>
          <div className="w-32 h-1 bg-surface2 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-accent-dim to-accent rounded-full transition-[width] duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </div>
    </header>
  );
}
