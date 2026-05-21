'use client';

import { ProcessedChunk, ChunkState, GlobalStats, TrainingMode } from '@/lib/types';
import ChunkCard from './ChunkCard';
import Sidebar from './Sidebar';

interface Props {
  processedChunks: ProcessedChunk[];
  chunkStates: ChunkState[];
  globalStats: GlobalStats;
  currentChunkIdx: number;
  activeMode: TrainingMode;
  onInputChange: (chunkIdx: number, gapIdx: number, value: string) => void;
  onPassageChange: (chunkIdx: number, value: string) => void;
  onCheck: (chunkIdx: number) => void;
  onSkip: (chunkIdx: number) => void;
  onNext: (chunkIdx: number) => void;
  onScrollToChunk: (idx: number) => void;
  onShowDashboard: () => void;
}

export default function TrainingView({
  processedChunks,
  chunkStates,
  globalStats,
  currentChunkIdx,
  onInputChange,
  onCheck,
  onSkip,
  onNext,
  onScrollToChunk,
  onShowDashboard,
}: Props) {
  return (
    <div className="grid grid-cols-[1fr_280px] min-h-[calc(100vh-56px)]">
      {/* Main content */}
      <main className="px-8 py-8 pb-24 space-y-5">
        {processedChunks.map((pc, idx) => (
          <ChunkCard
            key={idx}
            idx={idx}
            total={processedChunks.length}
            pc={pc}
            state={chunkStates[idx]}
            isActive={idx === currentChunkIdx}
            isLast={idx === processedChunks.length - 1}
            onInputChange={onInputChange}
            onCheck={onCheck}
            onSkip={onSkip}
            onNext={onNext}
            onShowDashboard={onShowDashboard}
          />
        ))}
      </main>

      {/* Sidebar */}
      <Sidebar
        chunkStates={chunkStates}
        globalStats={globalStats}
        currentChunkIdx={currentChunkIdx}
        onScrollToChunk={onScrollToChunk}
        onShowDashboard={onShowDashboard}
      />
    </div>
  );
}
