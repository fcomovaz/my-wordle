import { TileState } from '../types';
import { normalize } from './normalize';

export function evaluate(guess: string, answer: string): TileState[] {
  const g = normalize(guess).split('');
  const a = normalize(answer).split('');
  const len = g.length;
  const result: TileState[] = new Array(len).fill('absent');

  // Conteo de frecuencias en answer
  const counts: Record<string, number> = {};
  for (const ch of a) {
    counts[ch] = (counts[ch] || 0) + 1;
  }

  // Pasada 1: correct (verde)
  for (let i = 0; i < len; i++) {
    if (g[i] === a[i]) {
      result[i] = 'correct';
      counts[g[i]]--;
    }
  }

  // Pasada 2: present (naranja)
  for (let i = 0; i < len; i++) {
    if (result[i] === 'absent' && counts[g[i]] && counts[g[i]] > 0) {
      result[i] = 'present';
      counts[g[i]]--;
    }
  }

  return result;
}
