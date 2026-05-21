'use client';

import { Script } from '@/lib/types';
import { SCRIPTS } from '@/lib/scripts';
import { cn } from '@/lib/types';
import { useTheme } from './ThemeProvider';

interface Props {
  onSelect: (script: Script) => void;
}

export default function ScriptPicker({ onSelect }: Props) {
  const { theme, toggle } = useTheme();

  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center px-6 pt-24 pb-20">

      {/* Theme toggle */}
      <div className="fixed top-5 right-6 z-50">
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Hellmodus aktivieren' : 'Dunkelmodus aktivieren'}
          className="flex items-center gap-2 bg-surface/90 border border-border backdrop-blur-sm hover:border-accent/40 text-text2 hover:text-text rounded-xl px-3.5 py-2 font-mono text-[11px] tracking-wider uppercase transition-all duration-200 shadow-sm"
        >
          {theme === 'dark' ? '☀️ Hell' : '🌙 Dunkel'}
        </button>
      </div>

      {/* ── Hero ── */}
      <div className="text-center mb-14 animate-fade-up max-w-lg mx-auto">
        <span className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 text-accent font-mono text-[10px] tracking-[0.12em] uppercase rounded-full px-4 py-1.5 mb-7">
          Skript · Training · System
        </span>

        <h1 className="font-display text-[3.75rem] font-bold leading-[1.06] tracking-tight mb-4">
          <span className="text-text">Bio</span>
          <span className="text-accent">Invest</span>
        </h1>

        <p className="text-text2 text-[0.95rem] leading-relaxed max-w-xs mx-auto">
          Übe deine Verkaufsskripte — Lückentext, Passagen und mehr.
        </p>
      </div>

      {/* ── Script list ── */}
      <div className="w-full max-w-xl">
        <p className="font-mono text-[10px] tracking-[0.14em] uppercase text-text3 mb-4 px-1 stagger-2 animate-fade-up">
          Skript auswählen
        </p>

        <div className="flex flex-col gap-3">
          {SCRIPTS.map((script, i) => (
            <ScriptCard
              key={script.id}
              script={script}
              delay={i}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>

      {/* ── Footer ── */}
      <p className="mt-20 font-mono text-[10px] tracking-widest uppercase text-text3 animate-fade-in">
        BioInvest Training · v3
      </p>
    </div>
  );
}

const ICON_BG = [
  'bg-accent/10 group-hover:bg-accent/15',
  'bg-blue/10 group-hover:bg-blue/15',
  'bg-purple/10 group-hover:bg-purple/15',
  'bg-warn/10 group-hover:bg-warn/15',
];

function ScriptCard({
  script,
  delay,
  onSelect,
}: {
  script: Script;
  delay: number;
  onSelect: (s: Script) => void;
}) {
  return (
    <button
      onClick={() => onSelect(script)}
      className={cn(
        'group relative flex items-center gap-5 text-left w-full',
        'bg-surface border border-border/70 rounded-2xl px-5 py-4',
        'shadow-[0_1px_3px_rgb(0_0_0/0.04),0_4px_12px_rgb(0_0_0/0.04)]',
        'hover:border-accent/35 hover:shadow-[0_4px_20px_rgb(34_197_94/0.10),0_8px_28px_rgb(0_0_0/0.07)]',
        'hover:-translate-y-0.5 transition-all duration-300 cursor-pointer overflow-hidden',
        'animate-fade-up',
        `stagger-${Math.min(delay + 1, 6)}`,
      )}
    >
      {/* Left accent line on hover */}
      <div className="absolute left-0 top-3 bottom-3 w-[3px] bg-accent rounded-r-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Icon */}
      <div className={cn(
        'w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 transition-colors duration-300',
        ICON_BG[delay % ICON_BG.length],
      )}>
        {script.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 py-0.5">
        <div className="font-display text-[1.05rem] font-semibold text-text mb-0.5 leading-snug group-hover:text-accent transition-colors duration-200">
          {script.name}
        </div>
        <div className="text-text2 text-[0.825rem] leading-relaxed mb-2.5 line-clamp-2">
          {script.desc}
        </div>
        <div className="flex flex-wrap gap-1.5">
          {script.pills.map(pill => (
            <span
              key={pill}
              className="font-mono text-[10px] px-2 py-0.5 rounded-md bg-surface2 text-text3 border border-border/50 transition-colors duration-200 group-hover:border-accent/20 group-hover:text-text2"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>

      {/* Arrow */}
      <div className="text-text3 group-hover:text-accent group-hover:translate-x-1 transition-all duration-200 flex-shrink-0 text-base pr-1">
        →
      </div>
    </button>
  );
}
