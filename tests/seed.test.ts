import { describe, it, expect } from 'vitest';
import {
  buildSeedString,
  normalizeCode,
  selectWord,
  selectPhrase,
  generateRandomCode,
} from '../src/lib/seed';
import { Corpus, PhraseCorpus } from '../src/types';

describe('seed & modes', () => {
  const dummyCorpus: Corpus = {
    id: 'es5',
    lang: 'es',
    wordLength: 5,
    version: 1,
    words: ['ARBOL', 'PERRO', 'MUNDO', 'SALTO', 'FUEGO', 'PLAYA', 'SILLA'],
    valid: ['ARBOL', 'PERRO', 'MUNDO', 'SALTO', 'FUEGO', 'PLAYA', 'SILLA'],
  };

  const dummyPhrases: PhraseCorpus = {
    id: 'es-frases',
    lang: 'es',
    version: 1,
    phrases: ['EL TIEMPO ES ORO', 'MAS VALE TARDE QUE NUNCA'],
  };

  it('normaliza códigos privados con espacios y minúsculas', () => {
    expect(normalizeCode(' fiesta juan ')).toBe('FIESTA-JUAN');
    expect(normalizeCode('reto  amigo  2026')).toBe('RETO-AMIGO-2026');
  });

  it('construye formato de seeds según modo', () => {
    expect(buildSeedString('daily', 'es5', '2026-10-20')).toBe('d:es5:2026-10-20');
    expect(buildSeedString('phrase', 'es-frases', '2026-10-20')).toBe('f:es-frases:2026-10-20');
    expect(buildSeedString('survival', 'es5', 'lvl-1')).toBe('s:es5:lvl-1');
    expect(buildSeedString('code', 'es5', 'amigo reto')).toBe('c:es5:AMIGO-RETO');
  });

  it('selecciona palabras de forma determinista para la misma semilla', () => {
    const seed = 'd:es5:2026-10-20';
    const sel1 = selectWord(seed, dummyCorpus);
    const sel2 = selectWord(seed, dummyCorpus);
    expect(sel1).toEqual(sel2);
    expect(sel1.index).toBeGreaterThanOrEqual(0);
    expect(sel1.index).toBeLessThan(dummyCorpus.words.length);
  });

  it('selecciona frases de forma determinista para la misma semilla', () => {
    const seed = 'f:es-frases:2026-10-20';
    const p1 = selectPhrase(seed, dummyPhrases);
    const p2 = selectPhrase(seed, dummyPhrases);
    expect(p1).toEqual(p2);
  });

  it('genera códigos aleatorios legibles con formato ADJ-SUST-NUM', () => {
    const code = generateRandomCode();
    expect(code).toMatch(/^[A-Z]+-[A-Z]+-\d{3}$/);
  });
});
