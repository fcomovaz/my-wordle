import React from 'react';
import { Row } from './Row';
import { TileState } from '../types';
import { MAX_ATTEMPTS } from '../lib/constants';

interface BoardProps {
  guesses: string[];
  evaluations: TileState[][];
  currentGuess: string;
  isShaking: boolean;
  isWon: boolean;
}

export const Board: React.FC<BoardProps> = ({
  guesses,
  evaluations,
  currentGuess,
  isShaking,
  isWon,
}) => {
  const rows = [];

  for (let i = 0; i < MAX_ATTEMPTS; i++) {
    const isCompleted = i < guesses.length;
    const isCurrent = i === guesses.length;
    const isWinningRow = isWon && i === guesses.length - 1;

    rows.push(
      <Row
        key={i}
        guess={isCompleted ? guesses[i] : isCurrent ? currentGuess : ''}
        evaluation={isCompleted ? evaluations[i] : undefined}
        isCurrent={isCurrent}
        isCompleted={isCompleted}
        isShaking={isCurrent && isShaking}
        isWinning={isWinningRow}
      />
    );
  }

  return (
    <div className="board-container">
      <div className="board-grid" role="region" aria-label="Tablero de juego">
        {rows}
      </div>
    </div>
  );
};
