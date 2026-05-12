import { View } from 'react-native';

import type { GlobalWallSenderStats } from '@/services/globalWall';
import { Text as UIText } from '@/components/ui/Text';
import { brand, fontSize } from '@/theme/tokens';

type Variant = 'official' | 'mine';

/**
 * Accusés type WhatsApp : toujours double coche — gris = livré (sur serveur), bleu = vu par d’autres.
 * Le compteur de vues reste affiché dans tous les cas.
 */
export function GlobalWallSenderReceipts({
  stats,
  variant,
  viewsLabel,
}: {
  stats: GlobalWallSenderStats;
  variant: Variant;
  viewsLabel: string;
}) {
  const seen = stats.seenByOthers;
  /** Double coches « lu » (bleu) vs « livré » (gris), comme WhatsApp */
  const checksColor =
    variant === 'mine'
      ? seen
        ? 'rgba(147, 197, 253, 0.98)'
        : 'rgba(255,255,255,0.48)'
      : seen
        ? brand.primary
        : brand.textMuted;

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginBottom: 1 }}>
        <UIText
          style={{
            fontSize: fontSize.sm,
            fontWeight: '800',
            color: checksColor,
            marginRight: -9,
          }}
        >
          ✓
        </UIText>
        <UIText style={{ fontSize: fontSize.sm, fontWeight: '800', color: checksColor }}>✓</UIText>
      </View>
      <UIText
        style={{
          fontSize: 9,
          fontWeight: '600',
          color: variant === 'mine' ? 'rgba(255,255,255,0.88)' : brand.textMuted,
        }}
      >
        {viewsLabel}
      </UIText>
    </View>
  );
}
