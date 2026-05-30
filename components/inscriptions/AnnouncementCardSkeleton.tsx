import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { SkeletonBlock, useSkeletonPulse } from '@/components/ui/CardLoadingSkeleton';
import { brand, radius, spacing } from '@/theme/tokens';

type Props = {
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
  withCover?: boolean;
};

export function AnnouncementCardSkeleton({ isRTL = false, style, withCover = true }: Props) {
  const pulseStyle = useSkeletonPulse();

  return (
    <View style={[styles.card, style]}>
      {withCover ? (
        <View style={styles.coverWrap}>
          <SkeletonBlock style={styles.cover} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.coverChip} pulseStyle={pulseStyle} />
        </View>
      ) : (
        <View style={[styles.headerRow, isRTL && styles.bodyRtl]}>
          <SkeletonBlock style={styles.typeChip} pulseStyle={pulseStyle} />
        </View>
      )}

      <View style={[styles.body, isRTL && styles.bodyRtl]}>
        {!withCover ? null : (
          <View style={styles.headerRow}>
            <View style={styles.headerSpacer} />
            <SkeletonBlock style={styles.unreadChip} pulseStyle={pulseStyle} />
          </View>
        )}

        <View style={styles.schoolBlock}>
          <SkeletonBlock style={styles.estLogo} pulseStyle={pulseStyle} />
          <View style={styles.estTextCol}>
            <SkeletonBlock style={styles.estName} pulseStyle={pulseStyle} />
            <SkeletonBlock style={styles.estNameAlt} pulseStyle={pulseStyle} />
            <View style={styles.estMetaRow}>
              <SkeletonBlock style={styles.siglePill} pulseStyle={pulseStyle} />
              <SkeletonBlock style={styles.metaPill} pulseStyle={pulseStyle} />
            </View>
          </View>
        </View>

        <SkeletonBlock style={styles.title} pulseStyle={pulseStyle} />
        <SkeletonBlock style={[styles.title, styles.titleShort]} pulseStyle={pulseStyle} />

        <View style={styles.metaPanel}>
          <SkeletonBlock style={styles.infoLine} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.infoLine} pulseStyle={pulseStyle} />
          <SkeletonBlock style={[styles.infoLine, styles.infoLineShort]} pulseStyle={pulseStyle} />
        </View>

        <SkeletonBlock style={styles.countdown} pulseStyle={pulseStyle} />

        <View style={styles.badgeRow}>
          <SkeletonBlock style={styles.badge} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.badge} pulseStyle={pulseStyle} />
        </View>

        <View style={styles.statusPanel}>
          <SkeletonBlock style={styles.statusBadge} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.statusEditBtn} pulseStyle={pulseStyle} />
        </View>

        <View style={styles.actionsRow}>
          <SkeletonBlock style={styles.btnPrimary} pulseStyle={pulseStyle} />
          <SkeletonBlock style={styles.btnSecondary} pulseStyle={pulseStyle} />
        </View>
      </View>
    </View>
  );
}

export function AnnouncementCardSkeletonStack({
  count = 2,
  isRTL = false,
  style,
  withCover = true,
}: {
  count?: number;
  isRTL?: boolean;
  style?: StyleProp<ViewStyle>;
  withCover?: boolean;
}) {
  return (
    <View style={[styles.stack, style]}>
      {Array.from({ length: count }, (_, i) => (
        <View key={i} style={i > 0 ? styles.stackGap : undefined}>
          <AnnouncementCardSkeleton isRTL={isRTL} withCover={withCover} />
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
    borderStartWidth: 4,
    borderStartColor: skStrong,
    width: '100%',
  },
  coverWrap: {
    position: 'relative',
  },
  cover: {
    width: '100%',
    height: 110,
    backgroundColor: brand.borderLight,
  },
  coverChip: {
    position: 'absolute',
    top: spacing.sm,
    start: spacing.sm,
    width: 88,
    height: 24,
    borderRadius: radius.sm,
    backgroundColor: skStrong,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
  },
  headerSpacer: {
    flex: 1,
  },
  typeChip: {
    width: 120,
    height: 26,
    borderRadius: radius.sm,
    backgroundColor: skStrong,
  },
  unreadChip: {
    width: 72,
    height: 22,
    borderRadius: radius.full,
    backgroundColor: sk,
  },
  body: {
    padding: spacing.md,
    gap: spacing.sm,
  },
  bodyRtl: {
    direction: 'rtl',
    alignItems: 'stretch',
  },
  schoolBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: brand.borderLight,
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  estLogo: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: sk,
  },
  estTextCol: {
    flex: 1,
    minWidth: 0,
    gap: 5,
  },
  estName: {
    width: '78%',
    height: 16,
    borderRadius: 4,
    backgroundColor: skStrong,
  },
  estNameAlt: {
    width: '52%',
    height: 12,
    borderRadius: 4,
    backgroundColor: sk,
  },
  estMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 2,
  },
  siglePill: {
    width: 48,
    height: 18,
    borderRadius: radius.sm,
    backgroundColor: sk,
  },
  metaPill: {
    width: 64,
    height: 14,
    borderRadius: 4,
    backgroundColor: sk,
  },
  title: {
    width: '92%',
    height: 16,
    borderRadius: 4,
    backgroundColor: skStrong,
  },
  titleShort: {
    width: '70%',
    height: 14,
    backgroundColor: sk,
  },
  metaPanel: {
    gap: spacing.xs,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(248, 250, 252, 0.9)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: brand.border,
  },
  infoLine: {
    width: '100%',
    height: 36,
    borderRadius: radius.sm,
    backgroundColor: sk,
  },
  infoLineShort: {
    width: '85%',
  },
  countdown: {
    width: '100%',
    height: 32,
    borderRadius: radius.md,
    backgroundColor: sk,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  badge: {
    width: 88,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: sk,
  },
  statusPanel: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.sm,
    padding: spacing.sm,
    borderRadius: radius.md,
    backgroundColor: 'rgba(51, 62, 143, 0.04)',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: 'rgba(51, 62, 143, 0.12)',
  },
  statusBadge: {
    width: 96,
    height: 24,
    borderRadius: radius.full,
    backgroundColor: sk,
  },
  statusEditBtn: {
    width: 108,
    height: 28,
    borderRadius: radius.full,
    backgroundColor: sk,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  btnPrimary: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: skStrong,
  },
  btnSecondary: {
    flex: 1,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: sk,
  },
});
