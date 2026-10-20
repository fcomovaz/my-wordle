import { GameMode, Corpus } from '../types';
import { fnv1a32, mulberry32 } from './prng';

export function normalizeCode(code: string): string {
  return code
    .trim()
    .toUpperCase()
    .replace(/\s+/g, '-');
}

export function buildSeedString(
  mode: GameMode,
  corpusId: string,
  dateOrCode: string
): string {
  if (mode === 'daily') {
    return `d:${corpusId}:${dateOrCode.trim()}`;
  }
  return `c:${corpusId}:${normalizeCode(dateOrCode)}`;
}

export function selectWord(
  seedStr: string,
  corpus: Corpus
): { word: string; index: number } {
  if (!corpus.words || corpus.words.length === 0) {
    throw new Error('Corpus vacío');
  }
  const numSeed = fnv1a32(seedStr);
  const rng = mulberry32(numSeed);
  const index = Math.floor(rng() * corpus.words.length);
  return {
    word: corpus.words[index],
    index,
  };
}
