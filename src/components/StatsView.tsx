import React from 'react';
import { Stats } from '../types';

interface StatsViewProps {
  stats: Stats;
  lastGuessesCount?: number;
  survivalStreak?: number;
}

export const StatsView: React.FC<StatsViewProps> = ({ stats, lastGuessesCount, survivalStreak }) => {
  const winRate =
    stats.played > 0 ? Math.round((stats.wins / stats.played) * 100) : 0;

  const maxVal = Math.max(
    ...Object.values(stats.distribution),
    1
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      {survivalStreak !== undefined && (
        <div style={{ textAlign: 'center', background: 'var(--bg-secondary)', padding: 10, borderRadius: 'var(--radius-md)' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Racha modo Supervivencia actual</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: 'var(--color-present)' }}>{survivalStreak} 🔥</div>
        </div>
      )}

      <div className="stats-grid">
        <div className="stat-item">
          <span className="stat-value">{stats.played}</span>
          <span className="stat-label">Jugadas</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{winRate}%</span>
          <span className="stat-label">Victorias</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.currentStreak}</span>
          <span className="stat-label">Racha</span>
        </div>
        <div className="stat-item">
          <span className="stat-value">{stats.maxStreak}</span>
          <span className="stat-label">Máxima</span>
        </div>
      </div>

      <div>
        <h3 style={{ fontSize: '1rem', marginBottom: 8, fontWeight: 700 }}>
          DISTRIBUCIÓN DE INTENTOS
        </h3>
        <div className="dist-container">
          {([1, 2, 3, 4, 5, 6] as const).map((num) => {
            const count = stats.distribution[num] || 0;
            const pct = Math.max(7, Math.round((count / maxVal) * 100));
            const isHighlight = lastGuessesCount === num;

            return (
              <div key={num} className="dist-row">
                <span style={{ width: 14, fontWeight: 700 }}>{num}</span>
                <div className="dist-bar-wrapper">
                  <div
                    className={`dist-bar ${isHighlight ? 'dist-bar-win' : ''}`}
                    style={{ width: `${pct}%` }}
                  >
                    {count}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
