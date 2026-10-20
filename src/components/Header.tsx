import React from 'react';

interface HeaderProps {
  onOpenHelp: () => void;
  onOpenStats: () => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  modeLabel?: string;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenHelp,
  onOpenStats,
  theme,
  onToggleTheme,
  modeLabel = 'DIARIA',
}) => {
  return (
    <header className="header">
      <div className="header-title-container">
        <h1 className="header-title">PALABRA</h1>
        <span className="header-badge">{modeLabel}</span>
      </div>
      <div className="header-actions">
        <button
          type="button"
          className="icon-btn"
          onClick={onToggleTheme}
          aria-label={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
          title={theme === 'dark' ? 'Modo claro' : 'Modo oscuro'}
        >
          {theme === 'dark' ? '☀️' : '🌙'}
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onOpenStats}
          aria-label="Ver estadísticas"
          title="Estadísticas"
        >
          📊
        </button>
        <button
          type="button"
          className="icon-btn"
          onClick={onOpenHelp}
          aria-label="Cómo jugar"
          title="Ayuda"
        >
          ❓
        </button>
      </div>
    </header>
  );
};
