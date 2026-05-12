import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

import { brand } from '@/theme/tokens';

type MciName = ComponentProps<typeof MaterialCommunityIcons>['name'];

/**
 * Glyphes Material Community (Expo, hors ligne) : une icône distincte par palier,
 * ambiance quête / progression (pas d’icônes « génériques » du même picto).
 */
const GLYPH_BY_DAYS: Record<7 | 14 | 30 | 60 | 100 | 180 | 365, MciName> = {
  7: 'fire',
  14: 'lightning-bolt',
  30: 'shield-star',
  60: 'crown',
  100: 'trophy-variant',
  180: 'meteor',
  365: 'calendar-star',
};

type QuestMilestoneIconProps = {
  days: number;
  earned: boolean;
  size?: number;
};

export function QuestMilestoneIcon({ days, earned, size = 13 }: QuestMilestoneIconProps) {
  const name: MciName =
    days === 7 || days === 14 || days === 30 || days === 60 || days === 100 || days === 180 || days === 365
      ? GLYPH_BY_DAYS[days]
      : 'star-four-points-outline';

  return (
    <MaterialCommunityIcons
      name={name}
      size={size}
      color={earned ? brand.white : brand.textMuted}
      style={earned ? undefined : { opacity: 0.72 }}
    />
  );
}
