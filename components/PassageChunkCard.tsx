'use client';

import { ProcessedChunk, ChunkState } from '@/lib/types';
import { cn } from '@/lib/cn';

interface Props {
  idx: number;
  total: number;
  pc: ProcessedChunk;
  state: ChunkState;
  isActive: boolean;
  isLast: boolean;
  onPassageChange: (chunkIdx: number, value: string) => void;
  onCheck: (chunkIdx: number) => void;
  onSkip: (chunkIdx: number) => void;
  onNext: (chunkIdx: number) => void;
  onShowDashboard: () => void;
}

export default function PassageChunkCard({
  idx, total, pc, state, isActive, isLast,
  onPassageChange, onCheck, onSkip, onNext, onShowDashboard,
}: Props) {
  const score = state.passageScore;
  const scoreColor =
    score === undefined ? '' :
    score >= 80 ? 'text-accent' :
    score >= 50 ? 'text-warn' : 'text-err';

  const cardClass = cn(
    'rounded-2xl border p-7 transition-all duration-300',
    !state.checked && !state.skipped && isActive
      ? 'bg-surface border-blue/40 shadow-[0_0_0_1px_rgba(96,165,250,0.15),0_8px_32px_rgba(96,165,250,0.08)]'
      : !state.checked && !state.skipped
      ? 'bg-surface border-border'
      : state.skipped
      ? 'bg-surface border-border opacity-55'
      : score !== undefined && score >= 80
      ? 'bg-surface border-accent/30'
      : 'bg-surface border-warn/30',
  );

  // Hint: first 5 words
  const words = pc.rawText.split(/\s+/).filter(Boolean);
  const hint = words.slice(0, 5).join(' ') + (words.length > 5 ? ' …' : '');

  return (
    <div id={`chunk-${idx}`} className={cardClass}>
      {/* Chunk number */}
      <div className="font-mono text-[10px] tracking-widest uppercase text-text3 mb-4">
        Passage {idx + 1} von {total}
      </div>

      {/* Hint */}
      <div className="flex items-start gap-2 bg-surface2 border border-border rounded-xl px-4 py-3 mb-4">
        <span className="font-mono text-[10px] tracking-wider uppercase text-text3 mt-0.5 flex-shrink-0">Anfang:</span>
        <span className="text-sm text-blue italic leading-relaxed">{hint}</span>
      </div>

      {/* Textarea */}
      <textarea
        className={cn(
          'w-full rounded-xl border bg-surface2 px-4 py-3 text-text text-[0.95rem] leading-relaxed',
          'outline-none resize-y transition-colors duration-200 font-sans',
          'placeholder:text-text3',
          state.checked
            ? score !== undefined && score >= 80
              ? 'border-accent/40 bg-accent/[0.04]'
              : score !== undefined && score >= 50
              ? 'border-warn/40 bg-warn/[0.04]'
              : 'border-err/40 bg-err/[0.04]'
            : 'border-border focus:border-blue/50',
        )}
        rows={4}
        placeholder="Schreibe die Passage aus dem Gedächtnis…"
        spellCheck={false}
        autoComplete="off"
        value={state.passageValue}
        onChange={e => onPassageChange(idx, e.target.value)}
        onKeyDown={e => e.ctrlKey && e.key === 'Enter' && onCheck(idx)}
        disabled={state.checked}
      />

      {/* Reference answer (after check) */}
      {state.checked && !state.skipped && (
        <div className="mt-4 rounded-xl border border-border bg-surface2 px-4 py-3">
          <div className="font-mono text-[10px] tracking-widest uppercase text-text3 mb-2">
            Richtige Passage:
          </div>
          <div className="text-accent text-sm leading-relaxed whitespace-pre-wrap">
            {pc.rawText}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="mt-5 flex items-center gap-3 flex-wrap">
        {!state.checked && !state.skipped && (
          <>
            <button
              onClick={() => onCheck(idx)}
              className="px-5 py-2 rounded-lg bg-blue/80 hover:bg-blue text-white font-semibold text-sm transition-colors duration-150 active:scale-95"
            >
              Überprüfen
            </button>
            <button
              onClick={() => onSkip(idx)}
              className="text-text3 hover:text-text2 text-xs px-3 py-2 transition-colors"
            >
              Überspringen
            </button>
          </>
        )}
        {(state.checked || state.skipped) && (
          <button
            onClick={() => isLast ? onShowDashboard() : onNext(idx)}
            className="px-5 py-2 rounded-lg bg-surface2 border border-border text-text2 hover:text-text hover:border-text3 font-semibold text-sm transition-colors duration-150 active:scale-95"
          >
            {isLast ? '📊 Auswertung' : 'Weiter →'}
          </button>
        )}

        {state.skipped && (
          <span className="ml-auto font-mono text-[11px] text-text3">Übersprungen</span>
        )}
        {state.checked && !state.skipped && score !== undefined && (
          <span className={cn('ml-auto font-mono text-[11px]', scoreColor)}>
            {score}% — {state.correct}/{state.correct + state.wrong} Wörter
          </span>
        )}
      </div>
    </div>
  );
}
