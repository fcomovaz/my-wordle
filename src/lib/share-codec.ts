import { TileState, ShareToken } from '../types';
import { TILE_VALUES, VALUE_TO_TILE, TILE_EMOJIS } from './constants';

export function encodeGrid(grid: TileState[][]): string {
  const bytes: number[] = [];
  for (const row of grid) {
    let byte = 0;
    for (let i = 0; i < 5; i++) {
      const val = TILE_VALUES[row[i] || 'absent'];
      byte += val * Math.pow(3, 4 - i);
    }
    bytes.push(byte);
  }

  // Base64url sin padding
  const binary = String.fromCharCode(...bytes);
  const b64 = btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
  return b64;
}

export function decodeGrid(b64: string): TileState[][] {
  try {
    let base64 = b64.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    const binary = atob(base64);
    const grid: TileState[][] = [];

    for (let b = 0; b < binary.length; b++) {
      let v = binary.charCodeAt(b);
      const row: TileState[] = new Array(5).fill('absent');
      for (let i = 4; i >= 0; i--) {
        row[i] = VALUE_TO_TILE[v % 3] || 'absent';
        v = Math.floor(v / 3);
      }
      grid.push(row);
    }
    return grid;
  } catch (e) {
    console.error('Error al decodificar grid:', e);
    return [];
  }
}

export function encodeShareToken(
  corpusId: string,
  seed: string,
  attempts: number | 'X',
  grid: TileState[][]
): string {
  const gridB64 = encodeGrid(grid);
  return `v1-${corpusId}-${seed}-${attempts}${gridB64}`;
}

export function decodeShareToken(token: string): ShareToken | null {
  try {
    const match = token.match(/^v1-([a-zA-Z0-9]+)-(.+)-([1-6X])([A-Za-z0-9_-]+)$/);
    if (!match) return null;

    const [, corpusId, seed, attemptsStr, gridB64] = match;
    const attempts = attemptsStr === 'X' ? 'X' : parseInt(attemptsStr, 10);

    return {
      version: 'v1',
      corpusId,
      seed,
      attempts,
      gridB64,
    };
  } catch {
    return null;
  }
}

export function gridToEmoji(grid: TileState[][]): string {
  return grid.map((row) => row.map((tile) => TILE_EMOJIS[tile]).join('')).join('\n');
}

export function buildShareText(
  attempts: number | 'X',
  grid: TileState[][],
  url: string
): string {
  const emojiGrid = gridToEmoji(grid);
  const score = attempts === 'X' ? 'X/6' : `${attempts}/6`;
  return `Palabra 🟩 ${score}\n\n${emojiGrid}\n\n🔗 ${url}`;
}
