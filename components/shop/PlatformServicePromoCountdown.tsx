import FontAwesome from '@expo/vector-icons/FontAwesome';
import { StyleSheet, View } from 'react-native';

import { Text } from '@/components/ui/Text';
import type { AppLocale } from '@/constants/i18n';
import { usePlatformServicePromotionCountdown } from '@/hooks/usePlatformServicePromotionCountdown';
import { radius, spacing } from '@/theme/tokens';

type Props = {
  promotionDeadlineAt: string | null | undefined;
  /** Promo active (prix promo < prix catalogue et dans la fenêtre). */
  hasPromo: boolean;
  locale: AppLocale;
  isRTL?: boolean;
  /** `compact` : badge à côté du chip promo · `detail` : ligne sous le prix. */
  variant?: 'compact' | 'detail';
};

export function PlatformServicePromoCountdown({
  promotionDeadlineAt,
  hasPromo,
  locale,
  isRTL = false,
  variant = 'compact',
}: Props) {
  const countdown = usePlatformServicePromotionCountdown(
    promotionDeadlineAt,
    hasPromo,
    locale,
    variant === 'compact',
  );

  if (!countdown) return null;

  if (variant === 'detail') {
    const untilPrefix = locale === 'ar' ? 'حتى ' : "Jusqu'au ";
    return (
      <View style={[styles.detailRow, isRTL && styles.detailRowRtl]}>
        <FontAwesome name="hourglass-half" size={12} color="#B91C1C" />
        <Text style={[styles.detailTxt, isRTL && styles.rtlText]} numberOfLines={2}>
          {untilPrefix}
          {countdown.displayText}
          {' · '}
          {countdown.timeRemaining}
        </Text>
      </View>
    );
  }

  return (
    <View style={[styles.compactChip, isRTL && styles.compactChipRtl]} accessibilityRole="text">
      <FontAwesome name="hourglass-half" size={9} color="#B91C1C" />
      <Text style={[styles.compactTxt, isRTL && styles.rtlText]} numberOfLines={1}>
        {countdown.timeRemaining}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  compactChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    maxWidth: '100%',
    backgroundColor: 'rgba(239,68,68,0.08)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  compactChipRtl: {
    flexDirection: 'row-reverse',
  },
  compactTxt: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B91C1C',
    letterSpacing: 0.2,
    flexShrink: 1,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
  detailRowRtl: {
    flexDirection: 'row-reverse',
  },
  detailTxt: {
    flex: 1,
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
    lineHeight: 17,
  },
  rtlText: {
    textAlign: 'right',
  },
});
