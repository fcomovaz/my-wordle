import React, { useState } from 'react';
import { GameMode } from '../types';
import { generateRandomCode } from '../lib/seed';

interface ModeSelectorProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  currentSeedCode: string;
  onUpdateSeedCode: (code: string) => void;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  currentSeedCode,
  onUpdateSeedCode,
}) => {
  const [inputVal, setInputVal] = useState(currentSeedCode);
  const [copied, setCopied] = useState(false);

  const handleApply = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputVal.trim()) {
      onUpdateSeedCode(inputVal.trim());
    }
  };

  const handleRandom = () => {
    const next = generateRandomCode();
    setInputVal(next);
    onUpdateSeedCode(next);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(currentSeedCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div style={{ margin: '8px 16px 4px 16px' }}>
      <div className="mode-selector" style={{ margin: 0, padding: 4 }}>
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
        <button
          type="button"
          className={`mode-tab ${currentMode === 'seed' ? 'active' : ''}`}
          onClick={() => onSelectMode('seed')}
        >
          🔑 Semilla
        </button>
      </div>

      {currentMode === 'seed' && (
        <div
          style={{
            background: 'var(--bg-secondary)',
            padding: '16px',
            borderRadius: 'var(--radius-md)',
            marginTop: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          <div style={{ fontSize: '1rem', fontWeight: 700 }}>
            Panel de Semilla Compartida
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
            Ingresa o genera una semilla única para sincronizar la palabra, la frase y la serie de niveles de racha con tus amigos:
          </div>

          <form className="code-input-form" onSubmit={handleApply} style={{ margin: 0, gap: 6 }}>
            <input
              type="text"
              className="code-input"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder="EJ: FASHION-123"
              maxLength={25}
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={handleRandom}
              title="Generar nueva semilla aleatoria"
              style={{ padding: '8px 12px' }}
            >
              🎲 Azar
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '8px 14px' }}>
              Guardar
            </button>
          </form>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 12px',
              backgroundColor: 'var(--bg-primary)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-color)',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Semilla actual en uso:</span>
              <strong style={{ fontSize: '1rem', letterSpacing: '0.5px' }}>{currentSeedCode}</strong>
            </div>

            <button
              type="button"
              className="btn-secondary"
              onClick={handleCopy}
              style={{ padding: '6px 12px', fontSize: '0.85rem' }}
            >
              {copied ? '✓ ¡Copiada!' : '📋 Copiar'}
            </button>
          </div>

          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            💡 Para jugar con esta semilla, selecciona arriba <strong>📅 Palabra</strong>, <strong>📜 Frase</strong> o <strong>⚡ Racha</strong>.
          </div>
        </div>
      )}
    </div>
  );
};
