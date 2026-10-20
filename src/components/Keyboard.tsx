import React from 'react';
import { KEYBOARD_ROWS } from '../lib/constants';
import { TileState } from '../types';

interface KeyboardProps {
  onKey: (key: string) => void;
  letterStates: Record<string, TileState>;
  disabled?: boolean;
}

export const Keyboard: React.FC<KeyboardProps> = ({
  onKey,
  letterStates,
  disabled = false,
}) => {
  return (
    <div className="keyboard-container" role="group" aria-label="Teclado virtual">
      {KEYBOARD_ROWS.map((row, rowIdx) => (
        <div key={rowIdx} className="keyboard-row">
          {row.map((key) => {
            const isWide = key === 'ENTER' || key === 'BACKSPACE';
            const state = letterStates[key];
            let className = 'key-btn';
            if (isWide) className += ' key-wide';
            if (state) className += ` key-${state}`;

            const label =
              key === 'BACKSPACE' ? 'Borrar' : key === 'ENTER' ? 'Enviar intento' : key;

            return (
              <button
                key={key}
                type="button"
                className={className}
                onClick={() => !disabled && onKey(key)}
                disabled={disabled}
                aria-label={label}
              >
                {key === 'BACKSPACE' ? '⌫' : key}
              </button>
            );
          })}
        </div>
      ))}
    </div>
  );
};
