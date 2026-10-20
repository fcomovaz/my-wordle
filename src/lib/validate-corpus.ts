import type { Corpus } from '../types';
import { normalize } from './normalize';

export function validateCorpus(corpus: Corpus): { ok: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!corpus.id || typeof corpus.id !== 'string') {
    errors.push('Falta id válido');
  }
  if (corpus.wordLength !== 5) {
    errors.push(`wordLength debe ser 5, recibido: ${corpus.wordLength}`);
  }
  if (!Array.isArray(corpus.words) || corpus.words.length === 0) {
    errors.push('Array words debe ser no vacío');
  }
  if (!Array.isArray(corpus.valid) || corpus.valid.length === 0) {
    errors.push('Array valid debe ser no vacío');
  }

  const wordSet = new Set<string>();
  for (let i = 0; i < corpus.words.length; i++) {
    const w = corpus.words[i];
    const n = normalize(w);
    if (n.length !== corpus.wordLength) {
      errors.push(`Palabra words[${i}] "${w}" no tiene ${corpus.wordLength} letras`);
    }
    if (wordSet.has(w)) {
      errors.push(`Palabra duplicada en words: "${w}"`);
    }
    wordSet.add(w);
  }

  const validSet = new Set<string>();
  for (let i = 0; i < corpus.valid.length; i++) {
    const v = corpus.valid[i];
    const n = normalize(v);
    if (n.length !== corpus.wordLength) {
      errors.push(`Palabra valid[${i}] "${v}" no tiene ${corpus.wordLength} letras`);
    }
    validSet.add(normalize(v));
  }

  // valid ⊇ words (normalizados)
  for (const w of corpus.words) {
    if (!validSet.has(normalize(w))) {
      errors.push(`Palabra de words "${w}" no existe en valid`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
  };
}
