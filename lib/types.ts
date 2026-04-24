export interface Script {
  id: string;
  name: string;
  desc: string;
  icon: string;
  pills: string[];
  raw: string;
  sections?: string[]; // ordered section labels for Mode 3 drag-and-drop
}

export type TrainingMode = 1 | 2 | 3;
export type AppView = 'picker' | 'training' | 'dashboard';

export interface TextToken {
  kind: 'text';
  value: string;
  style: 'normal' | 'bold' | 'italic';
}

export interface GapToken {
  kind: 'gap';
  answer: string;
  context: string;
  gapIdx: number;
}

export type RenderedToken = TextToken | GapToken;

export interface ProcessedChunk {
  lines: RenderedToken[][];
  gapCount: number;
  rawText: string; // plain text (markdown stripped) for passage mode
}

export interface ChunkState {
  inputValues: string[];
  checked: boolean;
  skipped: boolean;
  correct: number;
  wrong: number;
  noGaps: boolean;
  correctness: boolean[]; // filled after checking
  passageValue: string;
  passageScore?: number;
}

export interface ErrorEntry {
  given: string;
  answer: string;
  context: string;
}

export interface GlobalStats {
  correct: number;
  wrong: number;
  allErrors: ErrorEntry[];
}

export interface SessionRecord {
  scriptName: string;
  scriptId: string;
  timestamp: number;
  score: number;
  correct: number;
  wrong: number;
  chunks: number;
  mode: TrainingMode;
}
