import React, { useState, useCallback } from 'react';
import { GameMode } from '../types';
import { generateRandomCode } from '../lib/seed';

interface ModeSelectorProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  sharedCode: string;
  isCustomCodeActive: boolean;
  onApplyCustomCode: (code: string) => void;
  onClearCustomCode: () => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  sharedCode,
  isCustomCodeActive,
  onApplyCustomCode,
  onClearCustomCode,
}) => {
  const [showSeedPanel, setShowSeedPanel] = useState(false);
  const [inputCode, setInputCode] = useState(sharedCode);
  const [copied, setCopied] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const handleReset = useCallback(() => {
    if (!confirmReset) {
      setConfirmReset(true);
      return;
    }
    localStorage.clear();
    window.location.reload();
  }, [confirmReset]);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputCode.trim()) {
      onApplyCustomCode(inputCode.trim());
    }
  };

  const handleRandom = () => {
    const next = generateRandomCode();
    setInputCode(next);
    onApplyCustomCode(next);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(sharedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ margin: '8px 16px 4px 16px' }}>
      <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
        <div className="mode-selector" style={{ margin: 0, padding: 4, flex: 1 }}>
          <button
            type="button"
            className={`mode-tab ${currentMode === 'daily' ? 'active' : ''}`}
            onClick={() => onSelectMode('daily')}
          >
            📅 Palabra
          </button>
          <button
            type="button"
            className={`mode-tab ${currentMode === 'phrase' ? 'active' : ''}`}
            onClick={() => onSelectMode('phrase')}
          >
            📜 Frase
          </button>
          <button
            type="button"
            className={`mode-tab ${currentMode === 'survival' ? 'active' : ''}`}
            onClick={() => onSelectMode('survival')}
          >
            ⚡ Racha
          </button>
        </div>

        <button
          type="button"
          className="icon-btn"
          onClick={() => setShowSeedPanel((v) => !v)}
          title="Compartir código con un amigo o pareja"
          aria-label="Código compartido con amigos"
          style={{
            border: isCustomCodeActive ? '2px solid var(--color-correct)' : '1px solid var(--border-color)',
            background: isCustomCodeActive ? 'var(--bg-secondary)' : 'transparent',
            flexShrink: 0,
          }}
        >
          🔑
        </button>
      </div>

      {/* Banner de código activo si se está jugando con amigo */}
      {isCustomCodeActive && !showSeedPanel && (
        <div
          style={{
            marginTop: 6,
            padding: '4px 10px',
            borderRadius: 'var(--radius-sm)',
            background: 'var(--bg-secondary)',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '0.78rem',
          }}
        >
          <span>
            👥 Jugando con código: <strong>{sharedCode}</strong>
          </span>
          <button
            type="button"
            onClick={onClearCustomCode}
            style={{ color: 'var(--color-present)', fontWeight: 600, fontSize: '0.75rem' }}
          >
            Salir al modo normal
          </button>
        </div>
      )}

      {/* Panel desplegable para sincronizar con amigos */}
      {showSeedPanel && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            padding: '12px',
            borderRadius: 'var(--radius-md)',
            marginTop: 8,
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            gap: 10,
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <strong style={{ fontSize: '0.9rem' }}>👥 Jugar juntos con el mismo código</strong>
            <button
              type="button"
              onClick={() => setShowSeedPanel(false)}
              style={{ fontSize: '1rem', cursor: 'pointer' }}
              aria-label="Cerrar panel de código"
            >
              ✕
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
            Pásale este código a tu amigo/novia o escribe el suyo. Ambos tendrán exactamente las mismas palabras:
          </div>

          <form className="code-input-form" onSubmit={handleApply} style={{ margin: 0, gap: 6 }}>
            <input
              type="text"
              className="code-input"
              value={inputCode}
              onChange={(e) => setInputCode(e.target.value)}
              placeholder="EJ: AMOR-2026 o RETO-JUAN"
              maxLength={25}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRandom}
              title="Generar código aleatorio nuevo"
              style={{ padding: '8px 10px' }}
            >
              🎲
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}>
              Aplicar
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem' }}>
            <span>
              Código activo: <strong>{sharedCode}</strong>
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                type="button"
                className="btn-secondary"
                onClick={handleCopy}
                style={{ padding: '3px 8px', fontSize: '0.75rem' }}
              >
                {copied ? '✓ Copiado' : '📋 Copiar'}
              </button>
              {isCustomCodeActive && (
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    onClearCustomCode();
                    setShowSeedPanel(false);
                  }}
                  style={{ padding: '3px 8px', fontSize: '0.75rem' }}
                >
                  Volver a solo
                </button>
              )}
            </div>
          </div>

          {/* Separador y botón de reset */}
          <div
            style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: 8,
              marginTop: 4,
              display: 'flex',
              justifyContent: 'flex-end',
            }}
          >
            <button
              type="button"
              onClick={handleReset}
              style={{
                padding: '4px 10px',
                fontSize: '0.75rem',
                color: confirmReset ? '#fff' : 'var(--text-secondary)',
                background: confirmReset ? '#c0392b' : 'transparent',
                border: confirmReset ? '1px solid #c0392b' : '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                cursor: 'pointer',
              }}
            >
              {confirmReset ? '¿Seguro? Se borran todos los datos' : '🗑 Borrar datos'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
