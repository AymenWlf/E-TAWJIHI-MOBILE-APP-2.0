import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { homeShell } from '@/theme/homeShell';
import { fontSize, radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function EstablishmentCardSkeleton({ isRTL = false, style }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.card, isRTL && styles.cardRtl, style]}>
      <SkeletonBlock
        style={[styles.accentBar, isRTL && styles.accentBarRtl]}
        pulseStyle={pulseStyle}
      />

      <View style={[styles.topRow, isRTL && styles.topRowRtl]}>
        <SkeletonBlock style={styles.logo} pulseStyle={pulseStyle} />
        <View style={[styles.titleBlock, isRTL && styles.titleBlockRtl]}>
          <SkeletonBlock style={styles.titleLine} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.sigleLine} pulseStyle={pulseStyle} />
          <View style={[styles.badgeRow, isRTL && styles.badgeRowRtl]}>
            <SkeletonBlock style={styles.badge} pulseStyle={pulseStyle} />
            <SkeletonBlock style={styles.badge} pulseStyle={pulseStyle} />
            <SkeletonBlock style={[styles.badge, styles.badgeWide]} pulseStyle={pulseStyle} />
          </View>
        </View>
        <SkeletonBlock style={styles.chev} pulseStyle={pulseStyle} />
      </View>

      <View style={[styles.rowIcon, isRTL && styles.rowIconRtl]}>
        <SkeletonBlock style={styles.rowIconDot} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.rowTxt} pulseStyle={pulseStyle} />
      </View>

      <SkeletonBlock style={styles.desc} pulseStyle={pulseStyle} />
      <SkeletonBlock style={[styles.desc, styles.descShort]} pulseStyle={pulseStyle} />

      <View style={[styles.metricRow, isRTL && styles.metricRowRtl]}>
        <SkeletonBlock style={styles.metric} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.metric} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.metric} pulseStyle={pulseStyle} />
      </View>

      <View style={[styles.chipRow, isRTL && styles.chipRowRtl]}>
        <SkeletonBlock style={styles.chip} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.chip} pulseStyle={pulseStyle} />
        <SkeletonBlock style={[styles.chip, styles.chipMuted]} pulseStyle={pulseStyle} />
      </View>

      <View style={[styles.actionBar, isRTL && styles.actionBarRtl]}>
        <SkeletonBlock style={styles.followBtn} pulseStyle={pulseStyle} />
        <SkeletonBlock style={styles.iconBtn} pulseStyle={pulseStyle} />
      </View>
    </View>
  );
}

export function EstablishmentCardSkeletonStack({
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
        <EstablishmentCardSkeleton key={i} isRTL={isRTL} />
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
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    padding: spacing.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    position: 'relative',
    width: '100%',
  },
  cardRtl: {
    direction: 'rtl',
  },
  accentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: skStrong,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
  },
  accentBarRtl: {
    left: undefined,
    right: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  topRowRtl: {
    flexDirection: 'row-reverse',
  },
  logo: {
    width: 62,
    height: 62,
    borderRadius: 16,
    backgroundColor: sk,
  },
  titleBlock: {
    flex: 1,
    paddingStart: spacing.md,
    minWidth: 0,
    gap: 6,
  },
  titleBlockRtl: {
    paddingStart: 0,
    paddingEnd: spacing.md,
  },
  titleLine: {
    width: '88%',
    height: fontSize.lg + 4,
    borderRadius: 5,
    backgroundColor: skStrong,
  },
  sigleLine: {
    width: '55%',
    height: 14,
    borderRadius: 4,
    backgroundColor: sk,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  badgeRowRtl: {
    flexDirection: 'row-reverse',
  },
  badge: {
    width: 56,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: sk,
  },
  badgeWide: {
    width: 72,
  },
  chev: {
    width: 14,
    height: 14,
    borderRadius: 3,
    backgroundColor: sk,
    marginStart: spacing.sm,
  },
  rowIcon: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: spacing.md,
    marginStart: 2 + spacing.sm,
  },
  rowIconRtl: {
    flexDirection: 'row-reverse',
    marginStart: 0,
    marginEnd: 2 + spacing.sm,
  },
  rowIconDot: {
    width: 13,
    height: 13,
    borderRadius: 7,
    backgroundColor: sk,
  },
  rowTxt: {
    flex: 1,
    height: 14,
    borderRadius: 4,
    backgroundColor: sk,
    maxWidth: '85%',
  },
  desc: {
    marginTop: spacing.md,
    marginStart: 2 + spacing.sm,
    width: '92%',
    height: 12,
    borderRadius: 4,
    backgroundColor: sk,
  },
  descShort: {
    width: '68%',
    marginTop: 6,
  },
  metricRow: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginStart: 2 + spacing.sm,
  },
  metricRowRtl: {
    marginStart: 0,
    marginEnd: 2 + spacing.sm,
  },
  metric: {
    flexGrow: 1,
    flexBasis: '31%',
    minWidth: '28%',
    height: 52,
    borderRadius: radius.lg,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#EEF2FF',
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: spacing.md,
    marginStart: 2 + spacing.sm,
  },
  chipRowRtl: {
    marginStart: 0,
    marginEnd: 2 + spacing.sm,
  },
  chip: {
    width: 88,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: sk,
  },
  chipMuted: {
    width: 40,
    backgroundColor: sk,
  },
  actionBar: {
    marginTop: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginStart: 2 + spacing.sm,
  },
  actionBarRtl: {
    flexDirection: 'row-reverse',
    marginStart: 0,
    marginEnd: 2 + spacing.sm,
  },
  followBtn: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: sk,
  },
  iconBtn: {
    width: 44,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: sk,
  },
});
