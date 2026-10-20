import React from 'react';
import { Tile } from './Tile';
import { TileState } from '../types';
import { WORD_LENGTH } from '../lib/constants';

interface RowProps {
  guess?: string;
  evaluation?: TileState[];
  isCurrent?: boolean;
  isCompleted?: boolean;
  isShaking?: boolean;
  isWinning?: boolean;
}

export const Row: React.FC<RowProps> = ({
  guess = '',
  evaluation,
  isCompleted = false,
  isShaking = false,
  isWinning = false,
}) => {
  const letters = guess.padEnd(WORD_LENGTH, ' ').slice(0, WORD_LENGTH).split('');

  return (
    <div className={`row ${isShaking ? 'row-shake' : ''}`}>
      {letters.map((char, idx) => {
        const letter = char.trim();
        const state = evaluation ? evaluation[idx] : undefined;
        return (
          <Tile
            key={idx}
            letter={letter}
            state={state}
            isCompleted={isCompleted}
            isWinning={isWinning}
            positionIndex={idx}
          />
        );
      })}
    </div>
  );
};
