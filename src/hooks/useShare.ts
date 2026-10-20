import { useState, useEffect } from 'react';
import { decodeShareToken, decodeGrid } from '../lib/share-codec';
import { RivalComparison } from '../types';

export function useShare() {
  const [rivalComparison, setRivalComparison] = useState<RivalComparison | null>(null);

  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const match = hash.match(/^#\/?c\/(.+)$/);
      if (match) {
        const tokenStr = match[1];
        const token = decodeShareToken(tokenStr);
        if (token) {
          const grid = decodeGrid(token.gridB64);
          setRivalComparison({
            shareToken: token,
            rivalGrid: grid,
            rivalAttempts: token.attempts,
          });
        }
      } else {
        setRivalComparison(null);
      }
    };

    handleHash();
    window.addEventListener('hashchange', handleHash);
    return () => window.removeEventListener('hashchange', handleHash);
  }, []);

  const clearRival = () => {
    window.location.hash = '';
    setRivalComparison(null);
  };

  return {
    rivalComparison,
    clearRival,
  };
}
