import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { brand, radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
};

/**
 * Placeholder aligné sur `SecteurCard` :
 * cover + favori + titre / code / description + salaire + chips.
 */
export function SecteurCardSkeleton({ isRTL = false, style }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.card, style]}>
      <View style={styles.coverWrap}>
        <SkeletonBlock style={styles.cover} pulseStyle={pulseStyle} />
        <SkeletonBlock
          style={[styles.favBtn, isRTL && styles.favBtnRtl]}
          pulseStyle={pulseStyle}
        />
        <SkeletonBlock
          style={[styles.matchBadge, isRTL && styles.matchBadgeRtl]}
          pulseStyle={pulseStyle}
        />
      </View>

      <View style={[styles.body, isRTL && styles.bodyRtl]}>
        <SkeletonBlock
          style={[styles.title, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          pulseStyle={pulseStyle}
        />
        <SkeletonBlock
          style={[styles.code, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          pulseStyle={pulseStyle}
        />
        <SkeletonBlock
          style={[styles.desc, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          pulseStyle={pulseStyle}
        />
        <SkeletonBlock
          style={[styles.desc, styles.descShort, { alignSelf: isRTL ? 'flex-end' : 'flex-start' }]}
          pulseStyle={pulseStyle}
        />

        <SkeletonBlock style={styles.salaryRow} pulseStyle={pulseStyle} />

        <View style={[styles.chips, isRTL && styles.chipsRtl]}>
          <SkeletonBlock style={styles.chip} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.chip} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.chip, styles.chipShort]} pulseStyle={pulseStyle} />
        </View>
      </View>
    </View>
  );
}

export function SecteurCardSkeletonStack({
  count = 3,
  isRTL = false,
  style,
}: {
  count?: number;
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[styles.stack, style]}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={i > 0 ? styles.stackGap : undefined}>
          <SecteurCardSkeleton isRTL={isRTL} />
        </View>
      ))}
    </View>
  );
}

const sk = 'rgba(51, 62, 143, 0.1)';
const skStrong = 'rgba(51, 62, 143, 0.16)';

const styles = StyleSheet.create({
  stack: {
    width: '100%',
    alignSelf: 'stretch',
  },
  stackGap: {
    marginTop: spacing.md,
  },
  card: {
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    overflow: 'hidden',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
    width: '100%',
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  coverWrap: {
    position: 'relative',
    height: 148,
    backgroundColor: brand.borderLight,
  },
  cover: {
    width: '100%',
    height: '100%',
    borderRadius: 0,
    backgroundColor: brand.borderLight,
  },
  favBtn: {
    position: 'absolute',
    top: spacing.sm,
    left: spacing.sm,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: skStrong,
  },
  favBtnRtl: { left: undefined, right: spacing.sm },
  matchBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    width: 72,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: skStrong,
  },
  matchBadgeRtl: { right: undefined, left: spacing.sm },
  body: {
    padding: spacing.md,
    gap: 6,
  },
  bodyRtl: {
    alignItems: 'stretch',
  },
  title: {
    width: '78%',
    height: 18,
    borderRadius: 5,
    backgroundColor: skStrong,
  },
  code: {
    width: '34%',
    height: 12,
    borderRadius: 4,
    backgroundColor: sk,
  },
  desc: {
    width: '94%',
    height: 12,
    borderRadius: 4,
    marginTop: 2,
    backgroundColor: sk,
  },
  descShort: {
    width: '62%',
  },
  salaryRow: {
    marginTop: 4,
    width: '100%',
    height: 30,
    borderRadius: radius.md,
    backgroundColor: 'rgba(22, 163, 74, 0.1)',
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  chipsRtl: { flexDirection: 'row-reverse' },
  chip: {
    width: 72,
    height: 22,
    borderRadius: radius.sm,
    backgroundColor: sk,
  },
  chipShort: {
    width: 48,
  },
});
