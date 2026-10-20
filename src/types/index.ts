export type TileState = 'correct' | 'present' | 'absent';

export type GameStatus = 'idle' | 'playing' | 'won' | 'lost';

export type GameMode = 'daily' | 'code';

export interface Corpus {
  id: string;
  lang: string;
  wordLength: number;
  version: number;
  words: string[];
  valid: string[];
}

export interface ShareToken {
  version: string;
  corpusId: string;
  seed: string;
  attempts: number | 'X';
  gridB64: string;
}

export interface Stats {
  played: number;
  wins: number;
  currentStreak: number;
  maxStreak: number;
  distribution: Record<1 | 2 | 3 | 4 | 5 | 6, number>;
  lastPlayedDate?: string;
}

export interface SavedGame {
  version: number;
  corpusId: string;
  seed: string;
  answer: string;
  guesses: string[];
  status: GameStatus;
  startTime?: number;
  endTime?: number;
}

export interface RivalComparison {
  shareToken: ShareToken;
  rivalGrid: TileState[][];
  rivalAttempts: number | 'X';
}
