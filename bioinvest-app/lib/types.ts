import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── localStorage ────────────────────────────────────────────────────────────

const STORAGE_KEY = 'bioinvest-history-v2';

export function loadHistory(): SessionRecord[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export function saveSession(session: SessionRecord): void {
  if (typeof window === 'undefined') return;
  try {
    const history = loadHistory();
    history.unshift(session);
    if (history.length > 50) history.length = 50;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Storage error:', e);
  }
}

export function clearHistory(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(STORAGE_KEY);
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Script {
  id: string;
  name: string;
  desc: string;
  icon: string;
  pills: string[];
  raw: string;
  sections?: string[];
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
  rawText: string;
}

export interface ChunkState {
  inputValues: string[];
  checked: boolean;
  skipped: boolean;
  correct: number;
  wrong: number;
  noGaps: boolean;
  correctness: boolean[];
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
