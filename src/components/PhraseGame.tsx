import React, { useEffect, useCallback, useMemo } from 'react';
import { normalize } from '../lib/normalize';
import { Keyboard } from './Keyboard';
import { TileState } from '../types';

interface PhraseGameProps {
  phrase: string;
  onWin: () => void;
}

export const PhraseGame: React.FC<PhraseGameProps> = ({ phrase, onWin }) => {
  const [guessedLetters, setGuessedLetters] = React.useState<Set<string>>(new Set());
  const [mistakes, setMistakes] = React.useState(0);
  const maxMistakes = 6;

  const phraseNorm = useMemo(() => normalize(phrase), [phrase]);

  const uniqueLetters = useMemo(() => {
    const set = new Set<string>();
    for (const ch of phraseNorm) {
      if (/[A-ZÑ]/.test(ch)) set.add(ch);
    }
    return set;
  }, [phraseNorm]);

  const isWon = useMemo(() => {
    for (const ch of uniqueLetters) {
      if (!guessedLetters.has(ch)) return false;
    }
    return true;
  }, [uniqueLetters, guessedLetters]);

  const isLost = mistakes >= maxMistakes;

  useEffect(() => {
    if (isWon) {
      onWin();
    }
  }, [isWon, onWin]);

  const handleGuess = useCallback(
    (letter: string) => {
      if (isWon || isLost) return;
      const char = normalize(letter);
      if (!/^[A-ZÑ]$/.test(char) || guessedLetters.has(char)) return;

      const next = new Set(guessedLetters);
      next.add(char);
      setGuessedLetters(next);

      if (!phraseNorm.includes(char)) {
        setMistakes((m) => m + 1);
      }
    },
    [isWon, isLost, guessedLetters, phraseNorm]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey || e.altKey) return;
      if (/^[a-zA-ZñÑáéíóúÁÉÍÓÚüÜ]$/.test(e.key)) {
        handleGuess(e.key);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleGuess]);

  // Teclado virtual states
  const letterStates = useMemo(() => {
    const states: Record<string, TileState> = {};
    for (const l of guessedLetters) {
      states[l] = phraseNorm.includes(l) ? 'correct' : 'absent';
    }
    return states;
  }, [guessedLetters, phraseNorm]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'space-between', padding: '12px 16px' }}>
      <div style={{ textAlign: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
          Adivina las letras del refrán o frase célebre
        </div>
        <div style={{ fontSize: '1.1rem', fontWeight: 700, marginTop: 4 }}>
          Fallos: {mistakes} / {maxMistakes} {mistakes >= 4 ? '⚠️' : ''}
        </div>
      </div>

      {/* Renderizado de la frase en bloques de palabras */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 12,
          justifyContent: 'center',
          alignItems: 'center',
          margin: 'auto 0',
          padding: '10px 0',
        }}
      >
        {phrase.split(' ').map((word, wIdx) => {
          return (
            <div key={wIdx} style={{ display: 'flex', gap: 4 }}>
              {word.split('').map((char, cIdx) => {
                const normChar = normalize(char);
                const isGuessed = guessedLetters.has(normChar) || isLost;
                const isPunctuation = !/[A-ZÑ]/.test(normChar);

                return (
                  <div
                    key={cIdx}
                    style={{
                      width: 'clamp(28px, 6vw, 38px)',
                      height: 'clamp(36px, 8vw, 46px)',
                      borderBottom: isPunctuation ? 'none' : '3px solid var(--tile-border)',
                      display: 'flex',
                      justifyContent: 'center',
                      alignItems: 'center',
                      fontSize: 'clamp(1.2rem, 4vw, 1.6rem)',
                      fontWeight: 800,
                      backgroundColor: isGuessed && !isPunctuation ? 'var(--bg-secondary)' : 'transparent',
                      borderRadius: 'var(--radius-sm)',
                      color: isLost && !guessedLetters.has(normChar) ? 'var(--color-present)' : 'var(--text-primary)',
                    }}
                  >
                    {isPunctuation ? char : isGuessed ? char : ''}
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>

      {isLost && (
        <div style={{ textAlign: 'center', color: 'var(--color-present)', fontWeight: 700, margin: '8px 0' }}>
          ¡Agotaste los intentos! La frase era: {phrase}
        </div>
      )}

      {isWon && (
        <div style={{ textAlign: 'center', color: 'var(--color-correct)', fontWeight: 800, margin: '8px 0' }}>
          🎉 ¡Acertaste la frase completa!
        </div>
      )}

      <Keyboard
        onKey={(k) => handleGuess(k)}
        letterStates={letterStates}
        disabled={isWon || isLost}
      />
    </div>
  );
};
