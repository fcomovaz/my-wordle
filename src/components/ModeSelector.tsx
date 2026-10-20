import React, { useState } from 'react';
import { GameMode } from '../types';
import { generateRandomCode } from '../lib/seed';

interface ModeSelectorProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode, code?: string) => void;
  currentCode?: string;
}

export const ModeSelector: React.FC<ModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  currentCode = '',
}) => {
  const [codeInput, setCodeInput] = useState(currentCode || generateRandomCode());

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.trim()) {
      onSelectMode('code', codeInput.trim());
    }
  };

  const handleGenerateNew = () => {
    const next = generateRandomCode();
    setCodeInput(next);
    onSelectMode('code', next);
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
          className={`mode-tab ${currentMode === 'code' ? 'active' : ''}`}
          onClick={() => onSelectMode('code', codeInput || generateRandomCode())}
        >
          🔑 Sala
        </button>
      </div>

      {currentMode === 'code' && (
        <form className="code-input-form" onSubmit={handleSubmitCode} style={{ margin: '10px 0 0 0' }}>
          <input
            type="text"
            className="code-input"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="EJ: VELOZ-FUEGO-420"
            maxLength={25}
          />
          <button
            type="button"
            className="btn-secondary"
            onClick={handleGenerateNew}
            title="Generar código aleatorio nuevo"
            aria-label="Generar código aleatorio"
            style={{ padding: '8px 12px' }}
          >
            🎲 Nuevo
          </button>
          <button type="submit" className="btn-primary" style={{ padding: '8px 14px' }}>
            Jugar
          </button>
        </form>
      )}
    </div>
  );
};
