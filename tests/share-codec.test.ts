import { describe, it, expect } from 'vitest';
import {
  encodeGrid,
  decodeGrid,
  encodeShareToken,
  decodeShareToken,
  gridToEmoji,
  buildShareText,
} from '../src/lib/share-codec';
import { TileState } from '../src/types';

describe('share-codec', () => {
  const sampleGrid: TileState[][] = [
    ['absent', 'present', 'absent', 'absent', 'absent'],
    ['absent', 'absent', 'correct', 'absent', 'present'],
    ['correct', 'correct', 'correct', 'absent', 'correct'],
    ['correct', 'correct', 'correct', 'correct', 'correct'],
  ];

  it('codifica y decodifica un grid (roundtrip)', () => {
    const encoded = encodeGrid(sampleGrid);
    expect(typeof encoded).toBe('string');
    const decoded = decodeGrid(encoded);
    expect(decoded).toEqual(sampleGrid);
  });

  it('codifica y decodifica un shareToken completo (roundtrip)', () => {
    const token = encodeShareToken('es5', '2026-10-20', 4, sampleGrid);
    expect(token.startsWith('v1-es5-2026-10-20-4')).toBe(true);

    const parsed = decodeShareToken(token);
    expect(parsed).not.toBeNull();
    expect(parsed?.corpusId).toBe('es5');
    expect(parsed?.seed).toBe('2026-10-20');
    expect(parsed?.attempts).toBe(4);

    const gridDecoded = decodeGrid(parsed!.gridB64);
    expect(gridDecoded).toEqual(sampleGrid);
  });

  it('maneja intentos X para derrotas', () => {
    const token = encodeShareToken('es5', 'RETO-JUAN', 'X', sampleGrid);
    const parsed = decodeShareToken(token);
    expect(parsed?.attempts).toBe('X');
    expect(parsed?.seed).toBe('RETO-JUAN');
  });

  it('devuelve null ante tokens corruptos o versiones desconocidas', () => {
    expect(decodeShareToken('invalid-token')).toBeNull();
    expect(decodeShareToken('v2-es5-2026-10-20-4abc')).toBeNull();
  });

  it('genera representación emoji correcta', () => {
    const miniGrid: TileState[][] = [
      ['absent', 'present', 'correct'],
    ];
    // absent: ⬛, present: 🟧, correct: 🟩
    expect(gridToEmoji(miniGrid)).toBe('⬛🟧🟩');
  });

  it('construye el texto completo para portapapeles', () => {
    const miniGrid: TileState[][] = [
      ['correct', 'correct', 'correct', 'correct', 'correct'],
    ];
    const text = buildShareText(1, miniGrid, 'https://test.io/#/c/123');
    expect(text).toContain('Palabra 🟩 1/6');
    expect(text).toContain('🟩🟩🟩🟩🟩');
    expect(text).toContain('🔗 https://test.io/#/c/123');
  });
});
