import { SavedGame, Stats } from '../types';

const STORAGE_VERSION = 1;
const GAME_STORAGE_PREFIX = 'palabra:game:v1:';
const STATS_STORAGE_PREFIX = 'palabra:stats:v1:';
const THEME_STORAGE_KEY = 'palabra:theme';

export function saveGame(game: SavedGame): void {
  try {
    const key = `${GAME_STORAGE_PREFIX}${game.corpusId}:${game.seed}`;
    localStorage.setItem(key, JSON.stringify(game));
  } catch (e) {
    console.error('Error al guardar partida:', e);
  }
}

export function loadGame(corpusId: string, seed: string): SavedGame | null {
  try {
    const key = `${GAME_STORAGE_PREFIX}${corpusId}:${seed}`;
    const data = localStorage.getItem(key);
    if (!data) return null;
    const parsed = JSON.parse(data) as SavedGame;
    if (parsed.version !== STORAGE_VERSION || !Array.isArray(parsed.guesses)) {
      return null;
    }
    return parsed;
  } catch (e) {
    console.error('Error al cargar partida (datos corruptos ignorados):', e);
    return null;
  }
}

export function clearGame(corpusId: string, seed: string): void {
  try {
    const key = `${GAME_STORAGE_PREFIX}${corpusId}:${seed}`;
    localStorage.removeItem(key);
  } catch (e) {
    console.error('Error al limpiar partida:', e);
  }
}

export function getInitialStats(): Stats {
  return {
    played: 0,
    wins: 0,
    currentStreak: 0,
    maxStreak: 0,
    distribution: { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 },
  };
}

export function saveStats(corpusId: string, stats: Stats): void {
  try {
    const key = `${STATS_STORAGE_PREFIX}${corpusId}`;
    localStorage.setItem(key, JSON.stringify(stats));
  } catch (e) {
    console.error('Error al guardar stats:', e);
  }
}

export function loadStats(corpusId: string): Stats {
  try {
    const key = `${STATS_STORAGE_PREFIX}${corpusId}`;
    const data = localStorage.getItem(key);
    if (!data) return getInitialStats();
    const parsed = JSON.parse(data) as Stats;
    if (
      typeof parsed.played !== 'number' ||
      typeof parsed.wins !== 'number' ||
      !parsed.distribution
    ) {
      return getInitialStats();
    }
    return parsed;
  } catch (e) {
    console.error('Error al cargar stats:', e);
    return getInitialStats();
  }
}

export function saveTheme(theme: 'light' | 'dark'): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch (e) {
    console.error('Error al guardar tema:', e);
  }
}

export function loadTheme(): 'light' | 'dark' {
  try {
    const t = localStorage.getItem(THEME_STORAGE_KEY);
    if (t === 'light' || t === 'dark') return t;
    return window.matchMedia &&
      window.matchMedia('(prefers-color-scheme: dark)').matches
      ? 'dark'
      : 'light';
  } catch {
    return 'light';
  }
}
