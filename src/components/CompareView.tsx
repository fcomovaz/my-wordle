import React from 'react';
import { TileState } from '../types';

interface CompareViewProps {
  myAttempts: number | 'X';
  myGrid: TileState[][];
  rivalAttempts: number | 'X';
  rivalGrid: TileState[][];
  onPlayAgain?: () => void;
}

export const CompareView: React.FC<CompareViewProps> = ({
  myAttempts,
  myGrid,
  rivalAttempts,
  rivalGrid,
  onPlayAgain,
}) => {
  const myScore = myAttempts === 'X' ? 99 : myAttempts;
  const rivalScore = rivalAttempts === 'X' ? 99 : rivalAttempts;

  let outcome = '¡Empate!';
  if (myScore < rivalScore) outcome = '🏆 ¡Ganaste tú!';
  else if (myScore > rivalScore) outcome = '🥈 Ganó tu rival';

  const renderMiniGrid = (grid: TileState[][]) => {
    return (
      <div className="mini-grid">
        {grid.map((row, rIdx) => (
          <div key={rIdx} className="mini-row">
            {row.map((tile, tIdx) => (
              <div
                key={tIdx}
                className="mini-tile"
                style={{
                  backgroundColor:
                    tile === 'correct'
                      ? 'var(--color-correct)'
                      : tile === 'present'
                      ? 'var(--color-present)'
                      : 'var(--color-absent)',
                }}
              />
            ))}
          </div>
        ))}
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ textAlign: 'center', fontSize: '1.2rem', fontWeight: 800 }}>
        {outcome}
      </div>

      <div className="compare-container">
        <div className="compare-column">
          <div className="compare-title">TÚ: {myAttempts}/6</div>
          {renderMiniGrid(myGrid)}
        </div>
        <div className="compare-column">
          <div className="compare-title">RIVAL: {rivalAttempts}/6</div>
          {renderMiniGrid(rivalGrid)}
        </div>
      </div>

      {onPlayAgain && (
        <button type="button" className="btn-secondary" onClick={onPlayAgain}>
          Volver a la partida diaria
        </button>
      )}
    </div>
  );
};
