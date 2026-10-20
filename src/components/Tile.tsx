import React from 'react';
import { TileState } from '../types';

interface TileProps {
  letter?: string;
  state?: TileState;
  isCompleted?: boolean;
  isWinning?: boolean;
  positionIndex?: number;
}

export const Tile: React.FC<TileProps> = ({
  letter = '',
  state,
  isCompleted = false,
  isWinning = false,
  positionIndex = 0,
}) => {
  let classes = 'tile';
  if (letter && !state) {
    classes += ' tile-filled';
  }
  if (state) {
    classes += ` tile-${state}`;
    if (isCompleted) {
      classes += ' tile-flip';
    }
  }
  if (isWinning) {
    classes += ' tile-bounce';
  }

  const animationDelay = isCompleted ? `${positionIndex * 150}ms` : undefined;

  const stateAria = state
    ? state === 'correct'
      ? 'correcta'
      : state === 'present'
      ? 'en otra posición'
      : 'no está en la palabra'
    : letter
    ? 'escrita'
    : 'vacía';

  return (
    <div
      className={classes}
      style={{ animationDelay }}
      aria-label={letter ? `Letra ${letter}, ${stateAria}` : 'Casilla vacía'}
      role="text"
    >
      {letter}
    </div>
  );
};
