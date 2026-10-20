import React, { useState } from 'react';
import { TileState } from '../types';
import { encodeShareToken, buildShareText, gridToEmoji } from '../lib/share-codec';

interface ShareCardProps {
  corpusId: string;
  seed: string;
  attempts: number | 'X';
  grid: TileState[][];
  onCopied?: () => void;
}

export const ShareCard: React.FC<ShareCardProps> = ({
  corpusId,
  seed,
  attempts,
  grid,
  onCopied,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedUrl, setCopiedUrl] = useState(false);

  const token = encodeShareToken(corpusId, seed, attempts, grid);
  const url = `${window.location.origin}${window.location.pathname}#/c/${token}`;
  const shareText = buildShareText(attempts, grid, url);

  const handleCopyClipboard = async () => {
    try {
      if (navigator.share && /mobile|android|iphone|ipad/i.test(navigator.userAgent)) {
        await navigator.share({
          title: 'Palabra',
          text: shareText,
        });
        return;
      }
    } catch {
      // Fallback a clipboard
    }

    try {
      await navigator.clipboard.writeText(shareText);
      setCopiedText(true);
      if (onCopied) onCopied();
      setTimeout(() => setCopiedText(false), 2000);
    } catch (e) {
      console.error('Error al copiar:', e);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopiedUrl(true);
      if (onCopied) onCopied();
      setTimeout(() => setCopiedUrl(false), 2000);
    } catch (e) {
      console.error('Error al copiar URL:', e);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      <div className="share-preview" aria-label="Resultado en emojis">
        {gridToEmoji(grid)}
      </div>

      <div style={{ display: 'flex', gap: 8 }}>
        <button
          type="button"
          className="btn-primary"
          style={{ flex: 1 }}
          onClick={handleCopyClipboard}
        >
          {copiedText ? '✓ ¡Copiado!' : '📤 Compartir'}
        </button>
        <button
          type="button"
          className="btn-secondary"
          onClick={handleCopyUrl}
          title="Copiar enlace"
        >
          {copiedUrl ? '✓ URL copiada' : '🔗 Copiar URL'}
        </button>
      </div>
    </div>
  );
};
