'use client';

import { Script } from '@/lib/types';
import { SCRIPTS } from '@/lib/scripts';
import { cn } from '@/lib/cn';

const CARD_ACCENTS = [
  'from-accent/80 to-blue/80',
  'from-purple/80 to-accent/80',
  'from-blue/80 to-purple/80',
  'from-warn/80 to-err/80',
];

interface Props {
  onSelect: (script: Script) => void;
}

export default function ScriptPicker({ onSelect }: Props) {
  return (
    <div className="relative z-10 min-h-screen flex flex-col items-center justify-center px-6 py-16">
      {/* Hero */}
      <div className="text-center mb-16 animate-fade-up">
        <div className="inline-flex items-center gap-2 bg-accent/10 border border-accent/20 rounded-full px-4 py-1.5 mb-6">
          <span className="text-accent font-mono text-xs tracking-widest uppercase">Training</span>
        </div>
        <h1 className="font-display text-5xl font-bold text-text mb-3 leading-tight">
          Bio<span className="text-accent">Invest</span>
        </h1>
        <p className="font-mono text-text3 text-sm tracking-widest uppercase">
          Skript · Training · System
        </p>
      </div>

      {/* Section heading */}
      <div className="w-full max-w-3xl text-center mb-2 stagger-2 animate-fade-up">
        <h2 className="font-display text-2xl font-semibold text-text mb-2">
          Welches Skript möchtest du üben?
        </h2>
        <p className="text-text2 text-sm">
          Wähle ein Skript aus — das Training startet sofort.
        </p>
      </div>

      {/* Cards */}
      <div className="w-full max-w-3xl mt-10 grid grid-cols-1 sm:grid-cols-2 gap-4">
        {SCRIPTS.map((script, i) => (
          <ScriptCard
            key={script.id}
            script={script}
            accent={CARD_ACCENTS[i % CARD_ACCENTS.length]}
            delay={i}
            onSelect={onSelect}
          />
        ))}
      </div>

      {/* Footer */}
      <p className="mt-16 font-mono text-text3 text-xs tracking-widest animate-fade-in">
        BioInvest Training v3 — Dark Mode Only
      </p>
    </div>
  );
}

function ScriptCard({
  script,
  accent,
  delay,
  onSelect,
}: {
  script: Script;
  accent: string;
  delay: number;
  onSelect: (s: Script) => void;
}) {
  return (
    <button
      onClick={() => onSelect(script)}
      className={cn(
        'group relative text-left bg-surface border border-border rounded-2xl p-6',
        'hover:border-accent/40 hover:-translate-y-1 hover:shadow-[0_12px_40px_rgba(34,197,94,0.12)]',
        'transition-all duration-300 cursor-pointer overflow-hidden',
        'animate-fade-up',
        `stagger-${Math.min(delay + 1, 6)}`,
      )}
    >
      {/* Top gradient bar */}
      <div
        className={cn(
          'absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r opacity-0',
          'group-hover:opacity-100 transition-opacity duration-300',
          accent,
        )}
      />

      {/* Subtle glow on hover */}
      <div className="absolute inset-0 bg-gradient-to-br from-accent/0 to-accent/0 group-hover:from-accent/[0.03] transition-all duration-300 rounded-2xl" />

      <div className="relative">
        <div className="text-3xl mb-4">{script.icon}</div>
        <div className="font-display text-xl font-semibold text-text mb-2 leading-snug">
          {script.name}
        </div>
        <div className="text-text2 text-sm leading-relaxed mb-4">
          {script.desc}
        </div>
        <div className="flex flex-wrap gap-2">
          {script.pills.map(pill => (
            <span
              key={pill}
              className="font-mono text-[11px] px-2.5 py-0.5 rounded-full bg-surface2 border border-border text-text3 group-hover:border-accent/30 group-hover:text-accent transition-colors duration-200"
            >
              {pill}
            </span>
          ))}
        </div>
      </div>
    </button>
  );
}
