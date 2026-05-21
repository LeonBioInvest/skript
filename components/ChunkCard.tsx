'use client';

import { useRef, useEffect, useState } from 'react';
import { ProcessedChunk, ChunkState, GapToken } from '@/lib/types';
import { cn } from '@/lib/types';

interface Props {
  idx: number;
  total: number;
  pc: ProcessedChunk;
  state: ChunkState;
  isActive: boolean;
  isLast: boolean;
  onInputChange: (chunkIdx: number, gapIdx: number, value: string) => void;
  onCheck: (chunkIdx: number) => void;
  onSkip: (chunkIdx: number) => void;
  onNext: (chunkIdx: number) => void;
  onShowDashboard: () => void;
}

export default function ChunkCard({
  idx, total, pc, state, isActive, isLast,
  onInputChange, onCheck, onSkip, onNext, onShowDashboard,
}: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [speaking, setSpeaking] = useState(false);
  const [hasTTS, setHasTTS] = useState(false);

  useEffect(() => {
    if (isActive && firstInputRef.current && !state.checked) {
      setTimeout(() => firstInputRef.current?.focus(), 80);
    }
  }, [isActive, state.checked]);

  useEffect(() => {
    setHasTTS(typeof window !== 'undefined' && 'speechSynthesis' in window);
    return () => { window.speechSynthesis?.cancel(); };
  }, []);

  const handleTTS = () => {
    if (!window.speechSynthesis) return;
    if (speaking) {
      window.speechSynthesis.cancel();
      setSpeaking(false);
      return;
    }
    const utter = new SpeechSynthesisUtterance(pc.rawText);
    utter.lang = 'de-DE';
    utter.rate = 0.9;
    utter.onend = () => setSpeaking(false);
    utter.onerror = () => setSpeaking(false);
    window.speechSynthesis.speak(utter);
    setSpeaking(true);
  };

  const cardClass = cn(
    'rounded-2xl border p-7 transition-all duration-300',
    !state.checked && !state.skipped && isActive
      ? 'bg-surface border-accent/50 shadow-[0_0_0_1px_rgba(34,197,94,0.15),0_8px_32px_rgba(34,197,94,0.08)]'
      : !state.checked && !state.skipped
      ? 'bg-surface border-border'
      : state.skipped
      ? 'bg-surface border-border opacity-55'
      : state.wrong === 0
      ? 'bg-surface border-accent/40'
      : 'bg-surface border-err/40',
  );

  let firstGapSeen = false;

  return (
    <div ref={cardRef} id={`chunk-${idx}`} className={cardClass}>
      {/* Chunk number + TTS */}
      <div className="flex items-center justify-between mb-4">
        <div className="font-mono text-[10px] tracking-widest uppercase text-text3">
          Abschnitt {idx + 1} von {total}
        </div>
        {hasTTS && (
          <button
            onClick={handleTTS}
            className={cn(
              'font-mono text-[10px] px-2.5 py-1 rounded-md border transition-all duration-150',
              speaking
                ? 'border-blue/50 text-blue bg-blue/10'
                : 'border-border/60 text-text3 hover:text-text2 hover:border-border',
            )}
          >
            {speaking ? '■ Stop' : '▶ Vorlesen'}
          </button>
        )}
      </div>

      {/* Text content */}
      <div className="text-base leading-[2.2] text-text">
        {pc.lines.map((line, li) => (
          <span key={li}>
            {li > 0 && <br />}
            {line.map((token, ti) => {
              if (token.kind === 'text') {
                if (token.style === 'bold') {
                  return (
                    <span key={ti} className="font-bold text-blue bg-blue/[0.12] px-1.5 py-0.5 rounded-[4px] mx-0.5">
                      {token.value}
                    </span>
                  );
                }
                if (token.style === 'italic') {
                  return (
                    <span key={ti} className="italic text-purple bg-purple/[0.10] px-1.5 py-0.5 rounded-[4px] mx-0.5">
                      {token.value}
                    </span>
                  );
                }
                return <span key={ti}>{token.value}</span>;
              }

              // Gap token
              const gap = token as GapToken;
              const value = state.inputValues[gap.gapIdx] ?? '';
              const isFirstGap = !firstGapSeen;
              if (isFirstGap) firstGapSeen = true;

              if (state.checked) {
                const correctness = state.correctness[gap.gapIdx];
                if (correctness === true) {
                  return (
                    <span
                      key={ti}
                      className="font-mono text-[0.88rem] inline-block bg-accent/10 text-accent px-2 py-0.5 rounded-[4px] mx-0.5 border border-accent/25"
                    >
                      {gap.answer}
                    </span>
                  );
                }
                if (correctness === 'nearly') {
                  return (
                    <span
                      key={ti}
                      className="inline-flex items-baseline gap-1 bg-warn/[0.10] border border-warn/30 rounded-[6px] px-2 py-0.5 font-mono text-[0.85rem] mx-0.5 whitespace-nowrap"
                      title={`Du hast geschrieben: "${value}"`}
                    >
                      <span className="text-warn font-medium">{gap.answer}</span>
                      <span className="text-warn/60 text-[0.7rem]">≈</span>
                    </span>
                  );
                }
                return (
                  <span
                    key={ti}
                    className="inline-flex items-baseline gap-1.5 bg-err/[0.10] border border-err/30 rounded-[6px] px-2 py-0.5 font-mono text-[0.85rem] mx-0.5 whitespace-nowrap"
                  >
                    <span className="text-err line-through opacity-75">
                      {value || '∅'}
                    </span>
                    <span className="text-text3 text-[0.7rem]">→</span>
                    <span className="text-accent font-medium">{gap.answer}</span>
                  </span>
                );
              }

              const inputWidth = Math.max(56, gap.answer.length * 10 + 20);
              return (
                <input
                  key={ti}
                  ref={isFirstGap && isActive ? firstInputRef : undefined}
                  type="text"
                  className="gap-input mx-0.5"
                  style={{ width: inputWidth }}
                  value={value}
                  autoComplete="off"
                  spellCheck={false}
                  onChange={e => onInputChange(idx, gap.gapIdx, e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && onCheck(idx)}
                  disabled={state.checked}
                />
              );
            })}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="mt-6 flex items-center gap-3 flex-wrap">
        {!state.checked && !state.skipped && (
          <>
            {!state.noGaps && (
              <button
                onClick={() => onCheck(idx)}
                className="px-5 py-2 rounded-lg bg-accent-dim hover:bg-accent text-white font-semibold text-sm transition-all duration-150 active:scale-95 shadow-sm shadow-accent/20"
              >
                Überprüfen
              </button>
            )}
            <button
              onClick={() =>
                state.noGaps
                  ? (isLast ? onShowDashboard() : onNext(idx))
                  : onSkip(idx)
              }
              className={cn(
                'px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 active:scale-95 border',
                state.noGaps
                  ? 'bg-surface2 border-border text-text hover:bg-surface3 hover:border-text3/50'
                  : 'border-border/60 text-text3 hover:text-text2 hover:border-border bg-transparent',
              )}
            >
              {state.noGaps
                ? isLast ? 'Auswertung' : 'Weiter →'
                : 'Überspringen'}
            </button>
          </>
        )}

        {(state.checked || state.skipped) && (
          <button
            onClick={() => isLast ? onShowDashboard() : onNext(idx)}
            className="px-5 py-2 rounded-lg bg-surface2 border border-border text-text hover:bg-surface3 hover:border-text3/50 font-semibold text-sm transition-all duration-150 active:scale-95"
          >
            {isLast ? '📊 Auswertung' : 'Weiter →'}
          </button>
        )}

        {/* Feedback */}
        <FeedbackBadge state={state} />
      </div>
    </div>
  );
}

function FeedbackBadge({ state }: { state: ChunkState }) {
  if (state.skipped) {
    return <span className="ml-auto font-mono text-[11px] text-text3">Übersprungen</span>;
  }
  if (state.noGaps && !state.checked) {
    return <span className="ml-auto font-mono text-[11px] text-text3">Kein Lückentext</span>;
  }
  if (!state.checked) return null;

  const total = state.correct + state.wrong;
  const nearlyCount = state.correctness.filter(c => c === 'nearly').length;
  const isPerf = state.wrong === 0 && nearlyCount === 0;

  if (total === 0) return <span className="ml-auto font-mono text-[11px] text-text3">Kein Lückentext</span>;

  return (
    <span className="ml-auto flex items-center gap-1.5 font-mono text-[11px]">
      <span className={isPerf ? 'text-accent' : state.wrong > 0 ? 'text-err' : 'text-warn'}>
        {state.correct} / {total} richtig
      </span>
      {nearlyCount > 0 && (
        <span className="text-warn/70">({nearlyCount} ≈)</span>
      )}
    </span>
  );
}
