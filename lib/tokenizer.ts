import { ProcessedChunk, RenderedToken } from './types';

const GAP_PROB = 0.28;
const PROTECTED_TOKENS = new Set(['->', '😁']);

type RawToken =
  | { type: 'bold' | 'italic'; value: string }
  | { type: 'space' | 'punct' | 'word'; value: string };

function tokenizeLineRaw(line: string): RawToken[] {
  const tokens: RawToken[] = [];
  const re = /\*\*([^*]+)\*\*|\*([^*]+)\*|(\s+)|([^\s]+)/g;
  let m: RegExpExecArray | null;

  while ((m = re.exec(line)) !== null) {
    if (m[1] !== undefined) {
      tokens.push({ type: 'bold', value: m[1] });
    } else if (m[2] !== undefined) {
      tokens.push({ type: 'italic', value: m[2] });
    } else if (m[3] !== undefined) {
      tokens.push({ type: 'space', value: m[3] });
    } else {
      const chunk = m[4];
      const LEAD  = /^([(\[„"'"']+)/;
      const TRAIL = /([.,!?)\]"'"':;\/]+)$/;

      let lead = '', core = chunk, trail = '';
      const lm = LEAD.exec(core);
      if (lm) { lead = lm[1]; core = core.slice(lead.length); }
      const tm = TRAIL.exec(core);
      if (tm) { trail = tm[1]; core = core.slice(0, core.length - trail.length); }

      if (lead) tokens.push({ type: 'punct', value: lead });
      if (core) tokens.push({ type: 'word',  value: core });
      if (trail) tokens.push({ type: 'punct', value: trail });
    }
  }
  return tokens;
}

export function stripMarkdown(text: string): string {
  return text
    .replace(/\*\*([^*]+)\*\*/g, '$1')
    .replace(/\*([^*]+)\*/g, '$1');
}

export function buildChunks(raw: string): string[] {
  return raw.split(/-Umbruch-/i).map(p => p.trim()).filter(p => p.length > 0);
}

export function processChunk(chunkText: string): ProcessedChunk {
  const lines = chunkText.split('\n');
  let gapIdx = 0;
  const processedLines: RenderedToken[][] = [];

  for (const line of lines) {
    const rawTokens = tokenizeLineRaw(line);
    const rendered: RenderedToken[] = [];
    const context = stripMarkdown(line).slice(0, 50);

    for (const tok of rawTokens) {
      if (tok.type === 'bold') {
        rendered.push({ kind: 'text', value: tok.value, style: 'bold' });
      } else if (tok.type === 'italic') {
        rendered.push({ kind: 'text', value: tok.value, style: 'italic' });
      } else if (tok.type === 'space' || tok.type === 'punct') {
        rendered.push({ kind: 'text', value: tok.value, style: 'normal' });
      } else {
        const isProtected = PROTECTED_TOKENS.has(tok.value);
        if (!isProtected && Math.random() < GAP_PROB) {
          rendered.push({ kind: 'gap', answer: tok.value, context, gapIdx: gapIdx++ });
        } else {
          rendered.push({ kind: 'text', value: tok.value, style: 'normal' });
        }
      }
    }
    processedLines.push(rendered);
  }

  return {
    lines: processedLines,
    gapCount: gapIdx,
    rawText: stripMarkdown(chunkText),
  };
}

export type WordDiffOp =
  | { type: 'match';   word: string }
  | { type: 'replace'; given: string; correct: string }
  | { type: 'missing'; correct: string }
  | { type: 'extra';   given: string };

export function alignWords(given: string, answer: string): WordDiffOp[] {
  const norm = (s: string) =>
    s.toLowerCase().replace(/[.,!?;:()\[\]""''„"–—]/g, '').trim();

  const gArr = given.trim().split(/\s+/).filter(Boolean);
  const aArr = answer.replace(/\n/g, ' ').trim().split(/\s+/).filter(Boolean);
  const n = aArr.length, m = gArr.length;

  // Edit-distance DP
  const dp: number[][] = [];
  for (let i = 0; i <= n; i++) {
    dp[i] = new Array(m + 1).fill(0);
    dp[i][0] = i;
  }
  for (let j = 0; j <= m; j++) dp[0][j] = j;

  for (let i = 1; i <= n; i++) {
    for (let j = 1; j <= m; j++) {
      const isMatch = norm(aArr[i - 1]) === norm(gArr[j - 1]);
      dp[i][j] = Math.min(
        dp[i - 1][j - 1] + (isMatch ? 0 : 1),
        dp[i - 1][j] + 1,
        dp[i][j - 1] + 1,
      );
    }
  }

  // Traceback
  const ops: WordDiffOp[] = [];
  let i = n, j = m;
  while (i > 0 || j > 0) {
    if (i > 0 && j > 0) {
      const isMatch = norm(aArr[i - 1]) === norm(gArr[j - 1]);
      if (dp[i][j] === dp[i - 1][j - 1] + (isMatch ? 0 : 1)) {
        ops.unshift(
          isMatch
            ? { type: 'match', word: aArr[i - 1] }
            : { type: 'replace', given: gArr[j - 1], correct: aArr[i - 1] },
        );
        i--; j--;
        continue;
      }
    }
    if (i > 0 && (j === 0 || dp[i][j] === dp[i - 1][j] + 1)) {
      ops.unshift({ type: 'missing', correct: aArr[i - 1] });
      i--;
    } else {
      ops.unshift({ type: 'extra', given: gArr[j - 1] });
      j--;
    }
  }

  return ops;
}

export function scorePassage(given: string, answer: string) {
  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
  const givenWords  = normalize(given).split(' ').filter(Boolean);
  const answerWords = normalize(answer).split(' ').filter(Boolean);

  let correctWords = 0;
  const usedIdx = new Set<number>();
  givenWords.forEach(w => {
    const found = answerWords.findIndex((a, i) => !usedIdx.has(i) && a === w);
    if (found !== -1) { correctWords++; usedIdx.add(found); }
  });

  const total = answerWords.length;
  const score = total > 0 ? Math.round((correctWords / total) * 100) : 0;
  return { correct: correctWords, wrong: total - correctWords, score, total };
}
