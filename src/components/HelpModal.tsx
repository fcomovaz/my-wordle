import React from 'react';
import { Tile } from './Tile';

export const HelpModal: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.9rem' }}>
      <p>
        Adivina la <strong>PALABRA</strong> oculta en 6 intentos. Cada intento debe ser una
        palabra válida de 5 letras en español.
      </p>
      <p>
        Después de cada intento, el color de las fichas cambiará para mostrar qué tan
        cerca estás:
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        <div>
          <div style={{ display: 'flex', gap: 4, width: 180, marginBottom: 4 }}>
            <Tile letter="C" state="correct" />
            <Tile letter="A" />
            <Tile letter="R" />
            <Tile letter="R" />
            <Tile letter="O" />
          </div>
          <div>La letra <strong>C</strong> está en la palabra y en la posición correcta.</div>
        </div>

        <div>
          <div style={{ display: 'flex', gap: 4, width: 180, marginBottom: 4 }}>
            <Tile letter="P" />
            <Tile letter="L" state="present" />
            <Tile letter="A" />
            <Tile letter="Y" />
            <Tile letter="A" />
          </div>
          <div>La letra <strong>L</strong> está en la palabra pero en posición incorrecta.</div>
        </div>

        <div>
          <div style={{ display: 'flex', gap: 4, width: 180, marginBottom: 4 }}>
            <Tile letter="M" />
            <Tile letter="U" />
            <Tile letter="N" state="absent" />
            <Tile letter="D" />
            <Tile letter="O" />
          </div>
          <div>La letra <strong>N</strong> no forma parte de la palabra.</div>
        </div>
      </div>

      <hr style={{ borderColor: 'var(--border-color)', margin: '4px 0' }} />

      <p style={{ color: 'var(--text-secondary)' }}>
        Una palabra nueva cada día a las 00:00 UTC. ¡O crea códigos privados para competir con amigos!
      </p>
    </div>
  );
};
