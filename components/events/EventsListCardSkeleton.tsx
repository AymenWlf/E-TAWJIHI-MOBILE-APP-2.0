import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonBlock, SKELETON_BG, SKELETON_BG_STRONG, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { homeShell } from '@/theme/homeShell';
import { brand, radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
};

/** Squelette aligné sur une carte événement dans `evenements/index.tsx`. */
export function EventsListCardSkeleton({ isRTL = false, style }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.card, style]}>
      <View style={[styles.cardAccentBar, isRTL && styles.cardAccentBarRtl]} />

      <View style={styles.cardImageWrap}>
        <SkeletonBlock style={styles.cardImage} pulseStyle={pulseStyle} />
        <View style={[styles.cardBadgesRow, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={styles.kindPill} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.livePill} pulseStyle={pulseStyle} />
        </View>
      </View>

      <View style={styles.cardBody}>
        <SkeletonBlock style={styles.cardTitle} pulseStyle={pulseStyle} />
        <SkeletonBlock style={[styles.cardTitle, styles.cardTitleShort]} pulseStyle={pulseStyle} />
        <View style={styles.titleDivider} />

        <View style={styles.metaBlock}>
          {Array.from({ length: 3 }, (_, i) => (
            <View key={i} style={[styles.metaRow, isRTL && styles.rowRtl]}>
              <SkeletonBlock style={styles.metaIcon} pulseStyle={pulseStyle} />
              <View style={styles.metaTextCol}>
                {i === 1 ? (
                  <>
                    <SkeletonBlock style={styles.metaCaption} pulseStyle={pulseStyle} />
                    <SkeletonBlock style={styles.metaLine} pulseStyle={pulseStyle} />
                  </>
                ) : (
                  <SkeletonBlock style={[styles.metaLine, i === 2 && styles.metaLineShort]} pulseStyle={pulseStyle} />
                )}
              </View>
            </View>
          ))}
        </View>

        <View style={[styles.statsRow, isRTL && styles.rowRtl]}>
          <View style={styles.statCell}>
            <SkeletonBlock style={styles.statLabel} pulseStyle={pulseStyle} />
            <SkeletonBlock style={styles.statValue} pulseStyle={pulseStyle} />
          </View>
          <View style={styles.statSep} />
          <View style={styles.statCell}>
            <SkeletonBlock style={styles.statLabel} pulseStyle={pulseStyle} />
            <SkeletonBlock style={styles.statValue} pulseStyle={pulseStyle} />
          </View>
        </View>

        <View style={[styles.cardFooter, isRTL && styles.rowRtl]}>
          <SkeletonBlock style={styles.detailLink} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.detailChevron} pulseStyle={pulseStyle} />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: homeShell.card,
    borderRadius: radius.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: homeShell.borderOnWhite,
    position: 'relative',
  },
  cardAccentBar: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    zIndex: 2,
    backgroundColor: homeShell.green,
    borderTopLeftRadius: radius.xl,
    borderBottomLeftRadius: radius.xl,
  },
  cardAccentBarRtl: {
    left: undefined,
    right: 0,
    borderTopLeftRadius: 0,
    borderBottomLeftRadius: 0,
    borderTopRightRadius: radius.xl,
    borderBottomRightRadius: radius.xl,
  },
  cardImageWrap: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#e2e8f0',
    position: 'relative',
  },
  cardImage: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: SKELETON_BG,
  },
  cardBadgesRow: {
    position: 'absolute',
    left: spacing.sm,
    right: spacing.sm,
    top: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rowRtl: { flexDirection: 'row-reverse' },
  kindPill: {
    width: 72,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG_STRONG,
  },
  livePill: {
    width: 56,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG,
  },
  cardBody: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md + 2,
    paddingBottom: spacing.sm,
  },
  cardTitle: {
    width: '92%',
    height: 20,
    borderRadius: 5,
    backgroundColor: SKELETON_BG_STRONG,
  },
  cardTitleShort: {
    width: '58%',
    marginTop: 8,
  },
  titleDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: 'rgba(15, 23, 42, 0.08)',
    marginTop: spacing.sm,
    marginBottom: spacing.md,
  },
  metaBlock: {
    gap: 10,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm + 2,
    borderRadius: radius.lg,
    backgroundColor: 'rgba(51, 62, 143, 0.05)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.1)',
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  metaIcon: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginTop: 2,
    backgroundColor: SKELETON_BG,
  },
  metaTextCol: { flex: 1, minWidth: 0, gap: 4 },
  metaCaption: {
    width: 64,
    height: 10,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  metaLine: {
    width: '100%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  metaLineShort: { width: '72%' },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.md,
    paddingVertical: spacing.sm + 2,
    paddingHorizontal: spacing.sm,
    backgroundColor: brand.white,
    borderRadius: radius.lg,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(15, 23, 42, 0.08)',
  },
  statCell: { flex: 1, alignItems: 'center', gap: 4 },
  statSep: {
    width: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
    backgroundColor: 'rgba(15,23,42,0.08)',
  },
  statLabel: {
    width: 56,
    height: 9,
    borderRadius: 3,
    backgroundColor: SKELETON_BG,
  },
  statValue: {
    width: 32,
    height: 16,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(15, 23, 42, 0.08)',
  },
  detailLink: {
    flex: 1,
    maxWidth: '70%',
    height: 14,
    borderRadius: 4,
    backgroundColor: SKELETON_BG_STRONG,
  },
  detailChevron: {
    width: 32,
    height: 32,
    borderRadius: radius.full,
    backgroundColor: SKELETON_BG,
  },
});
