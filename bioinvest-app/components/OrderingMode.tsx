'use client';

import { useState } from 'react';
import { Script } from '@/lib/types';
import { cn } from '@/lib/cn';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface OrderState {
  pool: string[];
  slots: (string | null)[];
}

interface Props {
  script: Script;
  onBack: () => void;
}

function Chip({
  label,
  from,
  correctness,
}: {
  label: string;
  from: 'pool' | number;
  correctness?: boolean;
}) {
  return (
    <div
      draggable
      onDragStart={(e) => {
        e.dataTransfer.setData('item', label);
        e.dataTransfer.setData('from', from === 'pool' ? 'pool' : String(from));
        e.dataTransfer.effectAllowed = 'move';
      }}
      className={cn(
        'px-3 py-2 rounded-lg font-mono text-xs border cursor-grab active:cursor-grabbing select-none transition-all duration-150 text-center leading-snug',
        correctness === undefined
          ? 'bg-surface2 border-border text-text2 hover:border-blue/50 hover:text-text'
          : correctness
          ? 'bg-accent-glow border-accent/50 text-accent'
          : 'bg-err-dim border-err/50 text-err',
      )}
    >
      {label}
    </div>
  );
}

export default function OrderingMode({ script, onBack }: Props) {
  const sections = script.sections ?? [];

  const [state, setState] = useState<OrderState>(() => ({
    pool: shuffle(sections),
    slots: new Array(sections.length).fill(null),
  }));
  const [dragOver, setDragOver] = useState<'pool-left' | 'pool-right' | number | null>(null);
  const [checked, setChecked] = useState(false);
  const [correctSlots, setCorrectSlots] = useState<boolean[]>([]);

  const allFilled = state.slots.every(s => s !== null);
  const correctCount = correctSlots.filter(Boolean).length;
  const perfect = checked && correctCount === sections.length;

  const half = Math.ceil(state.pool.length / 2);
  const poolLeft = state.pool.slice(0, half);
  const poolRight = state.pool.slice(half);

  function move(item: string, from: 'pool' | number, target: 'pool' | number) {
    if (from === target) return;
    setState(prev => {
      const newPool = [...prev.pool];
      const newSlots = [...prev.slots];
      const displaced = typeof target === 'number' ? newSlots[target] : null;

      if (from === 'pool') {
        const idx = newPool.indexOf(item);
        if (idx !== -1) newPool.splice(idx, 1);
      } else {
        newSlots[from] = null;
      }

      if (target === 'pool') {
        newPool.push(item);
      } else {
        if (displaced) {
          from === 'pool' ? newPool.push(displaced) : (newSlots[from] = displaced);
        }
        newSlots[target] = item;
      }

      return { pool: newPool, slots: newSlots };
    });
    if (checked) { setChecked(false); setCorrectSlots([]); }
  }

  function parseDrop(e: React.DragEvent): { item: string; from: 'pool' | number } {
    const item = e.dataTransfer.getData('item');
    const fromRaw = e.dataTransfer.getData('from');
    return { item, from: fromRaw === 'pool' ? 'pool' : parseInt(fromRaw) };
  }

  function check() {
    setCorrectSlots(state.slots.map((item, i) => item === sections[i]));
    setChecked(true);
  }

  function reset() {
    setState({ pool: shuffle(sections), slots: new Array(sections.length).fill(null) });
    setChecked(false);
    setCorrectSlots([]);
  }

  const poolIsOver = dragOver === 'pool-left' || dragOver === 'pool-right';

  return (
    <div className="min-h-screen bg-bg flex flex-col">
      {/* Top bar */}
      <div className="sticky top-0 z-10 bg-bg/90 backdrop-blur border-b border-border px-6 py-3 flex items-center justify-between gap-4">
        <button
          onClick={onBack}
          className="font-mono text-xs text-text3 hover:text-text2 transition-colors flex items-center gap-1 flex-shrink-0"
        >
          ← Zurück
        </button>
        <span className="font-mono text-xs text-text3 hidden sm:block">
          {script.icon} {script.name} — Gesprächsstruktur
        </span>
        <div className="flex gap-2 flex-shrink-0">
          <button
            onClick={reset}
            className="font-mono text-xs px-3 py-1.5 rounded-lg border border-border text-text3 hover:text-text2 hover:border-text3/50 transition-all"
          >
            ↺ Reset
          </button>
          <button
            onClick={check}
            disabled={!allFilled}
            className={cn(
              'font-mono text-xs px-4 py-1.5 rounded-lg border transition-all',
              allFilled
                ? 'border-accent/50 bg-accent-glow text-accent hover:bg-accent/20 cursor-pointer'
                : 'border-border bg-surface2 text-text3 opacity-40 cursor-not-allowed',
            )}
          >
            Prüfen
          </button>
        </div>
      </div>

      {/* Score banner */}
      {checked && (
        <div className={cn(
          'px-6 py-3 text-center font-mono text-sm border-b',
          perfect
            ? 'bg-accent-glow border-accent/30 text-accent'
            : 'bg-surface border-border text-text2',
        )}>
          {perfect
            ? '🎉 Perfekt! Alle Abschnitte in der richtigen Reihenfolge.'
            : `${correctCount} / ${sections.length} richtig — korrigiere die roten Felder und prüfe erneut.`}
        </div>
      )}

      {/* 3-column layout */}
      <div className="flex flex-1 gap-4 p-6 max-w-6xl mx-auto w-full">

        {/* Left pool */}
        <div
          className={cn(
            'w-52 flex-shrink-0 flex flex-col gap-2 p-3 rounded-xl border min-h-[200px] self-start transition-colors',
            dragOver === 'pool-left' ? 'border-blue/40 bg-blue-dim' : 'border-border bg-surface',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver('pool-left'); }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => { e.preventDefault(); setDragOver(null); const { item, from } = parseDrop(e); move(item, from, 'pool'); }}
        >
          <span className="font-mono text-[10px] tracking-widest uppercase text-text3 mb-1 text-center">Überschriften</span>
          {poolLeft.map(item => (
            <Chip key={item} label={item} from="pool" />
          ))}
          {poolLeft.length === 0 && !poolIsOver && (
            <span className="text-text3/40 text-xs font-mono text-center py-3 italic">leer</span>
          )}
        </div>

        {/* Center: numbered slots */}
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <span className="font-mono text-[10px] tracking-widest uppercase text-text3 mb-1 text-center">Gesprächsstruktur</span>
          {sections.map((section, i) => {
            const filled = state.slots[i];
            const isOver = dragOver === i;
            const isCorrect = checked && correctSlots[i] === true;
            const isWrong = checked && correctSlots[i] === false;
            return (
              <div
                key={i}
                className={cn(
                  'flex items-center gap-3 rounded-xl border px-3 py-2 min-h-[46px] transition-all duration-150',
                  isOver
                    ? 'border-accent/60 bg-accent-glow'
                    : filled
                    ? isCorrect
                      ? 'border-accent/30 bg-accent-glow'
                      : isWrong
                      ? 'border-err/30 bg-err-dim'
                      : 'border-border/70 bg-surface'
                    : 'border-dashed border-border/50 bg-surface/30',
                )}
                onDragOver={(e) => { e.preventDefault(); setDragOver(i); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => { e.preventDefault(); setDragOver(null); const { item, from } = parseDrop(e); move(item, from, i); }}
              >
                <span className="font-mono text-xs text-text3 w-5 text-right flex-shrink-0 select-none">
                  {i + 1}.
                </span>
                {filled ? (
                  <div className="flex-1 flex items-center gap-2 min-w-0 flex-wrap">
                    <Chip
                      label={filled}
                      from={i}
                      correctness={checked ? correctSlots[i] : undefined}
                    />
                    {isWrong && (
                      <span className="font-mono text-[11px] text-text3 flex items-center gap-1">
                        → <span className="text-accent">{section}</span>
                      </span>
                    )}
                  </div>
                ) : (
                  <span className="text-text3/40 text-xs font-mono italic select-none">
                    Hier ablegen …
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {/* Right pool */}
        <div
          className={cn(
            'w-52 flex-shrink-0 flex flex-col gap-2 p-3 rounded-xl border min-h-[200px] self-start transition-colors',
            dragOver === 'pool-right' ? 'border-blue/40 bg-blue-dim' : 'border-border bg-surface',
          )}
          onDragOver={(e) => { e.preventDefault(); setDragOver('pool-right'); }}
          onDragLeave={() => setDragOver(null)}
          onDrop={(e) => { e.preventDefault(); setDragOver(null); const { item, from } = parseDrop(e); move(item, from, 'pool'); }}
        >
          <span className="font-mono text-[10px] tracking-widest uppercase text-text3 mb-1 text-center">&nbsp;</span>
          {poolRight.map(item => (
            <Chip key={item} label={item} from="pool" />
          ))}
          {poolRight.length === 0 && !poolIsOver && (
            <span className="text-text3/40 text-xs font-mono text-center py-3 italic">leer</span>
          )}
        </div>
      </div>
    </div>
  );
}
