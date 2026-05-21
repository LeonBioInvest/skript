'use client';

import { useState, useCallback, useRef } from 'react';

function levenshtein(a: string, b: string): number {
  const m = a.length, n = b.length;
  const dp = Array.from({ length: m + 1 }, (_, i) => i);
  for (let j = 1; j <= n; j++) {
    let prev = dp[0];
    dp[0] = j;
    for (let i = 1; i <= m; i++) {
      const tmp = dp[i];
      dp[i] = a[i - 1] === b[j - 1] ? prev : 1 + Math.min(prev, dp[i], dp[i - 1]);
      prev = tmp;
    }
  }
  return dp[m];
}
import {
  Script, TrainingMode, AppView,
  ProcessedChunk, ChunkState, GlobalStats, ErrorEntry,
} from '@/lib/types';
import { buildChunks, processChunk } from '@/lib/tokenizer';

import { saveSession } from '@/lib/types';

import { SCRIPTS } from '@/lib/scripts';
import ScriptPicker from '@/components/ScriptPicker';
import ModeOverlay from '@/components/ModeOverlay';
import Header from '@/components/Header';
import TrainingView from '@/components/TrainingView';
import Dashboard from '@/components/Dashboard';
import OrderingMode from '@/components/OrderingMode';

function makeEmptyChunkState(pc: ProcessedChunk): ChunkState {
  return {
    inputValues: new Array(pc.gapCount).fill(''),
    checked: false,
    skipped: false,
    correct: 0,
    wrong: 0,
    noGaps: pc.gapCount === 0,
    correctness: [],
    passageValue: '',
  };
}

