import { SessionRecord } from './types';

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
