import React, { useState, useEffect, useMemo, useCallback } from 'react';
import corpusData from '../data/es5.json';
import phrasesData from '../data/es-frases.json';
import { Corpus, PhraseCorpus, GameMode } from '../types';
import { buildSeedString, selectWord, selectPhrase, generateRandomCode } from '../lib/seed';
import { useGame } from '../hooks/useGame';
import { useStats } from '../hooks/useStats';
import { loadGame, saveGame, loadTheme, saveTheme } from '../lib/storage';
import { Header } from './Header';
import { Board } from './Board';
import { Keyboard } from './Keyboard';
import { Modal } from './Modal';
import { HelpModal } from './HelpModal';
import { StatsView } from './StatsView';
import { ModeSelector } from './ModeSelector';
import { PhraseGame } from './PhraseGame';

const corpus = corpusData as Corpus;
const phraseCorpus = phrasesData as PhraseCorpus;

function getUtcDateString(): string {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const App: React.FC = () => {
  const [theme, setTheme] = useState<'light' | 'dark'>(() => loadTheme());
  const [mode, setMode] = useState<GameMode>('daily');
  const [customCode, setCustomCode] = useState(() => generateRandomCode());
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modo Supervivencia / Racha
  const [survivalLevel, setSurvivalLevel] = useState(1);
  const [survivalStreak, setSurvivalStreak] = useState(0);

  const { stats, recordGameResult } = useStats(corpus.id);

  // Determinar la semilla
  const currentSeed = useMemo(() => {
    if (mode === 'daily') return getUtcDateString();
    if (mode === 'phrase') return getUtcDateString();
    if (mode === 'survival') return `racha-lvl-${survivalLevel}-${getUtcDateString()}`;
    return customCode;
  }, [mode, customCode, survivalLevel]);

  const activeSeedString = useMemo(() => {
    return buildSeedString(mode, corpus.id, currentSeed);
  }, [mode, currentSeed]);

  // Selección de palabra (para modos de 5 letras)
  const { word: targetWord } = useMemo(() => {
    return selectWord(activeSeedString, corpus);
  }, [activeSeedString]);

  // Selección de frase (para modo frase)
  const { phrase: targetPhrase } = useMemo(() => {
    const pSeed = buildSeedString('phrase', phraseCorpus.id, currentSeed);
    return selectPhrase(pSeed, phraseCorpus);
  }, [currentSeed]);

  // Carga de juego guardado en localStorage
  const savedGame = useMemo(() => {
    if (mode === 'phrase') return null;
    return loadGame(corpus.id, activeSeedString);
  }, [mode, activeSeedString]);

  const { state: gameState, onKey, letterStates } = useGame(
    corpus,
    activeSeedString,
    targetWord,
    savedGame?.guesses,
    savedGame?.status
  );

  // Aplicar tema en data-theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Guardar progreso del juego
  useEffect(() => {
    if (mode !== 'phrase' && (gameState.guesses.length > 0 || gameState.status !== 'idle')) {
      saveGame({
        version: 1,
        corpusId: corpus.id,
        seed: activeSeedString,
        answer: targetWord,
        guesses: gameState.guesses,
        status: gameState.status,
      });
    }
  }, [mode, gameState.guesses, gameState.status, activeSeedString, targetWord]);

  // Si termina el juego de palabras
  useEffect(() => {
    if (mode !== 'phrase' && (gameState.status === 'won' || gameState.status === 'lost')) {
      const isWon = gameState.status === 'won';
      const dateKey = mode === 'daily' ? getUtcDateString() : undefined;
      recordGameResult(isWon, gameState.guesses.length, dateKey);

      if (mode === 'survival') {
        if (isWon) {
          setSurvivalStreak((s) => s + 1);
          setToastMessage(`🔥 ¡Nivel superado! Racha: ${survivalStreak + 1}`);
        } else {
          setToastMessage(`💀 Racha terminada: ${survivalStreak} palabras.`);
        }
      }

      const timer = setTimeout(() => {
        setIsStatsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.status, gameState.guesses.length, mode, recordGameResult, survivalStreak]);

  // Toast mensaje
  useEffect(() => {
    if (gameState.message) {
      setToastMessage(gameState.message);
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.message]);

  const handleNextSurvival = useCallback(() => {
    setSurvivalLevel((l) => l + 1);
    setIsStatsOpen(false);
  }, []);

  const handleRestartSurvival = useCallback(() => {
    setSurvivalStreak(0);
    setSurvivalLevel((l) => l + 100);
    setIsStatsOpen(false);
  }, []);

  const handlePhraseWin = useCallback(() => {
    setToastMessage('🎉 ¡Felicidades! Frase del día completada.');
    setTimeout(() => {
      setIsStatsOpen(true);
    }, 1200);
  }, []);

  const isGameOver = gameState.status === 'won' || gameState.status === 'lost';

  const modeBadge =
    mode === 'daily'
      ? 'PALABRA'
      : mode === 'phrase'
      ? 'FRASE'
      : mode === 'survival'
      ? `RACHA (${survivalStreak}🔥)`
      : 'SALA';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {toastMessage && <div className="feedback-toast">{toastMessage}</div>}

      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        modeLabel={modeBadge}
      />

      <ModeSelector
        currentMode={mode}
        onSelectMode={(m, code) => {
          setMode(m);
          if (code) setCustomCode(code);
        }}
        currentCode={customCode}
      />

      {mode === 'phrase' ? (
        <PhraseGame key={activeSeedString} phrase={targetPhrase} onWin={handlePhraseWin} />
      ) : (
        <>
          <Board
            guesses={gameState.guesses}
            evaluations={gameState.evaluations}
            currentGuess={gameState.currentGuess}
            isShaking={gameState.isShaking}
            isWon={gameState.status === 'won'}
          />

          <Keyboard
            onKey={onKey}
            letterStates={letterStates}
            disabled={isGameOver}
          />
        </>
      )}

      {/* Modal de Ayuda */}
      <Modal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="CÓMO JUGAR">
        <HelpModal />
      </Modal>

      {/* Modal de Estadísticas */}
      <Modal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        title={
          mode === 'phrase'
            ? 'FRASE DEL DÍA'
            : isGameOver
            ? gameState.status === 'won'
              ? '¡VICTORIA!'
              : 'FIN DE LA PARTIDA'
            : 'ESTADÍSTICAS'
        }
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode !== 'phrase' && isGameOver && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                La palabra secreta era:
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-correct)' }}>
                {targetWord}
              </div>
            </div>
          )}

          {mode === 'phrase' && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Refrán del día:
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 800, color: 'var(--color-correct)', marginTop: 4 }}>
                "{targetPhrase}"
              </div>
            </div>
          )}

          <StatsView
            stats={stats}
            lastGuessesCount={gameState.status === 'won' ? gameState.guesses.length : undefined}
            survivalStreak={mode === 'survival' ? survivalStreak : undefined}
          />

          {mode === 'survival' && isGameOver && (
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              {gameState.status === 'won' ? (
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%' }}
                  onClick={handleNextSurvival}
                >
                  Continuar racha ⚡
                </button>
              ) : (
                <button
                  type="button"
                  className="btn-secondary"
                  style={{ width: '100%' }}
                  onClick={handleRestartSurvival}
                >
                  Reiniciar racha 🔄
                </button>
              )}
            </div>
          )}

          {mode === 'code' && (
            <button
              type="button"
              className="btn-secondary"
              style={{ width: '100%', marginTop: 8 }}
              onClick={() => {
                const next = generateRandomCode();
                setCustomCode(next);
                setIsStatsOpen(false);
              }}
            >
              🎲 Siguiente palabra aleatoria
            </button>
          )}
        </div>
      </Modal>
    </div>
  );
};
