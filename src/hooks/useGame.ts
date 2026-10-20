import { useReducer, useEffect, useCallback, useMemo } from 'react';
import { GameStatus, TileState, Corpus } from '../types';
import { evaluate } from '../lib/evaluator';
import { normalize } from '../lib/normalize';
import { WORD_LENGTH, MAX_ATTEMPTS } from '../lib/constants';

export interface GameStateInternal {
  status: GameStatus;
  answer: string;
  seed: string;
  guesses: string[];
  evaluations: TileState[][];
  currentGuess: string;
  isShaking: boolean;
  message: string | null;
}

export type GameAction =
  | { type: 'ADD_LETTER'; letter: string }
  | { type: 'DELETE' }
  | { type: 'SUBMIT'; validSet: Set<string> }
  | { type: 'CLEAR_SHAKE' }
  | { type: 'CLEAR_MESSAGE' }
  | {
      type: 'INIT_GAME';
      seed: string;
      answer: string;
      savedGuesses?: string[];
      savedStatus?: GameStatus;
    };

function gameReducer(state: GameStateInternal, action: GameAction): GameStateInternal {
  switch (action.type) {
    case 'INIT_GAME': {
      const savedGuesses = action.savedGuesses || [];
      const evals = savedGuesses.map((g) => evaluate(g, action.answer));
      const hasWon =
        evals.length > 0 &&
        evals[evals.length - 1].every((s) => s === 'correct');
      const hasLost = !hasWon && savedGuesses.length >= MAX_ATTEMPTS;

      let status: GameStatus = action.savedStatus || 'idle';
      if (hasWon) status = 'won';
      else if (hasLost) status = 'lost';
      else if (savedGuesses.length > 0) status = 'playing';

      return {
        status,
        answer: action.answer,
        seed: action.seed,
        guesses: savedGuesses,
        evaluations: evals,
        currentGuess: '',
        isShaking: false,
        message: null,
      };
    }

    case 'ADD_LETTER': {
      if (state.status === 'won' || state.status === 'lost') return state;
      if (state.currentGuess.length >= WORD_LENGTH) return state;
      return {
        ...state,
        status: 'playing',
        currentGuess: state.currentGuess + action.letter.toUpperCase(),
        message: null,
      };
    }

    case 'DELETE': {
      if (state.status === 'won' || state.status === 'lost') return state;
      if (state.currentGuess.length === 0) return state;
      return {
        ...state,
        currentGuess: state.currentGuess.slice(0, -1),
        message: null,
      };
    }

    case 'SUBMIT': {
      if (state.status === 'won' || state.status === 'lost') return state;
      if (state.currentGuess.length < WORD_LENGTH) {
        return {
          ...state,
          isShaking: true,
          message: 'Letras insuficientes',
        };
      }

      const guessNorm = normalize(state.currentGuess);
      if (!action.validSet.has(guessNorm)) {
        return {
          ...state,
          isShaking: true,
          message: 'Palabra no válida',
        };
      }

      const ev = evaluate(guessNorm, state.answer);
      const nextGuesses = [...state.guesses, state.currentGuess];
      const nextEvaluations = [...state.evaluations, ev];

      const isWon = ev.every((s) => s === 'correct');
      const isLost = !isWon && nextGuesses.length >= MAX_ATTEMPTS;

      return {
        ...state,
        guesses: nextGuesses,
        evaluations: nextEvaluations,
        currentGuess: '',
        status: isWon ? 'won' : isLost ? 'lost' : 'playing',
        message: isWon ? '¡Excelente!' : isLost ? `La palabra era: ${state.answer}` : null,
      };
    }

    case 'CLEAR_SHAKE':
      return { ...state, isShaking: false };

    case 'CLEAR_MESSAGE':
      return { ...state, message: null };

    default:
      return state;
  }
}

export function useGame(
  corpus: Corpus,
  seed: string,
  targetAnswer: string,
  initialSavedGuesses?: string[],
  initialSavedStatus?: GameStatus
) {
  const [state, dispatch] = useReducer(gameReducer, {
    status: initialSavedStatus || 'idle',
    answer: targetAnswer,
    seed,
    guesses: initialSavedGuesses || [],
    evaluations: (initialSavedGuesses || []).map((g) => evaluate(g, targetAnswer)),
    currentGuess: '',
    isShaking: false,
    message: null,
  });

  const validSet = useMemo(() => {
    return new Set(corpus.valid.map(normalize));
  }, [corpus]);

  useEffect(() => {
    dispatch({
      type: 'INIT_GAME',
      seed,
      answer: targetAnswer,
      savedGuesses: initialSavedGuesses,
      savedStatus: initialSavedStatus,
    });
  }, [seed, targetAnswer, initialSavedGuesses, initialSavedStatus]);

  useEffect(() => {
    if (state.isShaking) {
      const timer = setTimeout(() => {
        dispatch({ type: 'CLEAR_SHAKE' });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [state.isShaking]);

  const onKey = useCallback(
    (key: string) => {
      if (key === 'ENTER') {
        dispatch({ type: 'SUBMIT', validSet });
      } else if (key === 'BACKSPACE' || key === 'DELETE') {
        dispatch({ type: 'DELETE' });
      } else if (/^[A-ZÑÁÉÍÓÚÜ]$/i.test(key) && key.length === 1) {
        dispatch({ type: 'ADD_LETTER', letter: normalize(key) });
      }
    },
    [validSet]
  );

  // Listener para teclado físico
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') {
        onKey('ENTER');
      } else if (e.key === 'Backspace' || e.key === 'Delete') {
        onKey('BACKSPACE');
      } else if (/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]$/.test(e.key)) {
        onKey(e.key);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKey]);

  // Cálculo de estados de letras para el teclado
  const letterStates = useMemo(() => {
    const states: Record<string, TileState> = {};
    for (let i = 0; i < state.guesses.length; i++) {
      const guess = normalize(state.guesses[i]);
      const ev = state.evaluations[i];
      for (let j = 0; j < guess.length; j++) {
        const char = guess[j];
        const current = states[char];
        const next = ev[j];

        if (next === 'correct') {
          states[char] = 'correct';
        } else if (next === 'present' && current !== 'correct') {
          states[char] = 'present';
        } else if (next === 'absent' && !current) {
          states[char] = 'absent';
        }
      }
    }
    return states;
  }, [state.guesses, state.evaluations]);

  return {
    state,
    onKey,
    letterStates,
  };
}
