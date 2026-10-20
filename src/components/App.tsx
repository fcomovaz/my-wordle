import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import corpusData from '../data/es5.json';
import phrasesData from '../data/es-frases.json';
import { Corpus, PhraseCorpus, GameMode } from '../types';
import { buildSeedString, selectWord, selectPhrase, generateRandomCode, normalizeCode } from '../lib/seed';
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

  // Código compartido para jugar con amigos (opcional)
  const [sharedCode, setSharedCode] = useState(() => generateRandomCode());
  const [isCustomCodeActive, setIsCustomCodeActive] = useState(false);

  // Contador de regeneración para modo solo (número incremental)
  const [dailyNonce, setDailyNonce] = useState(0);
  const [phraseNonce, setPhraseNonce] = useState(0);

  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const toastTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Modo Supervivencia / Racha
  const [survivalLevel, setSurvivalLevel] = useState(1);
  const [survivalStreak, setSurvivalStreak] = useState(0);
  const [isPhraseFinished, setIsPhraseFinished] = useState(false);

  const { stats, recordGameResult } = useStats(corpus.id);

  // Toast
  const showToast = useCallback((msg: string, durationMs = 2500) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToastMessage(msg);
    toastTimerRef.current = setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, durationMs);
  }, []);

  // Construcción determinista idéntica del identificador de semilla
  const currentIdentifier = useMemo(() => {
    // Si hay un código compartido activo (ej: con amigo o novia)
    if (isCustomCodeActive) {
      const codeNorm = normalizeCode(sharedCode);
      if (mode === 'daily') {
        return codeNorm;
      }
      if (mode === 'phrase') {
        return `${codeNorm}-frase`;
      }
      // survival
      return `${codeNorm}-lvl-${survivalLevel}`;
    }

    // Modo solo normal:
    if (mode === 'daily') {
      return dailyNonce === 0 ? getUtcDateString() : `${getUtcDateString()}-r${dailyNonce}`;
    }
    if (mode === 'phrase') {
      return phraseNonce === 0 ? getUtcDateString() : `${getUtcDateString()}-r${phraseNonce}`;
    }
    // survival solo
    return `${normalizeCode(sharedCode)}-lvl-${survivalLevel}`;
  }, [isCustomCodeActive, sharedCode, mode, dailyNonce, phraseNonce, survivalLevel]);

  const activeSeedString = useMemo(() => {
    return buildSeedString(mode, corpus.id, currentIdentifier);
  }, [mode, currentIdentifier]);

  // Selección de palabra
  const { word: targetWord } = useMemo(() => {
    return selectWord(activeSeedString, corpus);
  }, [activeSeedString]);

  // Selección de frase
  const { phrase: targetPhrase } = useMemo(() => {
    const pSeed = buildSeedString('phrase', phraseCorpus.id, currentIdentifier);
    return selectPhrase(pSeed, phraseCorpus);
  }, [currentIdentifier]);

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

  // Tema
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    saveTheme(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Guardar partida en progreso
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

  // Fin de juego
  useEffect(() => {
    if (mode !== 'phrase' && (gameState.status === 'won' || gameState.status === 'lost')) {
      const isWon = gameState.status === 'won';
      const dateKey = mode === 'daily' && !isCustomCodeActive && dailyNonce === 0 ? getUtcDateString() : undefined;
      recordGameResult(isWon, gameState.guesses.length, dateKey);

      if (mode === 'survival') {
        if (isWon) {
          setSurvivalStreak((s) => s + 1);
          showToast(`🔥 ¡Nivel superado! Racha: ${survivalStreak + 1}`, 2200);
        } else {
          showToast(`💀 Racha terminada: ${survivalStreak} palabras.`, 3000);
        }
      }

      const timer = setTimeout(() => {
        setIsStatsOpen(true);
      }, 1400);
      return () => clearTimeout(timer);
    }
  }, [gameState.status, gameState.guesses.length, mode, isCustomCodeActive, dailyNonce, recordGameResult, survivalStreak, showToast]);

  // Toast originado por useGame
  useEffect(() => {
    if (mode !== 'phrase' && gameState.message) {
      showToast(gameState.message, 2000);
    }
  }, [mode, gameState.message, showToast]);

  const handleNextSurvival = useCallback(() => {
    setSurvivalLevel((l) => l + 1);
    setIsStatsOpen(false);
  }, []);

  const handleRestartSurvival = useCallback(() => {
    const nextSeed = generateRandomCode();
    setSharedCode(nextSeed);
    setSurvivalStreak(0);
    setSurvivalLevel(1);
    setIsStatsOpen(false);
    showToast(`Racha reiniciada: nivel 1`, 2000);
  }, [showToast]);

  const handlePhraseWin = useCallback(() => {
    setIsPhraseFinished(true);
    showToast('🎉 ¡Felicidades! Descubriste la frase.', 2500);
    setTimeout(() => {
      setIsStatsOpen(true);
    }, 1200);
  }, [showToast]);

  const handlePhraseLost = useCallback(() => {
    setIsPhraseFinished(true);
    showToast('¡Agotaste los intentos de la frase!', 2500);
    setTimeout(() => {
      setIsStatsOpen(true);
    }, 1200);
  }, [showToast]);

  // Regenerar palabra o frase individualmente en modo solo o generar nuevo código compartido
  const handleRegenerate = useCallback(() => {
    if (isCustomCodeActive) {
      const nextCode = generateRandomCode();
      setSharedCode(nextCode);
      setSurvivalStreak(0);
      setSurvivalLevel(1);
      setIsPhraseFinished(false);
      showToast(`✨ Nuevo código compartido generado: ${nextCode}`, 2500);
      return;
    }

    if (mode === 'daily') {
      setDailyNonce((n) => n + 1);
      showToast('✨ Nueva palabra aleatoria generada', 2000);
    } else if (mode === 'phrase') {
      setPhraseNonce((n) => n + 1);
      setIsPhraseFinished(false);
      showToast('✨ Nueva frase generada', 2000);
    } else if (mode === 'survival') {
      handleRestartSurvival();
    }
  }, [isCustomCodeActive, mode, handleRestartSurvival, showToast]);

  const isGameOver = gameState.status === 'won' || gameState.status === 'lost';

  const modeBadge =
    mode === 'daily'
      ? isCustomCodeActive
        ? `CÓDIGO: ${sharedCode}`
        : dailyNonce === 0
        ? 'PALABRA'
        : `LIBRE (#${dailyNonce})`
      : mode === 'phrase'
      ? isCustomCodeActive
        ? `CÓDIGO: ${sharedCode}`
        : phraseNonce === 0
        ? 'FRASE'
        : `FRASE (#${phraseNonce})`
      : `RACHA (${survivalStreak}🔥)`;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
      {toastMessage && <div className="feedback-toast">{toastMessage}</div>}

      <Header
        onOpenHelp={() => setIsHelpOpen(true)}
        onOpenStats={() => setIsStatsOpen(true)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onRegenerate={handleRegenerate}
        modeLabel={modeBadge}
      />

      <ModeSelector
        currentMode={mode}
        onSelectMode={(m) => {
          setMode(m);
          setIsPhraseFinished(false);
        }}
        sharedCode={sharedCode}
        isCustomCodeActive={isCustomCodeActive}
        onApplyCustomCode={(code) => {
          setSharedCode(code);
          setIsCustomCodeActive(true);
          setSurvivalStreak(0);
          setSurvivalLevel(1);
          setIsPhraseFinished(false);
          showToast(`Sincronizado con código: ${code}`, 2500);
        }}
        onClearCustomCode={() => {
          setIsCustomCodeActive(false);
          setSurvivalStreak(0);
          setSurvivalLevel(1);
          showToast('Regresaste al modo individual', 2000);
        }}
      />

      {mode === 'survival' && (
        <div style={{ padding: '4px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <span>Código de racha: <strong>{sharedCode}</strong> (Nivel {survivalLevel})</span>
          <button
            type="button"
            className="btn-secondary"
            style={{ padding: '2px 8px', fontSize: '0.75rem' }}
            onClick={handleRestartSurvival}
            title="Reiniciar racha"
          >
            Nueva serie
          </button>
        </div>
      )}

      {mode === 'phrase' ? (
        <PhraseGame
          key={activeSeedString}
          phrase={targetPhrase}
          corpus={corpus}
          onWin={handlePhraseWin}
          onLost={handlePhraseLost}
          onErrorToast={(msg) => showToast(msg, 2000)}
        />
      ) : (
        <>
          <Board
            key={`board-${activeSeedString}`}
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
            ? 'FRASE'
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

          {(mode === 'phrase' || isPhraseFinished) && (
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Frase:
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

          <button
            type="button"
            className="btn-secondary"
            style={{ width: '100%', marginTop: 8 }}
            onClick={() => {
              handleRegenerate();
              setIsStatsOpen(false);
            }}
          >
            🔄 Jugar otra partida
          </button>
        </div>
      </Modal>
    </div>
  );
};