export default function Home() {
  const [view, setView]               = useState<AppView>('picker');
  const [activeScript, setActiveScript] = useState<Script | null>(null);
  const [activeMode, setActiveMode]   = useState<TrainingMode>(1);
  const [showModeOverlay, setShowModeOverlay] = useState(false);

  const [processedChunks, setProcessedChunks] = useState<ProcessedChunk[]>([]);
  const [chunkStates, setChunkStates] = useState<ChunkState[]>([]);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({ correct: 0, wrong: 0, allErrors: [] });
  const [currentChunkIdx, setCurrentChunkIdx] = useState(0);

  // Keep latest copies for use inside callbacks without stale closure issues
  const chunksRef     = useRef(processedChunks);
  const statesRef     = useRef(chunkStates);
  const statsRef      = useRef(globalStats);
  const scriptRef     = useRef(activeScript);
  const modeRef       = useRef(activeMode);

  // ── Init ──────────────────────────────────────

  const initTraining = useCallback((script: Script, mode: TrainingMode, overrideRaw?: string) => {
    const rawChunks = buildChunks(overrideRaw ?? script.raw);
    // Mode 2: all normal words are gaps (only bold/italic/punct shown)
    const gapProb = mode === 2 ? 1.0 : undefined;
    const processed = rawChunks.map(c => processChunk(c, gapProb));
    const states    = processed.map(makeEmptyChunkState);
    const stats     = { correct: 0, wrong: 0, allErrors: [] as ErrorEntry[] };

    chunksRef.current  = processed;
    statesRef.current  = states;
    statsRef.current   = stats;
    scriptRef.current  = script;
    modeRef.current    = mode;

    setProcessedChunks(processed);
    setChunkStates(states);
    setGlobalStats(stats);
    setCurrentChunkIdx(0);
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // ── Script / mode selection ───────────────────

  const handleSelectScript = useCallback((script: Script) => {
    setActiveScript(script);
    scriptRef.current = script;
    setShowModeOverlay(true);
  }, []);

  const handleSelectMode = useCallback((mode: TrainingMode) => {
    setActiveMode(mode);
    modeRef.current = mode;
    setShowModeOverlay(false);
    setView('training');
    const script = scriptRef.current!;
    let overrideRaw: string | undefined;
    if (mode === 2 && script.mode2ScriptId) {
      const alt = SCRIPTS.find(s => s.id === script.mode2ScriptId);
      if (alt) overrideRaw = alt.raw;
    }
    initTraining(script, mode, overrideRaw);
  }, [initTraining]);

  const handleBackToPicker = useCallback(() => {
    setShowModeOverlay(false);
    setView('picker');
  }, []);

  // ── Gap input ─────────────────────────────────

  const handleInputChange = useCallback((chunkIdx: number, gapIdx: number, value: string) => {
    setChunkStates(prev => {
      const next = [...prev];
      const vals = [...next[chunkIdx].inputValues];
      vals[gapIdx] = value;
      next[chunkIdx] = { ...next[chunkIdx], inputValues: vals };
      statesRef.current = next;
      return next;
    });
  }, []);

  const handlePassageChange = useCallback((chunkIdx: number, value: string) => {
    setChunkStates(prev => {
      const next = [...prev];
      next[chunkIdx] = { ...next[chunkIdx], passageValue: value };
      statesRef.current = next;
      return next;
    });
  }, []);

  // ── Check ─────────────────────────────────────

  const handleCheck = useCallback((idx: number) => {
    const state = statesRef.current[idx];
    if (state.checked) return;

    const pc = chunksRef.current[idx];

    // Gap mode — compute outside setter
    let correct = 0;
    let wrong = 0;
    const errors: ErrorEntry[] = [];
    const correctness: (boolean | 'nearly')[] = [];

    for (const line of pc.lines) {
      for (const token of line) {
        if (token.kind !== 'gap') continue;
        const given = (state.inputValues[token.gapIdx] ?? '').trim();
        const givenLC = given.toLowerCase();
        const answerLC = token.answer.toLowerCase();
        const isExact = givenLC === answerLC;
        const isNearly = !isExact && given.length > 0 && levenshtein(givenLC, answerLC) <= 1;
        correctness[token.gapIdx] = isExact ? true : isNearly ? 'nearly' : false;
        if (isExact || isNearly) {
          correct++;
        } else {
          wrong++;
          errors.push({ given: given || '(leer)', answer: token.answer, context: token.context });
        }
      }
    }

    const newState: ChunkState = { ...state, checked: true, correct, wrong, correctness };
    setChunkStates(prev => {
      const next = [...prev];
      next[idx] = newState;
      statesRef.current = next;
      return next;
    });
    setGlobalStats(prev => {
      const next = {
        correct: prev.correct + correct,
        wrong: prev.wrong + wrong,
        allErrors: [...prev.allErrors, ...errors],
      };
      statsRef.current = next;
      return next;
    });
  }, []);

  // ── Skip ──────────────────────────────────────

  const handleSkip = useCallback((idx: number) => {
    setChunkStates(prev => {
      if (prev[idx].checked) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], checked: true, skipped: true };
      statesRef.current = next;
      return next;
    });
  }, []);

  // ── Dashboard ─────────────────────────────────

  const handleShowDashboard = useCallback(() => {
    const stats  = statsRef.current;
    const states = statesRef.current;
    const script = scriptRef.current!;
    const mode   = modeRef.current;

    const total = stats.correct + stats.wrong;
    const score = total > 0 ? Math.round((stats.correct / total) * 100) : 0;
    const checkedChunks = states.filter(d => d.checked && !d.skipped).length;

    saveSession({
      scriptName: script.name,
      scriptId: script.id,
      timestamp: Date.now(),
      score,
      correct: stats.correct,
      wrong: stats.wrong,
      chunks: checkedChunks,
      mode,
    });

    setView('dashboard');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // ── Next ──────────────────────────────────────

  const handleNext = useCallback((idx: number) => {
    // Auto-complete no-gap chunks
    if (statesRef.current[idx]?.noGaps && !statesRef.current[idx].checked) {
      setChunkStates(prev => {
        const next = [...prev];
        next[idx] = { ...next[idx], checked: true };
        statesRef.current = next;
        return next;
      });
    }

    const nextIdx = idx + 1;
    if (nextIdx >= chunksRef.current.length) {
      handleShowDashboard();
      return;
    }
    setCurrentChunkIdx(nextIdx);
    requestAnimationFrame(() => {
      document.getElementById(`chunk-${nextIdx}`)?.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    });
  }, [handleShowDashboard]);

  const handleScrollToChunk = useCallback((idx: number) => {
    document.getElementById(`chunk-${idx}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, []);

  // ── Restart ───────────────────────────────────

  const handleRestart = useCallback(() => {
    const script = scriptRef.current!;
    const mode = modeRef.current;
    let overrideRaw: string | undefined;
    if (mode === 2 && script.mode2ScriptId) {
      const alt = SCRIPTS.find(s => s.id === script.mode2ScriptId);
      if (alt) overrideRaw = alt.raw;
    }
    initTraining(script, mode, overrideRaw);
    setView('training');
  }, [initTraining]);

  // ── Restart errors only ───────────────────────────

  const handleRestartErrors = useCallback(() => {
    const errorChunks = chunksRef.current
      .map((pc, i) => ({ pc, state: statesRef.current[i] }))
      .filter(({ state }) => state.wrong > 0)
      .map(({ pc }) => processChunk(pc.rawChunk, 1.0));

    if (errorChunks.length === 0) return;

    const states = errorChunks.map(makeEmptyChunkState);
    const stats  = { correct: 0, wrong: 0, allErrors: [] as ErrorEntry[] };

    chunksRef.current  = errorChunks;
    statesRef.current  = states;
    statsRef.current   = stats;

    setProcessedChunks(errorChunks);
    setChunkStates(states);
    setGlobalStats(stats);
    setCurrentChunkIdx(0);
    setView('training');
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  // ── Render ────────────────────────────────────

  const doneCount = chunkStates.filter(c => c.checked).length;

  return (
    <>
      {view === 'picker' && (
        <>
          <ScriptPicker onSelect={handleSelectScript} />
          {showModeOverlay && activeScript && (
            <ModeOverlay
              script={activeScript}
              onSelect={handleSelectMode}
              onClose={() => setShowModeOverlay(false)}
            />
          )}
        </>
      )}

      {view === 'training' && activeMode === 3 && activeScript && (
        <OrderingMode script={activeScript} onBack={handleBackToPicker} />
      )}

      {view === 'training' && activeMode !== 3 && activeScript && (
        <>
          <Header
            scriptName={activeScript.name}
            done={doneCount}
            total={processedChunks.length}
            onBack={handleBackToPicker}
          />
          <TrainingView
            processedChunks={processedChunks}
            chunkStates={chunkStates}
            globalStats={globalStats}
            currentChunkIdx={currentChunkIdx}
            activeMode={activeMode}
            onInputChange={handleInputChange}
            onPassageChange={handlePassageChange}
            onCheck={handleCheck}
            onSkip={handleSkip}
            onNext={handleNext}
            onScrollToChunk={handleScrollToChunk}
            onShowDashboard={handleShowDashboard}
          />
        </>
      )}

      {view === 'dashboard' && activeScript && (
        <>
          <Header
            scriptName={activeScript.name}
            done={doneCount}
            total={processedChunks.length}
            onBack={handleBackToPicker}
          />
          <Dashboard
            processedChunks={processedChunks}
            chunkStates={chunkStates}
            globalStats={globalStats}
            scriptName={activeScript.name}
            scriptId={activeScript.id}
            activeMode={activeMode}
            onRestart={handleRestart}
            onRestartErrors={handleRestartErrors}
            onChangeScript={handleBackToPicker}
          />
        </>
      )}
    </>
  );
}
