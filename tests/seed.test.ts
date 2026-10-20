import { describe, it, expect } from 'vitest';
import { buildSeedString, normalizeCode, selectWord } from '../src/lib/seed';
import { Corpus } from '../src/types';

describe('seed', () => {
  const dummyCorpus: Corpus = {
    id: 'es5',
    lang: 'es',
    wordLength: 5,
    version: 1,
    words: ['ÁRBOL', 'PERRO', 'MUNDO', 'SALTO', 'FUEGO', 'PLAYA', 'SILLA'],
    valid: ['ÁRBOL', 'PERRO', 'MUNDO', 'SALTO', 'FUEGO', 'PLAYA', 'SILLA'],
  };

  it('normaliza códigos privados con espacios y minúsculas', () => {
    expect(normalizeCode(' fiesta juan ')).toBe('FIESTA-JUAN');
    expect(normalizeCode('reto  amigo  2026')).toBe('RETO-AMIGO-2026');
  });

  it('construye formato de seeds según modo', () => {
    expect(buildSeedString('daily', 'es5', '2026-10-20')).toBe('d:es5:2026-10-20');
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

  it('arroja error si corpus está vacío', () => {
    const emptyCorpus: Corpus = { ...dummyCorpus, words: [] };
    expect(() => selectWord('d:es5:2026-10-20', emptyCorpus)).toThrow('Corpus vacío');
  });
});
