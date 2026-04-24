'use client';

import { useEffect, useRef, useState } from 'react';
import { ProcessedChunk, ChunkState, GlobalStats, TrainingMode, SessionRecord } from '@/lib/types';
import { loadHistory, clearHistory as clearHistoryStorage } from '@/lib/history';
import { cn } from '@/lib/cn';

interface Props {
  processedChunks: ProcessedChunk[];
  chunkStates: ChunkState[];
  globalStats: GlobalStats;
  scriptName: string;
  scriptId: string;
  activeMode: TrainingMode;
  onRestart: () => void;
  onChangeScript: () => void;
}

export default function Dashboard({
  processedChunks,
  chunkStates,
  globalStats,
  scriptName,
  scriptId,
  activeMode,
  onRestart,
  onChangeScript,
}: Props) {
  const [activeTab, setActiveTab] = useState<'results' | 'history'>('results');
  const [history, setHistory] = useState<SessionRecord[]>([]);
  const ringRef = useRef<SVGCircleElement>(null);

  const { correct, wrong, allErrors } = globalStats;
  const total = correct + wrong;
  const score = total > 0 ? Math.round((correct / total) * 100) : 0;
  const errorRate = total > 0 ? Math.round((wrong / total) * 100) + '%' : '—';
  const checkedChunks = chunkStates.filter(d => d.checked && !d.skipped).length;

  const circumference = 314; // 2π × 50
  const offset = circumference - (score / 100) * circumference;
  const ringColor = score >= 80 ? '#22c55e' : score >= 50 ? '#fbbf24' : '#f87171';

  useEffect(() => {
    setHistory(loadHistory());
    // Trigger ring animation
    if (ringRef.current) {
      setTimeout(() => {
        if (ringRef.current) ringRef.current.style.strokeDashoffset = String(offset);
      }, 60);
    }
  }, [offset]);

  const handleClearHistory = () => {
    if (!confirm('Gesamten Verlauf löschen?')) return;
    clearHistoryStorage();
    setHistory([]);
  };

  return (
    <div className="relative z-10 max-w-4xl mx-auto px-8 py-12 animate-fade-up">
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="font-display text-4xl font-bold text-text mb-2">Auswertung</h1>
        <p className="text-text2 text-sm">
          {scriptName} · Modus {activeMode}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-10 bg-surface border border-border rounded-xl p-1 w-fit">
        {(['results', 'history'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'font-mono text-xs tracking-wider uppercase px-5 py-2 rounded-lg transition-all duration-150',
              activeTab === tab
                ? 'bg-surface2 text-text'
                : 'text-text3 hover:text-text2',
            )}
          >
            {tab === 'results' ? '📊 Diese Session' : '📅 Verlauf'}
          </button>
        ))}
      </div>

      {/* Results tab */}
      {activeTab === 'results' && (
        <div className="space-y-6 animate-fade-in">
          {/* KPI grid */}
          <div className="grid grid-cols-4 gap-4">
            <KpiCard label="Richtig"     value={String(correct)}    accent="accent" />
            <KpiCard label="Falsch"      value={String(wrong)}      accent="err" />
            <KpiCard label="Fehlerquote" value={errorRate}           accent="blue" />
            <KpiCard label="Abschnitte"  value={String(checkedChunks)} accent="warn" />
          </div>

          {/* Score + Errors */}
          <div className="flex gap-4">
            {/* Score ring */}
            <div className="bg-surface border border-border rounded-2xl p-7 flex flex-col items-center justify-center w-52 flex-shrink-0">
              <div className="relative w-28 h-28 mb-4">
                <svg className="-rotate-90 w-28 h-28" viewBox="0 0 120 120">
                  <circle className="fill-none stroke-surface2" cx="60" cy="60" r="50" strokeWidth="10" />
                  <circle
                    ref={ringRef}
                    className="ring-arc"
                    cx="60" cy="60" r="50"
                    stroke={ringColor}
                    strokeDasharray={circumference}
                    strokeDashoffset={circumference}
                    style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.16,1,0.3,1)' }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="font-display text-2xl font-bold" style={{ color: ringColor }}>
                    {score}%
                  </span>
                  <span className="font-mono text-[10px] text-text3 uppercase tracking-wider">Score</span>
                </div>
              </div>
              <span className="font-mono text-[10px] text-text3 uppercase tracking-widest">Gesamtergebnis</span>
            </div>

            {/* Error list */}
            <div className="flex-1 bg-surface border border-border rounded-2xl p-6 overflow-y-auto max-h-72">
              <div className="font-mono text-[10px] tracking-widest uppercase text-text3 mb-4">Fehler-Liste</div>
              {allErrors.length === 0 ? (
                <p className="text-center py-8 text-text3 font-mono text-xs">Keine Fehler — perfekt! 🎉</p>
              ) : (
                <div className="space-y-0">
                  {allErrors.map((e, i) => (
                    <div key={i} className="flex items-center gap-3 py-2 border-b border-border/60 last:border-0 font-mono text-[12px]">
                      <span className="text-text3 w-5 text-right flex-shrink-0">{i + 1}</span>
                      <span className="text-err flex-1">{e.given}</span>
                      <span className="text-text3">→</span>
                      <span className="text-accent flex-1">{e.answer}</span>
                      <span className="text-text3 text-[10px] flex-[2] text-right truncate">{e.context}…</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Chunk breakdown */}
          <div className="bg-surface border border-border rounded-2xl p-6">
            <div className="font-mono text-[10px] tracking-widest uppercase text-text3 mb-5">Abschnitt-Übersicht</div>
            <div className="space-y-2.5">
              {chunkStates.map((data, idx) => {
                const chunkTotal = data.correct + data.wrong;
                const pct = chunkTotal > 0 ? (data.correct / chunkTotal) * 100 : 0;
                let barColor = 'bg-accent';
                let statText = `${data.correct}/${chunkTotal}`;
                if (data.skipped) { barColor = 'bg-text3'; statText = 'skip'; }
                else if (!data.checked) { barColor = 'bg-text3'; statText = '—'; }
                else if (data.wrong > 0) barColor = 'bg-err';

                return (
                  <div key={idx} className="flex items-center gap-3">
                    <span className="font-mono text-[10px] text-text3 w-5 text-right flex-shrink-0">{idx + 1}</span>
                    <div className="flex-1 h-1.5 bg-surface2 rounded-full overflow-hidden">
                      <div
                        className={cn('h-full rounded-full transition-all duration-700', barColor)}
                        style={{
                          width: data.checked && !data.skipped
                            ? `${Math.max(pct, chunkTotal === 0 ? 0 : 4)}%`
                            : data.skipped ? '20%' : '0%',
                        }}
                      />
                    </div>
                    <span className="font-mono text-[11px] text-text2 w-14 text-right flex-shrink-0">{statText}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={onRestart}
              className="px-6 py-2.5 rounded-xl border border-border bg-surface text-text hover:border-accent/40 hover:text-accent font-semibold text-sm transition-all"
            >
              ↺ Neu starten
            </button>
            <button
              onClick={onChangeScript}
              className="px-6 py-2.5 rounded-xl border border-border bg-surface text-text hover:border-border text-sm font-semibold transition-all hover:text-text2"
            >
              ← Skript wechseln
            </button>
          </div>
        </div>
      )}

      {/* History tab */}
      {activeTab === 'history' && (
        <div className="animate-fade-in">
          {history.length > 0 && (
            <HistorySummary history={history} />
          )}
          <div className="flex items-center justify-between mb-4">
            <span className="font-mono text-[10px] tracking-widest uppercase text-text3">
              Alle Sessions
            </span>
            <button
              onClick={handleClearHistory}
              className="font-mono text-[10px] uppercase tracking-wider text-text3 hover:text-err border border-border hover:border-err px-3 py-1.5 rounded-lg transition-all"
            >
              Verlauf löschen
            </button>
          </div>

          {history.length === 0 ? (
            <div className="text-center py-20 text-text3 font-mono text-sm">
              Noch keine gespeicherten Sessions.<br />
              <span className="text-xs mt-1 block opacity-60">Schließe ein Training ab, um deinen Verlauf zu sehen.</span>
            </div>
          ) : (
            <div className="space-y-3">
              {history.map((session, i) => (
                <HistoryEntry key={i} session={session} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function KpiCard({ label, value, accent }: { label: string; value: string; accent: string }) {
  const colors: Record<string, { num: string; top: string }> = {
    accent: { num: 'text-accent', top: 'bg-accent' },
    err:    { num: 'text-err',    top: 'bg-err' },
    blue:   { num: 'text-blue',   top: 'bg-blue' },
    warn:   { num: 'text-warn',   top: 'bg-warn' },
  };
  const c = colors[accent];

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 text-center relative overflow-hidden">
      <div className={cn('absolute top-0 left-0 right-0 h-[2px]', c.top)} />
      <div className={cn('font-display text-4xl font-bold mb-2', c.num)}>{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-text2">{label}</div>
    </div>
  );
}

function HistorySummary({ history }: { history: SessionRecord[] }) {
  const avgScore = Math.round(history.reduce((a, s) => a + s.score, 0) / history.length);
  const bestScore = Math.max(...history.map(s => s.score));
  const totalGaps = history.reduce((a, s) => a + s.correct + s.wrong, 0);

  return (
    <div className="bg-surface border border-border rounded-2xl p-5 mb-5 grid grid-cols-4 gap-4 text-center">
      <SummaryStat value={String(history.length)} label="Sessions" />
      <SummaryStat value={`${avgScore}%`} label="Ø Score" />
      <SummaryStat value={`${bestScore}%`} label="Bester Score" />
      <SummaryStat value={String(totalGaps)} label="Gesamt Lücken" />
    </div>
  );
}

function SummaryStat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="font-display text-2xl font-bold text-accent">{value}</div>
      <div className="font-mono text-[10px] uppercase tracking-widest text-text3 mt-1">{label}</div>
    </div>
  );
}

function HistoryEntry({ session }: { session: SessionRecord }) {
  const score = session.score;
  const color = score >= 80 ? 'text-accent' : score >= 50 ? 'text-warn' : 'text-err';
  const barColor = score >= 80 ? 'bg-accent' : score >= 50 ? 'bg-warn' : 'bg-err';
  const date = new Date(session.timestamp);
  const dateStr = date.toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
  const timeStr = date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="bg-surface border border-border rounded-xl px-5 py-4 flex items-center gap-4 hover:border-accent/20 transition-colors">
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-3 mb-1.5">
          <span className="font-display text-base text-text">{session.scriptName}</span>
          <span className="font-mono text-[10px] text-text3">{dateStr} · {timeStr}</span>
        </div>
        <div className="flex gap-4 font-mono text-[11px] text-text2 mb-2">
          <span>Richtig: <span className="text-accent">{session.correct}</span></span>
          <span>Falsch: <span className="text-err">{session.wrong}</span></span>
          <span>Abschnitte: {session.chunks}</span>
        </div>
        <div className="h-1 bg-surface2 rounded-full overflow-hidden max-w-48">
          <div className={cn('h-full rounded-full', barColor)} style={{ width: `${score}%` }} />
        </div>
      </div>
      <div className={cn('font-display text-2xl font-bold flex-shrink-0', color)}>{score}%</div>
    </div>
  );
}
