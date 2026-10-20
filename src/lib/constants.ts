import { TileState } from '../types';

export const WORD_LENGTH = 5;
export const MAX_ATTEMPTS = 6;

export const TILE_EMOJIS: Record<TileState, string> = {
  absent: '⬛',
  present: '🟧',
  correct: '🟩',
};

export const TILE_VALUES: Record<TileState, number> = {
  absent: 0,
  present: 1,
  correct: 2,
};

export const VALUE_TO_TILE: Record<number, TileState> = {
  0: 'absent',
  1: 'present',
  2: 'correct',
};

export const KEYBOARD_ROWS = [
  ['Q', 'W', 'E', 'R', 'T', 'Y', 'U', 'I', 'O', 'P'],
  ['A', 'S', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'Ñ'],
  ['ENTER', 'Z', 'X', 'C', 'V', 'B', 'N', 'M', 'BACKSPACE'],
];
