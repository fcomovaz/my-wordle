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
        <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', marginTop: 8 }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8 }}>
            Configura una semilla global. Esta semilla rige la palabra, frase y racha para jugar de forma sincronizada con amigos:
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
              style={{ padding: '8px 10px' }}
            >
              🎲
            </button>
            <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }}>
              Aplicar
            </button>
          </form>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, fontSize: '0.8rem' }}>
            <span>Semilla activa: <strong>{currentSeedCode}</strong></span>
            <button
              type="button"
              className="btn-secondary"
              onClick={handleCopy}
              style={{ padding: '3px 8px', fontSize: '0.75rem' }}
            >
              {copied ? '✓ Copiada' : '📋 Copiar'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
