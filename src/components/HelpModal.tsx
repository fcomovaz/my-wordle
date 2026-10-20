import React from 'react';
import { Tile } from './Tile';

export const HelpModal: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, fontSize: '0.9rem' }}>
      <p>
        <strong>PALABRA</strong> tiene varios modos de juego en español:
      </p>

      <ul style={{ paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 6 }}>
        <li><strong>📅 Palabra:</strong> La palabra del día oficial a las 00:00 UTC.</li>
        <li><strong>📜 Frase:</strong> Refranes y dichos populares para adivinar letra a letra.</li>
        <li><strong>⚡ Racha (Supervivencia):</strong> Palabras encadenadas continuas. ¿Cuántas puedes adivinar sin perder?</li>
        <li><strong>🔑 Sala privada:</strong> Juega con códigos únicos compartibles entre amigos generados al instante.</li>
      </ul>

      <p>
        Significado de los colores al adivinar palabras:
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
    </div>
  );
};
