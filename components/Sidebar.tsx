'use client';

import { ChunkState, GlobalStats } from '@/lib/types';
import { cn } from '@/lib/cn';

interface Props {
  chunkStates: ChunkState[];
  globalStats: GlobalStats;
  currentChunkIdx: number;
  onScrollToChunk: (idx: number) => void;
  onShowDashboard: () => void;
}

export default function Sidebar({
  chunkStates,
  globalStats,
  currentChunkIdx,
  onScrollToChunk,
  onShowDashboard,
}: Props) {
  const { correct, wrong, allErrors } = globalStats;
  const total = correct + wrong;
  const errorRate = total > 0 ? Math.round((wrong / total) * 100) + '%' : '—';
  const recent = allErrors.slice(-5).reverse();

  return (
    <aside className="border-l border-border px-5 py-6 sticky top-14 h-[calc(100vh-56px)] overflow-y-auto flex flex-col gap-0">
      {/* Chunk map */}
      <div className="mb-5">
        <div className="font-mono text-[10px] tracking-widest uppercase text-text3 mb-3">
          Abschnitte
        </div>
        <div className="flex flex-wrap gap-1.5">
          {chunkStates.map((s, i) => {
            const isDone = s.checked && !s.skipped;
            const isWrong = isDone && s.wrong > 0;
            const isCorrect = isDone && s.wrong === 0;
            const isSkipped = s.skipped;
            const isCurrent = !s.checked && i === currentChunkIdx;

            return (
              <button
                key={i}
                onClick={() => onScrollToChunk(i)}
                title={`Abschnitt ${i + 1}`}
                className={cn(
                  'w-7 h-7 rounded-md font-mono text-[10px] border flex items-center justify-center transition-all duration-150',
                  isCurrent
                    ? 'border-accent text-accent bg-accent/10'
                    : isCorrect
                    ? 'border-accent/40 text-accent bg-accent/[0.08]'
                    : isWrong
                    ? 'border-err/40 text-err bg-err/[0.08]'
                    : isSkipped
                    ? 'border-border text-text3 opacity-40'
                    : 'border-border text-text3 bg-surface2',
                )}
              >
                {i + 1}
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-px bg-border mb-5" />

      {/* Live stats */}
      <div className="mb-5">
        <div className="font-mono text-[10px] tracking-widest uppercase text-text3 mb-3">
          Live-Statistik
        </div>
        <div className="space-y-0">
          <StatRow label="Richtig" value={String(correct)} color="text-accent" />
          <StatRow label="Falsch"  value={String(wrong)} color="text-err" />
          <StatRow label="Fehlerquote" value={errorRate} color="text-warn" />
          <StatRow label="Lücken gesamt" value={String(total)} />
        </div>
      </div>

      <div className="h-px bg-border mb-5" />

      {/* Live errors */}
      <div className="mb-5 flex-1 overflow-hidden">
        <div className="font-mono text-[10px] tracking-widest uppercase text-text3 mb-3">
          Letzte Fehler
        </div>
        {recent.length === 0 ? (
          <p className="font-mono text-[11px] text-text3 italic">Noch keine Fehler.</p>
        ) : (
          <div className="space-y-1.5">
            {recent.map((e, i) => (
              <div
                key={i}
                className="border-l-2 border-err/50 pl-3 py-1 bg-err/[0.05] rounded-r-lg"
              >
                <span className="font-mono text-[11px] text-err">{e.given}</span>
                <span className="font-mono text-[11px] text-text3 mx-1">→</span>
                <span className="font-mono text-[11px] text-accent">{e.answer}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Dashboard button */}
      <button
        onClick={onShowDashboard}
        className="w-full mt-auto py-2.5 rounded-xl bg-gradient-to-r from-accent-dim to-accent text-white font-semibold text-sm hover:opacity-90 transition-opacity"
      >
        📊 Gesamtauswertung
      </button>
    </aside>
  );
}

function StatRow({
  label,
  value,
  color = 'text-text',
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <div className="flex justify-between items-center py-2 border-b border-border/60 last:border-0">
      <span className="text-text2 text-xs">{label}</span>
      <span className={cn('font-mono text-sm font-medium', color)}>{value}</span>
    </div>
  );
}
