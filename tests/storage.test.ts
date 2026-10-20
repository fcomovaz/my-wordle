import { describe, it, expect, beforeEach } from 'vitest';
import {
  saveGame,
  loadGame,
  clearGame,
  saveStats,
  loadStats,
  getInitialStats,
  saveTheme,
  loadTheme,
} from '../src/lib/storage';
import { SavedGame, Stats } from '../src/types';

// Mock localStorage para node environment
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: (key: string) => store[key] || null,
  setItem: (key: string, val: string) => {
    store[key] = val;
  },
  removeItem: (key: string) => {
    delete store[key];
  },
  clear: () => {
    for (const k in store) delete store[k];
  },
};
Object.defineProperty(globalThis, 'localStorage', {
  value: mockLocalStorage,
  writable: true,
});

describe('storage & resilience', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('guarda y carga partida correctamente', () => {
    const game: SavedGame = {
      version: 1,
      corpusId: 'es5',
      seed: 'd:es5:2026-10-20',
      answer: 'PERRO',
      guesses: ['GATOS', 'CARRO'],
      status: 'playing',
    };

    saveGame(game);
    const loaded = loadGame('es5', 'd:es5:2026-10-20');
    expect(loaded).toEqual(game);
  });

  it('ignora datos corruptos de partida y retorna null', () => {
    localStorage.setItem('palabra:game:v1:es5:corrupt', '{bad json');
    expect(loadGame('es5', 'corrupt')).toBeNull();

    localStorage.setItem(
      'palabra:game:v1:es5:version-invalida',
      JSON.stringify({ version: 99, guesses: [] })
    );
    expect(loadGame('es5', 'version-invalida')).toBeNull();
  });

  it('limpia partida guardada', () => {
    const game: SavedGame = {
      version: 1,
      corpusId: 'es5',
      seed: 'test-seed',
      answer: 'ÁRBOL',
      guesses: [],
      status: 'idle',
    };
    saveGame(game);
    clearGame('es5', 'test-seed');
    expect(loadGame('es5', 'test-seed')).toBeNull();
  });

  it('guarda y carga estadísticas tolerando datos faltantes', () => {
    const stats: Stats = {
      played: 5,
      wins: 4,
      currentStreak: 2,
      maxStreak: 3,
      distribution: { 1: 0, 2: 1, 3: 2, 4: 1, 5: 0, 6: 0 },
    };
    saveStats('es5', stats);
    expect(loadStats('es5')).toEqual(stats);

    // Datos corruptos en stats
    localStorage.setItem('palabra:stats:v1:es5', 'invalid');
    expect(loadStats('es5')).toEqual(getInitialStats());
  });

  it('persiste y recupera tema', () => {
    saveTheme('dark');
    expect(loadTheme()).toBe('dark');
    saveTheme('light');
    expect(loadTheme()).toBe('light');
  });
});
