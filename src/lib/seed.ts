import { GameMode, Corpus, PhraseCorpus } from '../types';
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
  if (mode === 'phrase') {
    return `f:${corpusId}:${dateOrCode.trim()}`;
  }
  if (mode === 'survival') {
    return `s:${corpusId}:${dateOrCode.trim()}`;
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

export function selectPhrase(
  seedStr: string,
  corpus: PhraseCorpus
): { phrase: string; index: number } {
  if (!corpus.phrases || corpus.phrases.length === 0) {
    throw new Error('Corpus de frases vacío');
  }
  const numSeed = fnv1a32(seedStr);
  const rng = mulberry32(numSeed);
  const index = Math.floor(rng() * corpus.phrases.length);
  return {
    phrase: corpus.phrases[index],
    index,
  };
}

const ADJECTIVES = ['SOLAR', 'VELOZ', 'BRAVO', 'NOBLE', 'ASTUTO', 'DULCE', 'CLARO', 'MAGNO', 'VIVO', 'SABIO'];
const NOUNS = ['TIGRE', 'VIENTO', 'FUEGO', 'PLAYA', 'BARCO', 'MONTE', 'CIELO', 'TRUENO', 'RANGO', 'HALCON'];

export function generateRandomCode(): string {
  const adj = ADJECTIVES[Math.floor(Math.random() * ADJECTIVES.length)];
  const noun = NOUNS[Math.floor(Math.random() * NOUNS.length)];
  const num = Math.floor(100 + Math.random() * 900);
  return `${adj}-${noun}-${num}`;
}
