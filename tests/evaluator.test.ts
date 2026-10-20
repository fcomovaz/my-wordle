import { describe, it, expect } from 'vitest';
import { evaluate } from '../src/lib/evaluator';

describe('evaluator', () => {
  it('PERRO vs CARRO -> absent, absent, correct, correct, correct', () => {
    expect(evaluate('PERRO', 'CARRO')).toEqual([
      'absent',
      'absent',
      'correct',
      'correct',
      'correct',
    ]);
  });

  it('LETAL vs TALAR -> present, absent, present, present, correct', () => {
    // TALAR -> A:2, L:1, R:1, T:1
    // LETAL:
    // Pasada 1: L!=T, E!=A, T!=L, A!=A(correct, A:1), L!=R
    // Pasada 2:
    // L(0): present (L:0)
    // E(1): absent
    // T(2): present (T:0)
    // A(3): correct (en pasada 1)
    // L(4): absent (L ya agotada)
    // Nota de SPEC §6.2: LETAL vs TALAR -> L en pos 4 es R!=L, pero L en pos 0 es present.
    // L: pos 0 present, pos 4 absent porque solo hay 1 L en TALAR.
    const res = evaluate('LETAL', 'TALAR');
    expect(res).toEqual(['present', 'absent', 'present', 'correct', 'absent']);
  });

  it('ARANA vs DRAMA -> absent, correct, correct, absent, correct', () => {
    // DRAMA -> A en pos 2 y 4 (ambas correctas)
    // ARANA:
    // A(0): absent (ambas A de DRAMA se consumen en pasada 1 por pos 2 y 4)
    // R(1): correct
    // A(2): correct
    // N(3): absent
    // A(4): correct
    expect(evaluate('ARANA', 'DRAMA')).toEqual([
      'absent',
      'correct',
      'correct',
      'absent',
      'correct',
    ]);
  });

  it('MAMMA vs AMIGA -> present, absent, present, absent, correct', () => {
    // AMIGA -> A: pos 0, 4 (2). M: pos 1 (1). I: pos 2. G: pos 3.
    // MAMMA:
    // Pasada 1: A(4) === A(4) -> correct (A restante: 1)
    // Pasada 2:
    // M(0): present (M restante: 0)
    // A(1): present (A restante: 0)
    // M(2): absent (M agotada)
    // M(3): absent (M agotada)
    // A(4): correct
    expect(evaluate('MAMMA', 'AMIGA')).toEqual([
      'present',
      'present',
      'absent',
      'absent',
      'correct',
    ]);
  });

  it('SISAS vs SALSA -> correct, absent, absent, absent, correct', () => {
    // SALSA -> S en 0, 3; A en 1, 4; L en 2
    // SISAS:
    // Pasada 1:
    // S(0) === S(0) -> correct (S restante: 1)
    // S(4) != A(4)
    // Pasada 2:
    // I(1): absent
    // S(2): present (S restante: 0)
    // A(3): present (A restante: 1)
    // S(4): absent (S agotada)
    expect(evaluate('SISAS', 'SALSA')).toEqual([
      'correct',
      'absent',
      'present',
      'present',
      'absent',
    ]);
  });

  it('normaliza tildes de forma transparente', () => {
    expect(evaluate('ARBOL', 'ÁRBOL')).toEqual([
      'correct',
      'correct',
      'correct',
      'correct',
      'correct',
    ]);
  });
});
