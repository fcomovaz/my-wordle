import React, { useState, useEffect, useMemo } from 'react';
import corpusData from '../data/es5.json';
import { Corpus, GameMode } from '../types';
import { buildSeedString, selectWord } from '../lib/seed';
import { useGame } from '../hooks/useGame';
import { useStats } from '../hooks/useStats';
import { useShare } from '../hooks/useShare';
import { loadGame, saveGame, loadTheme, saveTheme } from '../lib/storage';
import { Header } from './Header';
import { Board } from './Board';
import { Keyboard } from './Keyboard';
import { Modal } from './Modal';
import { HelpModal } from './HelpModal';
import { StatsView } from './StatsView';
import { ShareCard } from './ShareCard';
import { CompareView } from './CompareView';
import { ModeSelector } from './ModeSelector';

const corpus = corpusData as Corpus;

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
  const [customCode, setCustomCode] = useState('AMIGOS');
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const { rivalComparison, clearRival } = useShare();
  const { stats, recordGameResult } = useStats(corpus.id);

  // Determinar la semilla actual
  const currentSeed = useMemo(() => {
    if (rivalComparison) {
      return rivalComparison.shareToken.seed;
    }
    if (mode === 'daily') {
      return getUtcDateString();
    }
    return customCode;
  }, [rivalComparison, mode, customCode]);

  const activeSeedString = useMemo(() => {
    if (rivalComparison) {
      return rivalComparison.shareToken.seed.startsWith('d:') ||
        rivalComparison.shareToken.seed.startsWith('c:')
        ? rivalComparison.shareToken.seed
        : `c:${corpus.id}:${rivalComparison.shareToken.seed}`;
    }
    return buildSeedString(mode, corpus.id, currentSeed);
  }, [rivalComparison, mode, currentSeed]);

  // Selección de palabra
  const { word: targetWord } = useMemo(() => {
    return selectWord(activeSeedString, corpus);
  }, [activeSeedString]);

  // Carga de juego guardado en localStorage
  const savedGame = useMemo(() => {
    return loadGame(corpus.id, activeSeedString);
  }, [activeSeedString]);

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
    if (gameState.guesses.length > 0 || gameState.status !== 'idle') {
      saveGame({
        version: 1,
        corpusId: corpus.id,
        seed: activeSeedString,
        answer: targetWord,
        guesses: gameState.guesses,
        status: gameState.status,
      });
    }
  }, [gameState.guesses, gameState.status, activeSeedString, targetWord]);

  // Si termina el juego, actualizar stats y abrir modal
  useEffect(() => {
    if (gameState.status === 'won' || gameState.status === 'lost') {
      const isWon = gameState.status === 'won';
      const dateKey = mode === 'daily' && !rivalComparison ? getUtcDateString() : undefined;
      recordGameResult(isWon, gameState.guesses.length, dateKey);

      const timer = setTimeout(() => {
        setIsStatsOpen(true);
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [gameState.status, gameState.guesses.length, mode, rivalComparison, recordGameResult]);

  // Mostrar mensaje de error/shake
  useEffect(() => {
    if (gameState.message) {
      setToastMessage(gameState.message);
      const timer = setTimeout(() => {
        setToastMessage(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [gameState.message]);

  const isGameOver = gameState.status === 'won' || gameState.status === 'lost';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {toastMessage && <div className="feedback-toast">{toastMessage}</div>}

      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        modeLabel={rivalComparison ? 'VS RIVAL' : mode === 'daily' ? 'DIARIA' : 'CÓDIGO'}
      />

      {!rivalComparison && (
        <ModeSelector
          currentMode={mode}
          onSelectMode={(m, code) => {
            setMode(m);
            if (code) setCustomCode(code);
          }}
          currentCode={customCode}
        />
      )}

      {rivalComparison && !isGameOver && (
        <div style={{ padding: '8px 16px', textAlign: 'center', fontSize: '0.85rem', color: 'var(--color-present)' }}>
          ⚔️ Modo Desafío Rival: Adivina la misma palabra para ver la comparación.
        </div>
      )}

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

      {/* Modal de Ayuda */}
      <Modal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} title="CÓMO JUGAR">
        <HelpModal />
      </Modal>

      {/* Modal de Estadísticas & Compartir & Comparar */}
      <Modal
        isOpen={isStatsOpen}
        onClose={() => setIsStatsOpen(false)}
        title={isGameOver ? (gameState.status === 'won' ? '¡VICTORIA!' : 'FIN DEL JUEGO') : 'ESTADÍSTICAS'}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {isGameOver && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                La palabra secreta era:
              </div>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--color-correct)' }}>
                {targetWord}
              </div>
            </div>
          )}

          {rivalComparison && isGameOver ? (
            <CompareView
              myAttempts={gameState.status === 'won' ? gameState.guesses.length : 'X'}
              myGrid={gameState.evaluations}
              rivalAttempts={rivalComparison.rivalAttempts}
              rivalGrid={rivalComparison.rivalGrid}
              onPlayAgain={clearRival}
            />
          ) : (
            <>
              <StatsView
                stats={stats}
                lastGuessesCount={gameState.status === 'won' ? gameState.guesses.length : undefined}
              />
              {isGameOver && (
                <ShareCard
                  corpusId={corpus.id}
                  seed={activeSeedString}
                  attempts={gameState.status === 'won' ? gameState.guesses.length : 'X'}
                  grid={gameState.evaluations}
                  onCopied={() => setToastMessage('¡Copiado al portapapeles!')}
                />
              )}
            </>
          )}
        </div>
      </Modal>
    </div>
  );
};
