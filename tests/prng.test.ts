import { describe, it, expect } from 'vitest';
import { fnv1a32, mulberry32 } from '../src/lib/prng';

describe('prng', () => {
  describe('fnv1a32', () => {
    it('genera hash determinista idéntico para el mismo string', () => {
      const s = 'd:es5:2026-10-20';
      expect(fnv1a32(s)).toBe(fnv1a32(s));
      expect(fnv1a32(s)).toBe(3817479673);
    });

    it('genera hashes distintos para strings diferentes', () => {
      expect(fnv1a32('a')).not.toBe(fnv1a32('b'));
      expect(fnv1a32('d:es5:2026-10-20')).not.toBe(fnv1a32('d:es5:2026-10-21'));
    });

    it('devuelve uint32 sin signo', () => {
      const h = fnv1a32('test-seed-xyz');
      expect(h).toBeGreaterThanOrEqual(0);
      expect(h).toBeLessThanOrEqual(0xffffffff);
    });
  });

  describe('mulberry32', () => {
    it('secuencia determinista con la misma semilla', () => {
      const rng1 = mulberry32(12345);
      const rng2 = mulberry32(12345);
      const seq1 = [rng1(), rng1(), rng1()];
      const seq2 = [rng2(), rng2(), rng2()];
      expect(seq1).toEqual(seq2);
    });

    it('valores siempre en [0, 1)', () => {
      const rng = mulberry32(999);
      for (let i = 0; i < 50; i++) {
        const v = rng();
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThan(1);
      }
    });
  });
});
