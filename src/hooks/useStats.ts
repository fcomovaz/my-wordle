import { useState, useCallback } from 'react';
import { Stats } from '../types';
import { loadStats, saveStats } from '../lib/storage';

export function useStats(corpusId: string) {
  const [stats, setStats] = useState<Stats>(() => loadStats(corpusId));

  const recordGameResult = useCallback(
    (isWon: boolean, attempts: number, dateKey?: string) => {
      setStats((prev) => {
        // Evitar duplicar si es la diaria y ya fue computada hoy
        if (dateKey && prev.lastPlayedDate === dateKey) {
          return prev;
        }

        const played = prev.played + 1;
        const wins = isWon ? prev.wins + 1 : prev.wins;
        const currentStreak = isWon ? prev.currentStreak + 1 : 0;
        const maxStreak = Math.max(prev.maxStreak, currentStreak);

        const distribution = { ...prev.distribution };
        if (isWon && attempts >= 1 && attempts <= 6) {
          const attemptKey = attempts as 1 | 2 | 3 | 4 | 5 | 6;
          distribution[attemptKey] = (distribution[attemptKey] || 0) + 1;
        }

        const newStats: Stats = {
          played,
          wins,
          currentStreak,
          maxStreak,
          distribution,
          lastPlayedDate: dateKey || prev.lastPlayedDate,
        };

        saveStats(corpusId, newStats);
        return newStats;
      });
    },
    [corpusId]
  );

  return {
    stats,
    recordGameResult,
  };
}
