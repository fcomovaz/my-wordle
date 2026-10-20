import React, { useState } from 'react';
import { GameMode } from '../types';

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
  const [codeInput, setCodeInput] = useState(currentCode);

  const handleSubmitCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (codeInput.trim()) {
      onSelectMode('code', codeInput.trim());
    }
  };

  return (
    <div>
      <div className="mode-selector">
        <button
          type="button"
          className={`mode-tab ${currentMode === 'daily' ? 'active' : ''}`}
          onClick={() => onSelectMode('daily')}
        >
          📅 Diaria (UTC)
        </button>
        <button
          type="button"
          className={`mode-tab ${currentMode === 'code' ? 'active' : ''}`}
          onClick={() => onSelectMode('code', codeInput || 'AMIGOS')}
        >
          🔑 Código privado
        </button>
      </div>

      {currentMode === 'code' && (
        <form className="code-input-form" onSubmit={handleSubmitCode}>
          <input
            type="text"
            className="code-input"
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value)}
            placeholder="EJ: FIESTA-JUAN"
            maxLength={25}
          />
          <button type="submit" className="btn-primary" style={{ padding: '8px 14px' }}>
            Jugar
          </button>
        </form>
      )}
    </div>
  );
};
