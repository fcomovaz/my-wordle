import React, { useMemo, useState, useEffect, useCallback } from 'react';
import { Corpus, TileState } from '../types';
import { normalize } from '../lib/normalize';
import { WORD_LENGTH, MAX_ATTEMPTS } from '../lib/constants';
import { Board } from './Board';
import { Keyboard } from './Keyboard';

interface PhraseGameProps {
  phrase: string;
  corpus: Corpus;
  onWin: () => void;
}

export const PhraseGame: React.FC<PhraseGameProps> = ({ phrase, corpus, onWin }) => {
  const [guesses, setGuesses] = useState<string[]>([]);
  const [currentGuess, setCurrentGuess] = useState('');
  const [isShaking, setIsShaking] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  // Normalizamos frase
  const phraseNorm = useMemo(() => normalize(phrase), [phrase]);

  // Letras únicas en la frase
  const phraseLetters = useMemo(() => {
    const set = new Set<string>();
    for (const ch of phraseNorm) {
      if (/[A-ZÑ]/.test(ch)) set.add(ch);
    }
    return set;
  }, [phraseNorm]);

  // Letras descubiertas por el jugador al ingresar palabras
  const revealedLetters = useMemo(() => {
    const revealed = new Set<string>();
    for (const g of guesses) {
      const gNorm = normalize(g);
      for (const ch of gNorm) {
        if (phraseLetters.has(ch)) {
          revealed.add(ch);
        }
      }
    }
    return revealed;
  }, [guesses, phraseLetters]);

  // Victoria si todas las letras de la frase han sido reveladas
  const isWon = useMemo(() => {
    for (const ch of phraseLetters) {
      if (!revealedLetters.has(ch)) return false;
    }
    return true;
  }, [phraseLetters, revealedLetters]);

  const isLost = !isWon && guesses.length >= MAX_ATTEMPTS;

  useEffect(() => {
    if (isWon) {
      onWin();
    }
  }, [isWon, onWin]);

  const validSet = useMemo(() => new Set(corpus.valid.map(normalize)), [corpus]);

  // Para colorear en Board: una letra es 'correct' si está en la frase, 'absent' si no
  const currentEvaluations = useMemo(() => {
    return guesses.map((g) => {
      const gNorm = normalize(g);
      const ev: TileState[] = [];
      for (let i = 0; i < gNorm.length; i++) {
        const ch = gNorm[i];
        if (phraseLetters.has(ch)) {
          ev.push('correct');
        } else {
          ev.push('absent');
        }
      }
      return ev;
    });
  }, [guesses, phraseLetters]);

  const onKey = useCallback(
    (key: string) => {
      if (isWon || isLost) return;

      if (key === 'ENTER') {
        if (currentGuess.length < WORD_LENGTH) {
          setIsShaking(true);
          setMessage('Letras insuficientes');
          setTimeout(() => setIsShaking(false), 500);
          return;
        }

        const norm = normalize(currentGuess);
        if (!validSet.has(norm)) {
          setIsShaking(true);
          setMessage('Palabra no válida');
          setTimeout(() => setIsShaking(false), 500);
          return;
        }

        setGuesses((prev) => [...prev, currentGuess]);
        setCurrentGuess('');
      } else if (key === 'BACKSPACE' || key === 'DELETE') {
        setCurrentGuess((prev) => prev.slice(0, -1));
      } else if (/^[A-ZÑÁÉÍÓÚÜ]$/i.test(key) && key.length === 1) {
        if (currentGuess.length < WORD_LENGTH) {
          setCurrentGuess((prev) => prev + normalize(key));
        }
      }
    },
    [isWon, isLost, currentGuess, validSet]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (e.key === 'Enter') onKey('ENTER');
      else if (e.key === 'Backspace' || e.key === 'Delete') onKey('BACKSPACE');
      else if (/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]$/.test(e.key)) onKey(e.key);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onKey]);

  // Estados de teclado
  const letterStates = useMemo(() => {
    const states: Record<string, TileState> = {};
    for (const g of guesses) {
      const gNorm = normalize(g);
      for (const ch of gNorm) {
        if (phraseLetters.has(ch)) {
          states[ch] = 'correct';
        } else if (!states[ch]) {
          states[ch] = 'absent';
        }
      }
    }
    return states;
  }, [guesses, phraseLetters]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between' }}>
      {message && <div className="feedback-toast">{message}</div>}

      {/* Contenedor de la frase que se va destapando */}
      <div style={{ padding: '8px 12px', textAlign: 'center' }}>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: 6 }}>
          Ingresa palabras de 5 letras para destapar las letras de la frase oculta:
        </div>

        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '60px',
            padding: '6px 0',
          }}
        >
          {phrase.split(' ').map((word, wIdx) => (
            <div key={wIdx} style={{ display: 'flex', gap: 3 }}>
              {word.split('').map((char, cIdx) => {
                const normChar = normalize(char);
                const isLetter = /[A-ZÑ]/.test(normChar);
                const isRevealed = revealedLetters.has(normChar) || isLost;

                return (
                  <div
                    key={cIdx}
                    style={{
                      width: 'clamp(24px, 5.5vw, 32px)',
                      height: 'clamp(32px, 7.5vw, 40px)',
                      borderBottom: isLetter ? '2px solid var(--tile-border)' : 'none',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: 'clamp(1rem, 3.8vw, 1.3rem)',
                      fontWeight: 800,
                      backgroundColor: isRevealed && isLetter ? 'var(--bg-secondary)' : 'transparent',
                      color: isLost && !revealedLetters.has(normChar) ? 'var(--color-present)' : 'var(--text-primary)',
                      borderRadius: 'var(--radius-sm)',
                    }}
                  >
                    {!isLetter ? char : isRevealed ? char : ''}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Tablero de 6 intentos Wordle */}
      <Board
        guesses={guesses}
        evaluations={currentEvaluations}
        currentGuess={currentGuess}
        isShaking={isShaking}
        isWon={isWon}
      />

      {isLost && (
        <div style={{ textAlign: 'center', color: 'var(--color-present)', fontWeight: 700, margin: '4px 0' }}>
          ¡Agotaste los 6 intentos! La frase era: "{phrase}"
        </div>
      )}

      {isWon && (
        <div style={{ textAlign: 'center', color: 'var(--color-correct)', fontWeight: 800, margin: '4px 0' }}>
          🎉 ¡Descubriste la frase completa!
        </div>
      )}

      <Keyboard onKey={onKey} letterStates={letterStates} disabled={isWon || isLost} />
    </div>
  );
};
