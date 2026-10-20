import { describe, it, expect } from 'vitest';
import { validateCorpus } from '../src/lib/validate-corpus';
import { Corpus } from '../src/types';

describe('validate-corpus', () => {
  it('detecta palabras con longitud distinta de 5', () => {
    const invalid: Corpus = {
      id: 'test',
      lang: 'es',
      wordLength: 5,
      version: 1,
      words: ['HOLA'], // 4 letras
      valid: ['HOLA'],
    };
    const res = validateCorpus(invalid);
    expect(res.ok).toBe(false);
    expect(res.errors[0]).toContain('no tiene 5 letras');
  });

  it('detecta si words no está contenido en valid', () => {
    const invalid: Corpus = {
      id: 'test',
      lang: 'es',
      wordLength: 5,
      version: 1,
      words: ['PERRO'],
      valid: ['GATOS'],
    };
    const res = validateCorpus(invalid);
    expect(res.ok).toBe(false);
    expect(res.errors[0]).toContain('no existe en valid');
  });

  it('detecta duplicados en words', () => {
    const invalid: Corpus = {
      id: 'test',
      lang: 'es',
      wordLength: 5,
      version: 1,
      words: ['PERRO', 'PERRO'],
      valid: ['PERRO'],
    };
    const res = validateCorpus(invalid);
    expect(res.ok).toBe(false);
    expect(res.errors[0]).toContain('duplicada');
  });
});
